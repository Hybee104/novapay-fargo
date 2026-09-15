import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFargoUnreadCount } from "@/lib/fargo";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const count = await getFargoUnreadCount(user.id);
  return NextResponse.json({ count });
}