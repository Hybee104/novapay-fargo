import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateTicket } from "@/lib/validation";
import { generateSupportReference } from "@/lib/references";
import { BANK_NOVAPAY } from "@/lib/constants";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id, bank: BANK_NOVAPAY },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    tickets: tickets.map((t) => ({
      id: t.id,
      ticketReference: t.ticketReference,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const result = validateTicket(body);
  if (!result.ok || !result.value) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", errors: result.errors }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketReference: generateSupportReference(),
      userId: user.id,
      bank: BANK_NOVAPAY,
      subject: result.value.subject,
      category: result.value.category,
      description: result.value.description,
      priority: result.value.priority,
      status: "Open",
    },
  });

  return NextResponse.json({
    ok: true,
    ticket: {
      id: ticket.id,
      ticketReference: ticket.ticketReference,
      subject: ticket.subject,
      status: ticket.status,
    },
  });
}