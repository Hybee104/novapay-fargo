import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, logAuthEvent } from "@/lib/auth";

type AdminUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  accountCount: number;
};

function toRow(u: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: Date;
  _count: { accounts: number };
}): AdminUserRow {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    isActive: u.isActive,
    isAdmin: u.isAdmin,
    createdAt: u.createdAt.toISOString(),
    accountCount: u._count.accounts,
  };
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const [users, total, active, deactivated] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { accounts: true } } },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
  ]);

  return NextResponse.json({
    stats: { total, active, deactivated },
    users: users.map(toRow),
  });
}

export async function PATCH(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await req.json().catch(() => null) as { userId?: unknown; isActive?: unknown } | null;
  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
  const isActive = typeof body?.isActive === "boolean" ? body.isActive : null;

  if (!userId || isActive === null) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", errors: { userId: !userId ? "User is required." : "", isActive: isActive === null ? "A status is required." : "" } },
      { status: 400 },
    );
  }

  // Guard: an admin must not be able to lock themselves out of the dashboard.
  if (userId === admin.id && !isActive) {
    return NextResponse.json(
      { error: "You cannot deactivate your own account." },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    include: { _count: { select: { accounts: true } } },
  });

  await logAuthEvent(target.id, isActive ? "ACCOUNT_ACTIVATED" : "ACCOUNT_DEACTIVATED");

  const [total, activeCount, deactivatedCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
  ]);

  return NextResponse.json({
    ok: true,
    stats: { total, active: activeCount, deactivated: deactivatedCount },
    user: toRow(updated),
  });
}
