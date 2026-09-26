import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, logAuthEvent } from "@/lib/auth";
import { createUserAccount } from "@/lib/user-creation";
import { validateCreateUser } from "@/lib/validation";

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

async function getStats() {
  const [total, active, deactivated] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
  ]);
  return { total, active, deactivated };
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const [users, stats] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { accounts: true } } },
    }),
    getStats(),
  ]);

  return NextResponse.json({
    stats,
    users: users.map(toRow),
  });
}

/**
 * Creates a new customer account. Admin-only.
 *
 * Authorization is enforced here on the server via `getAdminUser()`, so
 * anonymous and non-admin callers get 403 even if they call this endpoint
 * directly. The request body is validated with `validateCreateUser`, and
 * `isAdmin` / `isActive` are never read from it — `createUserAccount` always
 * assigns `isAdmin: false` and `isActive: true`.
 *
 * The response contains no password or password hash.
 */
export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const result = validateCreateUser(body);

  if (!result.ok || !result.value) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", errors: result.errors },
      { status: 400 },
    );
  }

  const { firstName, lastName, email, password, phone } = result.value;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists.", errors: { email: "Email is already registered." } },
      { status: 409 },
    );
  }

  let created;
  try {
    created = await createUserAccount({ firstName, lastName, email, password, phone });
  } catch (err) {
    // Unique-constraint race: two admins submitting the same email at once.
    if (err instanceof Error && "code" in err && (err as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "An account with this email already exists.", errors: { email: "Email is already registered." } },
        { status: 409 },
      );
    }
    throw err;
  }

  await logAuthEvent(created.id, "ACCOUNT_CREATED_BY_ADMIN", { userAgent: req.headers.get("user-agent") });

  const [withCounts, stats] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: created.id },
      include: { _count: { select: { accounts: true } } },
    }),
    getStats(),
  ]);

  return NextResponse.json({ ok: true, stats, user: toRow(withCounts) }, { status: 201 });
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

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });

  await logAuthEvent(target.id, isActive ? "ACCOUNT_ACTIVATED" : "ACCOUNT_DEACTIVATED");

  const [withCounts, stats] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { _count: { select: { accounts: true } } },
    }),
    getStats(),
  ]);

  return NextResponse.json({
    ok: true,
    stats,
    user: toRow(withCounts),
  });
}
