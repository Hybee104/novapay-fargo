import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, logAuthEvent, verifyPassword } from "@/lib/auth";
import { validatePasswordChange } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const result = validatePasswordChange(body);
  if (!result.ok || !result.value) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", errors: result.errors }, { status: 400 });
  }

  const current = await prisma.user.findUnique({ where: { id: user.id } });
  const valid = current ? await verifyPassword(result.value.currentPassword, current.passwordHash) : false;
  if (!valid) {
    return NextResponse.json(
      { error: "Current password is incorrect.", errors: { currentPassword: "Current password is incorrect." } },
      { status: 400 },
    );
  }

  const newHash = await hashPassword(result.value.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
  await logAuthEvent(user.id, "PASSWORD_CHANGE", { userAgent: req.headers.get("user-agent") });

  return NextResponse.json({ ok: true });
}