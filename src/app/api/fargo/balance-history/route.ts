import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFargoBalanceSeries } from "@/lib/fargo";

const RANGES = ["7d", "30d", "6m", "1y", "all"] as const;
type Range = (typeof RANGES)[number];

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const url = new URL(req.url);
  const rawRange = url.searchParams.get("range") ?? "all";
  const range: Range = RANGES.includes(rawRange as Range) ? (rawRange as Range) : "all";

  const points = await getFargoBalanceSeries(user.id, range);
  return NextResponse.json({ range, points });
}