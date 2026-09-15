import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFargoDashboardData } from "@/lib/fargo";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const data = await getFargoDashboardData(user.id);
  return NextResponse.json(data);
}
