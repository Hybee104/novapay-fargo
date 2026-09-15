import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateProfile } from "@/lib/validation";
import { BANK_NOVAPAY } from "@/lib/constants";
import { money } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const account = await prisma.account.findFirst({
    where: { userId: user.id, bank: BANK_NOVAPAY },
  });

  return NextResponse.json({
    profile: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    },
    account: account
      ? {
          type: account.type,
          shortType: account.type,
          currency: account.currency,
          accountNumber: account.accountNumber,
          routingNumber: account.routingNumber,
          status: account.status,
          balance: money(account.balance),
          createdAt: account.createdAt.toISOString(),
        }
      : null,
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const result = validateProfile(body);
  if (!result.ok || !result.value) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", errors: result.errors }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: result.value.firstName.trim(),
      lastName: result.value.lastName.trim(),
      phone: result.value.phone?.trim() || null,
    },
    select: { firstName: true, lastName: true, email: true, phone: true },
  });

  return NextResponse.json({ ok: true, profile: updated });
}