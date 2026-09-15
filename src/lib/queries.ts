import { prisma } from "@/lib/prisma";
import { money, round2, startOfMonth } from "@/lib/utils";
import { BANK_NOVAPAY } from "@/lib/constants";

export const userInclude = { accounts: true } as const;

export type TransactionDto = {
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
};

export function toTransactionDto(t: {
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

export interface RecentActivityItem {
  id: string;
  recipientName: string;
  description: string | null;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
}

export async function getDashboardData(userId: string) {
  const [account, pending, totals, monthly, recentRows] = await Promise.all([
    prisma.account.findFirst({ where: { userId, bank: BANK_NOVAPAY } }),
    prisma.transaction.findMany({
      where: { userId, bank: BANK_NOVAPAY, status: "PENDING" },
      select: { amount: true },
    }),
    prisma.transaction.count({ where: { userId, bank: BANK_NOVAPAY } }),
    prisma.transaction.findMany({
      where: {
        userId,
        bank: BANK_NOVAPAY,
        createdAt: { gte: startOfMonth() },
      },
      select: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId, bank: BANK_NOVAPAY },
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
  ]);

  const pendingDebits = pending
    .filter((p) => money(p.amount) < 0)
    .reduce((sum, p) => sum + Math.abs(money(p.amount)), 0);
  const pendingCredits = pending
    .filter((p) => money(p.amount) > 0)
    .reduce((sum, p) => sum + money(p.amount), 0);

  const monthlySpending = monthly
    .filter((m) => money(m.amount) < 0)
    .reduce((sum, m) => sum + Math.abs(money(m.amount)), 0);
  const monthlyCredits = monthly
    .filter((m) => money(m.amount) > 0)
    .reduce((sum, m) => sum + money(m.amount), 0);

  const recent: RecentActivityItem[] = recentRows.map((r) => ({
    id: r.id,
    recipientName: r.recipientName,
    description: r.description,
    amount: money(r.amount),
    status: r.status,
    type: r.type,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    balance: money(account?.balance ?? 0),
    accountNumber: account?.accountNumber ?? null,
    pendingCount: pending.length,
    pendingDebits,
    pendingCredits,
    totalTransactions: totals,
    monthlySpending,
    monthlyCredits,
    recent,
  };
}

export interface TransactionFilters {
  search?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export async function listTransactions(userId: string, filters: TransactionFilters = {}) {
  const { search, type, status, from, to } = filters;
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const pageSize = Math.min(50, Math.max(5, Math.floor(filters.pageSize ?? 10)));

  const where: Record<string, unknown> = { userId, bank: BANK_NOVAPAY };

  if (type && ["Transfer", "Deposit", "Withdrawal", "Payment", "Refund"].includes(type)) {
    where.type = type;
  }
  if (status && ["COMPLETED", "PENDING"].includes(status)) {
    where.status = status;
  }
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

  return {
    transactions: rows.map(toTransactionDto),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPendingTransactions(userId: string) {
  const rows = await prisma.transaction.findMany({
    where: { userId, bank: BANK_NOVAPAY, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toTransactionDto);
}

export async function getTransactionById(userId: string, id: string) {
  const row = await prisma.transaction.findFirst({
    where: { id, userId, bank: BANK_NOVAPAY },
  });
  if (!row) return null;
  return toTransactionDto(row);
}

export type BalanceRange = "7d" | "30d" | "6m" | "1y" | "all";

export async function getBalanceSeries(userId: string, range: BalanceRange = "all") {
  const now = new Date();
  let since: Date | null = null;

  if (range === "7d") since = new Date(now.getTime() - 7 * 864e5);
  else if (range === "30d") since = new Date(now.getTime() - 30 * 864e5);
  else if (range === "6m") since = new Date(now.setMonth(now.getMonth() - 6));
  else if (range === "1y") since = new Date(now.setFullYear(now.getFullYear() - 1));

  const rows = await prisma.balanceHistory.findMany({
    where: {
      userId,
      bank: BANK_NOVAPAY,
      ...(since ? { date: { gte: since } } : {}),
    },
    orderBy: { date: "asc" },
    select: { date: true, balance: true },
  });

  const points = rows.map((r) => ({ date: r.date, balance: money(r.balance) }));

  // Downsample to keep charts light.
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

export async function getNotifications(userId: string) {
  const rows = await prisma.notification.findMany({
    where: { userId, bank: BANK_NOVAPAY },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, bank: BANK_NOVAPAY, read: false } });
}

export async function createNotification(
  userId: string,
  data: { title: string; message: string; type?: string; bank?: string },
) {
  return prisma.notification.create({
    data: {
      userId,
      bank: data.bank ?? BANK_NOVAPAY,
      title: data.title,
      message: data.message,
      type: data.type ?? "system",
    },
  });
}

export interface MonthPoint {
  key: string;
  label: string;
  spending: number;
  credits: number;
}

export async function getMonthlyBreakdown(userId: string, months = 6): Promise<MonthPoint[]> {
  const labels: string[] = [];
  const keys: string[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    labels.push(d.toLocaleDateString("en-US", { month: "short" }));
  }
  const since = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const rows = await prisma.transaction.findMany({
    where: { userId, bank: BANK_NOVAPAY, createdAt: { gte: since } },
    select: { amount: true, createdAt: true },
  });

  const map = new Map<string, { spending: number; credits: number }>();
  keys.forEach((k) => map.set(k, { spending: 0, credits: 0 }));
  for (const r of rows) {
    const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const entry = map.get(key);
    if (!entry) continue;
    const amt = money(r.amount);
    if (amt < 0) entry.spending += Math.abs(amt);
    else entry.credits += amt;
  }
  return keys.map((k, i) => ({
    key: k,
    label: labels[i],
    spending: round2(map.get(k)?.spending ?? 0),
    credits: round2(map.get(k)?.credits ?? 0),
  }));
}