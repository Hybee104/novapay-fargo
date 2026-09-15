import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BANK_FARGO } from "@/lib/constants";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const result = await prisma.notification.updateMany({
    where: { userId: user.id, bank: BANK_FARGO, read: false },
    data: { read: true },
  });
  return NextResponse.json({ ok: true, updated: result.count });
}