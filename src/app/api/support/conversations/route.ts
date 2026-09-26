import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { simulateAgentReply, AGENT_PROFILE } from "@/lib/supportAgent";
import { BANK_NOVAPAY } from "@/lib/constants";

interface ConversationListItem {
  id: string;
  subject: string;
  agentName: string;
  status: string;
  updatedAt: string;
  preview: string;
  messageCount: number;
  lastSender: string;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const rows = await prisma.supportConversation.findMany({
    where: { userId: user.id, bank: BANK_NOVAPAY },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  const conversations: ConversationListItem[] = rows.map((c) => ({
    id: c.id,
    subject: c.subject,
    agentName: c.agentName,
    status: c.status,
    updatedAt: c.updatedAt.toISOString(),
    preview: c.messages[0]?.body ?? "No messages yet",
    messageCount: c._count.messages,
    lastSender: c.messages[0]?.senderName ?? "",
  }));

  return NextResponse.json({ conversations });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  const errors: Record<string, string> = {};
  if (!subject) errors.subject = "Subject is required.";
  else if (subject.length > 120) errors.subject = "Subject must be 120 characters or fewer.";
  if (!message) errors.message = "Message is required.";
  else if (message.length < 2) errors.message = "Message must be at least 2 characters.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", errors }, { status: 400 });
  }

  const agentReply = simulateAgentReply(user.firstName, message, {
    balance: user.account ? Number(user.account.balance) : null,
  });

  const conversation = await prisma.supportConversation.create({
    data: {
      userId: user.id,
      bank: BANK_NOVAPAY,
      subject,
      messages: {
        create: [
          { senderRole: "user", senderName: `${user.firstName} ${user.lastName}`, body: message },
          { senderRole: "agent", senderName: AGENT_PROFILE.displayName, body: agentReply },
        ],
      },
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  const messages = conversation.messages.map((m) => ({
    id: m.id,
    senderRole: m.senderRole,
    senderName: m.senderName,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  }));

  return NextResponse.json({
    ok: true,
    conversation: {
      id: conversation.id,
      subject: conversation.subject,
      status: conversation.status,
      agentName: conversation.agentName,
    },
    messages,
  });
}