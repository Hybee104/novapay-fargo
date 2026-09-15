import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logAuthEvent } from "@/lib/auth";
import { validateTransfer } from "@/lib/validation";
import { generateTransactionReference } from "@/lib/references";
import { BANK_NOVAPAY } from "@/lib/constants";
import { money, round2 } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!user.account) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const result = validateTransfer(body);
  if (!result.ok || !result.value) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", errors: result.errors }, { status: 400 });
  }

  const { recipientName, recipientEmail, recipientReference, amount, currency, purpose, description } = result.value;
  const currentBalance = money(user.account.balance);

  if (amount > currentBalance) {
    return NextResponse.json(
      {
        error: "Insufficient available funds.",
        insufficientFunds: true,
        available: currentBalance,
      },
      { status: 400 },
    );
  }

  const newBalance = round2(currentBalance - amount);
  const reference = generateTransactionReference();

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        bank: BANK_NOVAPAY,
        transactionReference: reference,
        type: "Transfer",
        amount: -amount,
        currency,
        recipientName,
        recipientReference,
        recipientEmail,
        description: description || purpose,
        category: purpose,
        status: "PENDING",
        runningBalance: newBalance,
      },
    }),
    prisma.account.updateMany({
      where: { userId: user.id, bank: BANK_NOVAPAY },
      data: { balance: newBalance },
    }),
    prisma.balanceHistory.create({
      data: {
        userId: user.id,
        bank: BANK_NOVAPAY,
        date: new Date(),
        balance: newBalance,
      },
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        bank: BANK_NOVAPAY,
        type: "transfer",
        title: "Transfer Pending",
        message: `Your transfer of $${money(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} to ${recipientName} is pending and reserved from your available balance.`,
      },
    }),
  ]);

  await logAuthEvent(user.id, "TRANSFER_CREATED", { userAgent: req.headers.get("user-agent") });

  return NextResponse.json({
    ok: true,
    transaction: {
      id: transaction.id,
      transactionReference: reference,
      amount: -amount,
      status: "PENDING",
      availableBalance: newBalance,
    },
    message: "Transfer created and marked as pending.",
  });
}

export async function GET(req: Request) {
  void req;
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}