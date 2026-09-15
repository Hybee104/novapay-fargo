import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFargoTransactionById } from "@/lib/fargo";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await context.params;
  const tx = await getFargoTransactionById(user.id, id);
  if (!tx) {
    return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  }
  return NextResponse.json(tx);
}
