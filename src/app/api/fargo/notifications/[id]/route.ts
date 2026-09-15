import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BANK_FARGO } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await prisma.notification.updateMany({
    where: { id, userId: user.id, bank: BANK_FARGO },
    data: { read: true },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}