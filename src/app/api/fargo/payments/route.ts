import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { listFargoTransactions, createFargoNotification, getFargoAccount } from "@/lib/fargo";
import { validateFargoPayment } from "@/lib/fargoValidation";
import { generateFargoPaymentReference } from "@/lib/references";
import { money, round2 } from "@/lib/utils";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const url = new URL(req.url);
  const data = await listFargoTransactions(user.id, {
    type: url.searchParams.get("type") ?? undefined,
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
  const result = validateFargoPayment(body);
  if (!result.ok || !result.value) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", errors: result.errors }, { status: 400 });
  }

  const { recipientName, description, amount, category } = result.value;

  const account = await getFargoAccount(user.id);
  if (!account) {
    return NextResponse.json({ error: "Fargo account not found." }, { status: 400 });
  }

  const currentBalance = money(account.balance);
  if (amount > currentBalance) {
    return NextResponse.json(
      { error: "Insufficient available funds.", insufficientFunds: true, available: currentBalance },
      { status: 400 },
    );
  }

  const newBalance = round2(currentBalance - amount);
  const reference = generateFargoPaymentReference();

  await prisma.$transaction(async (tx) => {
    const txn = await tx.transaction.create({
      data: {
        userId: user.id,
        bank: "FARGO",
        transactionReference: reference,
        type: "Payment",
        amount: -amount,
        currency: "USD",
        recipientName,
        description,
        category,
        status: "PENDING",
        runningBalance: newBalance,
      },
    });

    await tx.payment.create({
      data: {
        paymentReference: reference,
        userId: user.id,
        accountId: account.id,
        transactionId: txn.id,
        recipientName,
        description,
        amount,
        category,
        status: "PENDING",
      },
    });

    await tx.account.updateMany({
      where: { userId: user.id, bank: "FARGO" },
      data: { balance: newBalance },
    });

    await tx.balanceHistory.create({
      data: {
        userId: user.id,
        bank: "FARGO",
        date: new Date(),
        balance: newBalance,
      },
    });
  });

  await createFargoNotification(user.id, {
    type: "payment",
    title: "Payment Pending",
    message: `Your payment of $${money(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} to ${recipientName} is pending and reserved from your available balance.`,
  });

  return NextResponse.json({
    ok: true,
    paymentReference: reference,
    availableBalance: newBalance,
    message: "Payment created and reserved.",
  });
}
