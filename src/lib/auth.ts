import { randomBytes, scrypt, timingSafeEqual, createHmac } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BANK_NOVAPAY } from "@/lib/constants";
import type { Account, User } from "@prisma/client";

const SESSION_COOKIE = "np_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return secret;
}

// ---- Password hashing (Node built-in scrypt, no external deps) ----

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (err, buf) => (err ? reject(err) : resolve(buf)));
  })) as Buffer;
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = (await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (err, buf) => (err ? reject(err) : resolve(buf)));
  })) as Buffer;
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

// ---- Signed session tokens (HMAC-SHA256) ----

interface SessionPayload {
  sub: string;
  exp: number;
  iat: number;
}

function signToken(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

function verifyToken(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", getSecret()).update(body).digest("hex");
  const given = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (given.length !== expectedBuf.length || !timingSafeEqual(given, expectedBuf)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.sub || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionToken(userId: string): string {
  return signToken({
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
  });
}

// ---- Cookie helpers ----

export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroySessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export type SessionUser = User & { account: Account | null; accounts: Account[] };

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { accounts: true },
  });
  if (!user) return null;
  const account = user.accounts.find((a) => a.bank === BANK_NOVAPAY) ?? user.accounts[0] ?? null;
  return { ...user, account, accounts: user.accounts };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getUserIdFromRequest(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

// ---- Login activity logging ----

export function getClientIp(): string {
  return "192.0.2.1"; // reserved documentation range — demo only
}

export function describeUserAgent(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
  const os = /Windows/.test(userAgent)
    ? "Windows"
    : /Mac OS X/.test(userAgent)
      ? "macOS"
      : /Android/.test(userAgent)
        ? "Android"
        : /iPhone|iPad/.test(userAgent)
          ? "iOS"
          : "Unknown OS";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Chrome\//.test(userAgent)
      ? "Chrome"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : /curl|node|postman/i.test(userAgent)
            ? "API / Script"
            : "Browser";
  return `${browser} on ${os}${isMobile ? " (mobile)" : ""}`;
}

export async function logAuthEvent(
  userId: string,
  event: string,
  details: { ip?: string; userAgent?: string | null } = {},
): Promise<void> {
  try {
    await prisma.loginActivity.create({
      data: {
        userId,
        event,
        ip: details.ip ?? getClientIp(),
        userAgent: details.userAgent
          ? describeUserAgent(details.userAgent)
          : "—",
      },
    });
  } catch {
    // Demo app: never let logging crash a request.
  }
}