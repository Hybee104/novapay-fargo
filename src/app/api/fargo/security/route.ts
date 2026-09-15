import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PREF_KEYS = [
  "twoFactorEnabled",
  "biometricEnabled",
  "securityNotificationsEnabled",
  "transactionAlertsEnabled",
] as const;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const activity = await prisma.loginActivity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: { id: true, event: true, ip: true, userAgent: true, createdAt: true },
  });

  return NextResponse.json({
    preferences: {
      twoFactorEnabled: user.twoFactorEnabled,
      biometricEnabled: user.biometricEnabled,
      securityNotificationsEnabled: user.securityNotificationsEnabled,
      transactionAlertsEnabled: user.transactionAlertsEnabled,
    },
    activity: activity.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data: Record<string, boolean> = {};

  for (const key of PREF_KEYS) {
    if (typeof body[key] === "boolean") data[key] = body[key];
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: {
      twoFactorEnabled: true,
      biometricEnabled: true,
      securityNotificationsEnabled: true,
      transactionAlertsEnabled: true,
    },
  });

  return NextResponse.json({ ok: true, preferences: updated });
}