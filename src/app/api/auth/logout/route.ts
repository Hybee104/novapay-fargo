import { NextResponse } from "next/server";
import { destroySessionCookie, getCurrentUser, logAuthEvent } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (user) {
    await logAuthEvent(user.id, "LOGOUT", {});
  }
  await destroySessionCookie();
  const response = NextResponse.redirect(new URL("/login", process.env.APP_URL ?? "http://localhost:3000"));
  return response;
}