import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, logAuthEvent, setSessionCookie } from "@/lib/auth";
import { validateRegister } from "@/lib/validation";
import { BANK_FARGO, BANK_NOVAPAY, DEMO_ACCOUNT, FARGO_ACCOUNT } from "@/lib/constants";
import { money } from "@/lib/utils";

const WELCOME_CREDIT = 50000;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const result = validateRegister(body);

  if (!result.ok || !result.value) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", errors: result.errors },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: result.value.email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists.", errors: { email: "Email is already registered." } },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(result.value.password);
  const novaAccountNumber = `${Math.floor(1000 + Math.random() * 9000)}-XXXX`;
  const fargoAccountNumber = `${Math.floor(1000 + Math.random() * 9000)}-XXXX`;

  const user = await prisma.user.create({
    data: {
      firstName: result.value.firstName,
      lastName: result.value.lastName,
      email: result.value.email,
      passwordHash,
      accounts: {
        create: [
          {
            bank: BANK_NOVAPAY,
            type: DEMO_ACCOUNT.type,
            currency: DEMO_ACCOUNT.currency,
            accountNumber: novaAccountNumber,
            routingNumber: DEMO_ACCOUNT.routingNumber,
            status: DEMO_ACCOUNT.status,
            balance: WELCOME_CREDIT,
          },
          {
            bank: BANK_FARGO,
            type: FARGO_ACCOUNT.type,
            currency: FARGO_ACCOUNT.currency,
            accountNumber: fargoAccountNumber,
            routingNumber: FARGO_ACCOUNT.routingNumber,
            status: FARGO_ACCOUNT.status,
            balance: FARGO_ACCOUNT.initialBalance,
          },
        ],
      },
      transactions: {
        create: {
          bank: BANK_NOVAPAY,
          transactionReference: `SIM-TXN-${new Date().getFullYear()}-WELCOME-${crypto.randomUUID()}`,
          type: "Deposit",
          amount: WELCOME_CREDIT,
          currency: "USD",
          recipientName: "NovaPAY Bank",
          recipientReference: novaAccountNumber,
          description: "Opening welcome credit",
          category: "Welcome",
          status: "COMPLETED",
        },
      },
      balanceHistory: {
        create: {
          bank: BANK_NOVAPAY,
          date: new Date(),
          balance: WELCOME_CREDIT,
        },
      },
      notifications: {
        create: [
          {
            bank: BANK_NOVAPAY,
            title: "Welcome to NovaPAY Bank",
            message: `Your account is ready with an opening balance of $${money(WELCOME_CREDIT).toLocaleString("en-US", { minimumFractionDigits: 2 })}.`,
            type: "system",
          },
          {
            bank: BANK_FARGO,
            title: "Welcome to Fargo",
            message:
              "Your Digital Checking Account is ready with a $0.00 opening balance. Transfer funds in from NovaPAY to get started.",
            type: "system",
          },
        ],
      },
    },
  });

  await setSessionCookie(user.id);
  await logAuthEvent(user.id, "REGISTER", { userAgent: req.headers.get("user-agent") });

  return NextResponse.json({ ok: true, user: { id: user.id, firstName: user.firstName, email: user.email } });
}