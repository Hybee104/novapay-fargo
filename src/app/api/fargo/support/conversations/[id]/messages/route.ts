import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { simulateFargoReply, FARGO_AGENT_PROFILE } from "@/lib/fargoAgent";
import { BANK_FARGO } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await context.params;
  const conversation = await prisma.supportConversation.findFirst({
    where: { id, userId: user.id, bank: BANK_FARGO },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      subject: conversation.subject,
      status: conversation.status,
      agentName: conversation.agentName,
    },
    messages: conversation.messages.map((m) => ({
      id: m.id,
      senderRole: m.senderRole,
      senderName: m.senderName,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await context.params;
  const conversation = await prisma.supportConversation.findFirst({
    where: { id, userId: user.id, bank: BANK_FARGO },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const message = typeof body.body === "string" ? body.body.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "Message is required.", errors: { body: "Message is required." } }, { status: 400 });
  }
  if (message.length > 1000) {
    return NextResponse.json(
      { error: "Message must be 1000 characters or fewer.", errors: { body: "Message must be 1000 characters or fewer." } },
      { status: 400 },
    );
  }

  const agentReply = simulateFargoReply(user.firstName, message);

  const messages = await prisma.$transaction([
    prisma.supportMessage.create({
      data: { conversationId: id, userId: user.id, senderRole: "user", senderName: `${user.firstName} ${user.lastName}`, body: message },
    }),
    prisma.supportMessage.create({
      data: { conversationId: id, senderRole: "agent", senderName: FARGO_AGENT_PROFILE.displayName, body: agentReply },
    }),
    prisma.supportConversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    }),
  ]);

  const [userMsg, agentMsg] = messages;

  return NextResponse.json({
    ok: true,
    userMessage: {
      id: userMsg.id,
      senderRole: userMsg.senderRole,
      senderName: userMsg.senderName,
      body: userMsg.body,
      createdAt: userMsg.createdAt.toISOString(),
    },
    agentMessage: {
      id: agentMsg.id,
      senderRole: agentMsg.senderRole,
      senderName: agentMsg.senderName,
      body: agentMsg.body,
      createdAt: agentMsg.createdAt.toISOString(),
    },
  });
}