import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listFargoTransactions } from "@/lib/fargo";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? undefined;
  const type = url.searchParams.get("type") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;
  const page = url.searchParams.get("page") ?? undefined;
  const pageSize = url.searchParams.get("pageSize") ?? undefined;

  const data = await listFargoTransactions(user.id, {
    search,
    type,
    status,
    from,
    to,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  });

  return NextResponse.json(data);
}
