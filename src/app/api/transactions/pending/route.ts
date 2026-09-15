import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPendingTransactions } from "@/lib/queries";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const transactions = await getPendingTransactions(user.id);
  return NextResponse.json({ transactions, pendingCount: transactions.length });
}