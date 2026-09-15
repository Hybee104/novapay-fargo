import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData, getMonthlyBreakdown } from "@/lib/queries";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const [summary, monthly] = await Promise.all([
      getDashboardData(user.id),
      getMonthlyBreakdown(user.id, 6),
    ]);
    return NextResponse.json({ summary, monthly });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}