import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFargoPendingPayments } from "@/lib/fargo";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const pending = await getFargoPendingPayments(user.id);
  return NextResponse.json({ transactions: pending, total: pending.length });
}
