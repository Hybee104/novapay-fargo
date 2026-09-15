import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFargoNotifications } from "@/lib/fargo";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const notifications = await getFargoNotifications(user.id);
  return NextResponse.json({ notifications });
}