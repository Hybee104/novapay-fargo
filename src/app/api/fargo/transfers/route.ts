import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { listFargoTransactions, createFargoNotification } from "@/lib/fargo";
import { validateFargoTransfer } from "@/lib/fargoValidation";
import { generateFargoTransferReference, generateTransactionReference } from "@/lib/references";
import { BANK_NOVAPAY, BANK_FARGO } from "@/lib/constants";
import { money, round2 } from "@/lib/utils";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const url = new URL(req.url);
  const data = await listFargoTransactions(user.id, {
    type: url.searchParams.get("type") ?? "Transfer",
    status: url.searchParams.get("status") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
    pageSize: url.searchParams.get("pageSize") ? Number(url.searchParams.get("pageSize")) : undefined,
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const result = validateFargoTransfer(body);
  if (!result.ok || !result.value) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", errors: result.errors }, { status: 400 });
  }

  const { amount, description } = result.value;

  const [novaAccount, fargoAccount] = await Promise.all([
    prisma.account.findFirst({ where: { userId: user.id, bank: BANK_NOVAPAY } }),
    prisma.account.findFirst({ where: { userId: user.id, bank: BANK_FARGO } }),
  ]);

  if (!novaAccount || !fargoAccount) {
    return NextResponse.json({ error: "Accounts not found." }, { status: 400 });
  }

  const novaBalance = money(novaAccount.balance);
  const fargoBalance = money(fargoAccount.balance);

  if (amount > novaBalance) {
    return NextResponse.json(
      { error: "Insufficient NovaPAY funds.", insufficientFunds: true, available: novaBalance },
      { status: 400 },
    );
  }

  const novaNew = round2(novaBalance - amount);
  const fargoNew = round2(fargoBalance + amount);
  const novaRef = generateTransactionReference();
  const ref = generateFargoTransferReference();

  const result2 = await prisma.$transaction(async (tx) => {
    const sourceTx = await tx.transaction.create({
      data: {
        userId: user.id,
        bank: BANK_NOVAPAY,
        transactionReference: novaRef,
        type: "Transfer",
        amount: -amount,
        currency: "USD",
        recipientName: "Fargo Transfer",
        recipientReference: fargoAccount.accountNumber,
        description: description ?? "Internal transfer to Fargo",
        category: "Internal Transfer",
        status: "COMPLETED",
        runningBalance: novaNew,
      },
    });

    const destTx = await tx.transaction.create({
      data: {
        userId: user.id,
        bank: BANK_FARGO,
        transactionReference: ref,
        type: "Transfer",
        amount: amount,
        currency: "USD",
        recipientName: "NovaPAY Transfer",
        recipientReference: novaAccount.accountNumber,
        description: description ?? "Internal transfer from NovaPAY",
        category: "Internal Transfer",
        status: "COMPLETED",
        runningBalance: null,
      },
    });

    await tx.internalTransfer.create({
      data: {
        transferReference: ref,
        userId: user.id,
        sourceAccountId: novaAccount.id,
        destinationAccountId: fargoAccount.id,
        amount: amount,
        currency: "USD",
        description: description ?? "Internal transfer from NovaPAY",
        status: "COMPLETED",
        sourceTransactionId: sourceTx.id,
        destinationTransactionId: destTx.id,
      },
    });

    await Promise.all([
      tx.account.updateMany({ where: { userId: user.id, bank: BANK_NOVAPAY }, data: { balance: novaNew } }),
      tx.account.updateMany({ where: { userId: user.id, bank: BANK_FARGO }, data: { balance: fargoNew } }),
    ]);

    return { ref, novaNew, fargoNew };
  });

  await Promise.all([
    prisma.balanceHistory.create({
      data: { userId: user.id, bank: BANK_NOVAPAY, date: new Date(), balance: result2.novaNew },
    }),
    prisma.balanceHistory.create({
      data: { userId: user.id, bank: BANK_FARGO, date: new Date(), balance: result2.fargoNew },
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        bank: BANK_NOVAPAY,
        type: "transfer",
        title: "Transfer Completed",
        message: `Your internal transfer of $${money(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} to Fargo has been completed.`,
      },
    }),
    createFargoNotification(user.id, {
      type: "credit",
      title: "Funds Received",
      message: `You received $${money(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} from NovaPAY.`,
    }),
  ]);

  return NextResponse.json({
    ok: true,
    transferReference: result2.ref,
    novaAvailableBalance: result2.novaNew,
    fargoAvailableBalance: result2.fargoNew,
    message: "Transfer completed.",
  });
}
