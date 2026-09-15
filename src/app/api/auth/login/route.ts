import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuthEvent, setSessionCookie, verifyPassword } from "@/lib/auth";
import { validateLogin } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const result = validateLogin(body);

  if (!result.ok || !result.value) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", errors: result.errors },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: result.value.email },
    include: { accounts: true },
  });

  if (!user) {
    await prisma.user
      .findFirst({ where: { email: result.value.email } })
      .then(async (u) => {
        if (u) await logAuthEvent(u.id, "LOGIN_FAILED", { userAgent: req.headers.get("user-agent") });
      })
      .catch(() => {});
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const valid = await verifyPassword(result.value.password, user.passwordHash);
  if (!valid) {
    await logAuthEvent(user.id, "LOGIN_FAILED", { userAgent: req.headers.get("user-agent") });
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await setSessionCookie(user.id);
  await logAuthEvent(user.id, "LOGIN", { userAgent: req.headers.get("user-agent") });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
  });
}