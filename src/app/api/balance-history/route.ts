import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBalanceSeries, type BalanceRange } from "@/lib/queries";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const url = new URL(req.url);
  const raw = url.searchParams.get("range") ?? "all";
  const range: BalanceRange = ["7d", "30d", "6m", "1y", "all"].includes(raw)
    ? (raw as BalanceRange)
    : "all";

  try {
    const points = await getBalanceSeries(user.id, range);
    return NextResponse.json({ range, points });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}