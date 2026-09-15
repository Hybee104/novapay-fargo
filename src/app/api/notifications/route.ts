import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getNotifications, getUnreadCount } from "@/lib/queries";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const [notifications, unreadCount] = await Promise.all([getNotifications(user.id), getUnreadCount(user.id)]);
  return NextResponse.json({ notifications, unreadCount });
}