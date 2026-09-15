// Fargo — the second simulated banking environment inside the same database.
// All queries are scoped by `bank: "FARGO"` so NovaPAY and Fargo ledgers never
// mix, even though both accounts belong to the same authenticated user.

import { prisma } from "@/lib/prisma";
import { BANK_FARGO, FARGO_ACCOUNT } from "@/lib/constants";
import { money, round2, startOfMonth } from "@/lib/utils";

export function toFargoTransactionDto(t: {
  id: string;
  transactionReference: string;
  type: string;
  amount: { toNumber: () => number } | number | string;
  currency: string;
  recipientName: string;
  recipientReference: string | null;
  recipientEmail: string | null;
  description: string | null;
  category: string | null;
  status: string;
  runningBalance: { toNumber: () => number } | number | string | null;
  createdAt: Date;
}): TransactionDto {
  return {
    id: t.id,
    transactionReference: t.transactionReference,
    type: t.type,
    amount: money(t.amount),
    currency: t.currency,
    recipientName: t.recipientName,
    recipientReference: t.recipientReference,
    recipientEmail: t.recipientEmail,
    description: t.description,
    category: t.category,
    status: t.status,
    runningBalance: t.runningBalance == null ? null : money(t.runningBalance),
    createdAt: t.createdAt.toISOString(),
  };
}

export interface TransactionDto {
  id: string;
  transactionReference: string;
  type: string;
  amount: number;
  currency: string;
  recipientName: string;
  recipientReference: string | null;
  recipientEmail: string | null;
  description: string | null;
  category: string | null;
  status: string;
  runningBalance: number | null;
  createdAt: string;
}

export async function getFargoAccount(userId: string) {
  return prisma.account.findFirst({ where: { userId, bank: BANK_FARGO } });
}

// The Fargo opening balance is always $0.00. Running balances are computed from
// the chronological ledger so they stay mathematically consistent with the
// stored account balance.
function computeRunningBalances(rows: TransactionDto[], opening: number): TransactionDto[] {
  let running = opening;
  const withRunning = rows.map((r) => {
    running = round2(running + r.amount);
    return { ...r, runningBalance: running };
  });
  return withRunning;
}

export async function listFargoTransactions(
  userId: string,
  filters: {
    search?: string;
    type?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  } = {},
) {
  const { search, type, status, from, to } = filters;
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const pageSize = Math.min(50, Math.max(5, Math.floor(filters.pageSize ?? 10)));

  const where: Record<string, unknown> = { userId, bank: BANK_FARGO };

  const validTypes = ["Transfer", "Payment", "Deposit", "Refund"];
  const validStatuses = ["COMPLETED", "PENDING"];
  if (type && validTypes.includes(type)) where.type = type;
  if (status && validStatuses.includes(status)) where.status = status;
  if (from || to) {
    const dateRange: { gte?: Date; lte?: Date } = {};
    if (from) dateRange.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateRange.lte = toDate;
    }
    where.createdAt = dateRange;
  }
  if (search && search.trim() !== "") {
    const q = search.trim();
    const numeric = Number(q.replace(/,/g, ""));
    where.OR = [
      { recipientName: { contains: q } },
      { description: { contains: q } },
      { transactionReference: { contains: q.toUpperCase() } },
      ...(Number.isFinite(numeric) && q.trim() !== "" ? [{ amount: Math.abs(numeric) }] : []),
      { category: { contains: q } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  const descending = rows.map(toFargoTransactionDto);
  // Reverse to chronological order, compute running balances from $0.00, then
  // flip back to newest-first for display.
  const ascending = descending.slice().reverse();
  const withRunning = computeRunningBalances(ascending, FARGO_ACCOUNT.initialBalance);
  const transactions = withRunning.slice().reverse();

  return {
    transactions,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getFargoTransactionById(userId: string, id: string) {
  const row = await prisma.transaction.findFirst({
    where: { id, userId, bank: BANK_FARGO },
  });
  if (!row) return null;

  // Build the chronological ledger to compute this row's running balance.
  const allRows = await prisma.transaction.findMany({
    where: { userId, bank: BANK_FARGO },
    orderBy: { createdAt: "asc" },
  });
  let running = FARGO_ACCOUNT.initialBalance;
  let matched: TransactionDto | null = null;
  for (const r of allRows) {
    const dto = toFargoTransactionDto(r);
    running = round2(running + dto.amount);
    if (r.id === id) matched = { ...dto, runningBalance: running };
  }
  return matched ?? toFargoTransactionDto(row);
}

export async function getFargoPendingPayments(userId: string) {
  const rows = await prisma.transaction.findMany({
    where: { userId, bank: BANK_FARGO, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: { payment: true },
  });
  return rows.map((r) => {
    const dto = toFargoTransactionDto(r);
    return {
      ...dto,
      paymentReference: r.payment?.paymentReference ?? null,
    };
  });
}

export async function getFargoDashboardData(userId: string) {
  const account = await getFargoAccount(userId);
  const accountId = account?.id ?? null;

  const [pendingRows, totals, monthlyRows, recentRows, incomingTotal, notificationsUnread] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, bank: BANK_FARGO, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.count({ where: { userId, bank: BANK_FARGO } }),
    prisma.transaction.findMany({
      where: { userId, bank: BANK_FARGO, createdAt: { gte: startOfMonth() } },
      select: { amount: true, status: true },
    }),
    prisma.transaction.findMany({
      where: { userId, bank: BANK_FARGO },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        recipientName: true,
        description: true,
        amount: true,
        status: true,
        type: true,
        createdAt: true,
      },
    }),
    prisma.transaction.aggregate({
      where: { userId, bank: BANK_FARGO, amount: { gt: 0 }, status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.notification.count({ where: { userId, bank: BANK_FARGO, read: false } }),
  ]);

  const pendingPayments = pendingRows
    .filter((p) => money(p.amount) < 0)
    .map((p) => toFargoTransactionDto(p));
  const pendingReserved = pendingPayments.reduce((sum, p) => sum + Math.abs(p.amount), 0);
  const pendingCredits = pendingRows
    .filter((p) => money(p.amount) > 0)
    .map((p) => toFargoTransactionDto(p));

  const monthlyPayments = monthlyRows
    .filter((m) => money(m.amount) < 0)
    .reduce((sum, m) => sum + Math.abs(money(m.amount)), 0);
  const monthlyCredits = monthlyRows
    .filter((m) => money(m.amount) > 0)
    .reduce((sum, m) => sum + money(m.amount), 0);

  return {
    account: account
      ? {
          id: account.id,
          type: account.type,
          currency: account.currency,
          accountNumber: account.accountNumber,
          routingNumber: account.routingNumber,
          status: account.status,
          balance: money(account.balance),
          createdAt: account.createdAt.toISOString(),
        }
      : null,
    accountId,
    availableBalance: money(account?.balance ?? 0),
    pendingPayments,
    pendingCredits,
    pendingReserved,
    pendingCount: pendingPayments.length,
    totalTransactions: totals,
    monthlyPayments,
    monthlyCredits,
    incomingTransfersTotal: money(incomingTotal._sum.amount),
    notificationsUnread,
    recent: recentRows.map((r) => ({
      id: r.id,
      recipientName: r.recipientName,
      description: r.description,
      amount: money(r.amount),
      status: r.status,
      type: r.type,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function getFargoBalanceSeries(userId: string, range: "7d" | "30d" | "6m" | "1y" | "all" = "all") {
  const now = new Date();
  let since: Date | null = null;

  if (range === "7d") since = new Date(now.getTime() - 7 * 864e5);
  else if (range === "30d") since = new Date(now.getTime() - 30 * 864e5);
  else if (range === "6m") since = new Date(now.setMonth(now.getMonth() - 6));
  else if (range === "1y") since = new Date(now.setFullYear(now.getFullYear() - 1));

  const rows = await prisma.balanceHistory.findMany({
    where: {
      userId,
      bank: BANK_FARGO,
      ...(since ? { date: { gte: since } } : {}),
    },
    orderBy: { date: "asc" },
    select: { date: true, balance: true },
  });

  const points = rows.map((r) => ({ date: r.date, balance: money(r.balance) }));

  const MAX = 120;
  if (points.length > MAX) {
    const step = Math.ceil(points.length / MAX);
    const sampled: typeof points = [];
    for (let i = 0; i < points.length; i += step) sampled.push(points[i]);
    if (sampled[sampled.length - 1] !== points[points.length - 1]) sampled.push(points[points.length - 1]);
    return sampled;
  }
  return points;
}

export async function getFargoNotifications(userId: string) {
  const rows = await prisma.notification.findMany({
    where: { userId, bank: BANK_FARGO },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function getFargoUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, bank: BANK_FARGO, read: false } });
}

export async function createFargoNotification(
  userId: string,
  data: { title: string; message: string; type?: string },
) {
  return prisma.notification.create({
    data: {
      userId,
      bank: BANK_FARGO,
      title: data.title,
      message: data.message,
      type: data.type ?? "system",
    },
  });
}

export async function getFargoConversations(userId: string) {
  const rows = await prisma.supportConversation.findMany({
    where: { userId, bank: BANK_FARGO },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    subject: c.subject,
    agentName: c.agentName,
    status: c.status,
    updatedAt: c.updatedAt.toISOString(),
    preview: c.messages[0]?.body ?? "No messages yet",
    messageCount: c._count.messages,
    lastSender: c.messages[0]?.senderName ?? "",
  }));
}

export async function getFargoTickets(userId: string) {
  const rows = await prisma.supportTicket.findMany({
    where: { userId, bank: BANK_FARGO },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((t) => ({
    id: t.id,
    ticketReference: t.ticketReference,
    subject: t.subject,
    category: t.category,
    priority: t.priority,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  }));
}