"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CircleDot,
  Headphones,
  MessageSquarePlus,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { FARGO_AGENT_PROFILE } from "@/lib/fargoAgent";
import { cn, formatTime, relativeTime } from "@/lib/utils";

interface Conversation {
  id: string;
  subject: string;
  agentName: string;
  status: string;
  updatedAt: string;
  preview: string;
  messageCount: number;
  lastSender: string;
}

interface ChatMessage {
  id: string;
  senderRole: "user" | "agent";
  senderName: string;
  body: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  ticketReference: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

const TICKET_CATEGORIES = ["Account", "Transaction", "Payment", "Transfer", "Login & Security", "Other"];
const TICKET_PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export function FargoSupportView() {
  const { toast } = useToast();
  const [tab, setTab] = useState("chat");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatSubject, setNewChatSubject] = useState("");
  const [newChatMessage, setNewChatMessage] = useState("");
  const [newChatErrors, setNewChatErrors] = useState<Record<string, string>>({});
  const [newChatSaving, setNewChatSaving] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", category: TICKET_CATEGORIES[0], priority: "Medium", description: "" });
  const [ticketErrors, setTicketErrors] = useState<Record<string, string>>({});
  const [ticketSaving, setTicketSaving] = useState(false);
  const [detailTicket, setDetailTicket] = useState<(Ticket & { description: string }) | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(() => {
    fetch("/api/fargo/support/conversations", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { conversations: [] }))
      .then((json) => setConversations(json.conversations ?? []))
      .catch(() => {})
      .finally(() => setListLoading(false));
  }, []);

  const loadTickets = useCallback(() => {
    fetch("/api/fargo/support/tickets", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { tickets: [] }))
      .then((json) => setTickets(json.tickets ?? []))
      .catch(() => {})
      .finally(() => setTicketsLoading(false));
  }, []);

  const scrollToEnd = () => {
    window.setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 30);
  };

  useEffect(() => {
    loadConversations();
    loadTickets();
  }, [loadConversations, loadTickets]);

  useEffect(() => {
    if (activeId) scrollToEnd();
  }, [messages, activeId]);

  async function openConversation(id: string) {
    setActiveId(id);
    setMsgLoading(true);
    setMessages(null);
    try {
      const res = await fetch(`/api/fargo/support/conversations/${id}/messages`, { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setMessages(json.messages ?? []);
    } catch {
      setMessages([]);
    } finally {
      setMsgLoading(false);
    }
  }

  function backToList() {
    setActiveId(null);
    setMessages(null);
  }

  async function sendMessage() {
    const body = draft.trim();
    if (!body || !activeId || msgLoading) return;
    setDraft("");
    setTyping(true);
    try {
      const res = await fetch(`/api/fargo/support/conversations/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessages((prev) => [...(prev ?? []), json.userMessage, json.agentMessage]);
        loadConversations();
      } else {
        setDraft(body);
        toast({ title: json.error ?? "Could not send message", tone: "error" });
      }
    } catch {
      setDraft(body);
      toast({ title: "Something went wrong. Please try again.", tone: "error" });
    } finally {
      setTyping(false);
      scrollToEnd();
    }
  }

  async function createConversation(e?: React.FormEvent) {
    e?.preventDefault();
    setNewChatSaving(true);
    setNewChatErrors({});
    try {
      const res = await fetch("/api/fargo/support/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: newChatSubject, message: newChatMessage }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNewChatErrors(json.errors ?? {});
        if (json.error) toast({ title: json.error, tone: "error" });
        return;
      }
      setNewChatOpen(false);
      setNewChatSubject("");
      setNewChatMessage("");
      setTab("chat");
      loadConversations();
      setActiveId(json.conversation.id);
      setMessages(json.messages ?? []);
    } catch {
      toast({ title: "Something went wrong. Please try again.", tone: "error" });
    } finally {
      setNewChatSaving(false);
    }
  }

  async function submitTicket(e?: React.FormEvent) {
    e?.preventDefault();
    setTicketSaving(true);
    setTicketErrors({});
    try {
      const res = await fetch("/api/fargo/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTicketErrors(json.errors ?? {});
        if (json.error) toast({ title: json.error, tone: "error" });
        return;
      }
      setNewTicketOpen(false);
      setNewTicket({ subject: "", category: TICKET_CATEGORIES[0], priority: "Medium", description: "" });
      loadTickets();
      toast({
        title: "Ticket created",
        description: `Reference ${json.ticket.ticketReference}. We'll review it and get back to you.`,
        tone: "success",
      });
    } catch {
      toast({ title: "Something went wrong. Please try again.", tone: "error" });
    } finally {
      setTicketSaving(false);
    }
  }

  async function openTicketDetail(id: string) {
    setDetailLoading(true);
    setDetailTicket(null);
    try {
      const res = await fetch(`/api/fargo/support/tickets/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setDetailTicket(json.ticket);
    } catch {
      toast({ title: "Could not load ticket", tone: "error" });
    } finally {
      setDetailLoading(false);
    }
  }

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="space-y-5">
      {/* Agent card */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex size-11 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: FARGO_AGENT_PROFILE.avatarColor }}
              aria-hidden="true"
            >
              JD
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{FARGO_AGENT_PROFILE.displayName}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
                  <CircleDot className="size-2.5" aria-hidden="true" />
                  Online
                </span>
              </div>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{FARGO_AGENT_PROFILE.role} — ready to help</p>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full bg-fargo-50 px-3 py-1 text-xs font-medium text-fargo-800 sm:inline-flex dark:bg-fargo-500/10 dark:text-fargo-300">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Support assistant
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "chat", label: "Live Chat", icon: <Headphones className="size-4" aria-hidden="true" />, count: conversations.length },
          { value: "tickets", label: "Support Tickets", icon: <MessageSquarePlus className="size-4" aria-hidden="true" />, count: tickets.length },
        ]}
      />

      {/* CHAT TAB */}
      <div hidden={tab !== "chat"}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
          <Card className={cn("flex max-h-[70vh] flex-col", activeId && "hidden lg:flex")}>
            <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Conversations</h2>
              <Button size="sm" variant="outline" onClick={() => setNewChatOpen(true)}>
                <Plus className="size-4" aria-hidden="true" />
                New Chat
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {listLoading ? (
                <div className="space-y-2 p-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : conversations.length === 0 ? (
                <EmptyState
                  title="No conversations yet."
                  description="Start a chat with a Fargo support specialist."
                  action={
                    <Button size="sm" variant="fargo" onClick={() => setNewChatOpen(true)}>
                      Start a chat
                    </Button>
                  }
                />
              ) : (
                <ul className="space-y-1">
                  {conversations.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => void openConversation(c.id)}
                        className={cn(
                          "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                          c.id === activeId
                            ? "border-fargo-600 bg-fargo-50/70 dark:border-fargo-500/50 dark:bg-fargo-500/10"
                            : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{c.subject}</p>
                          <span className="shrink-0 text-[10px] text-slate-400">{relativeTime(c.updatedAt)}</span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{c.preview}</p>
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          {c.messageCount} message{c.messageCount === 1 ? "" : "s"}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card className={cn("flex max-h-[70vh] min-h-[480px] flex-col", !activeId && "hidden lg:flex")}>
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <button
                type="button"
                onClick={backToList}
                aria-label="Back to conversations"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
              </button>
              <span
                className="flex size-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: FARGO_AGENT_PROFILE.avatarColor }}
                aria-hidden="true"
              >
                JD
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {activeConversation?.subject ?? "Support chat"}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Jordan is online</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4 dark:bg-slate-950/30">
              {msgLoading ? (
                <div className="space-y-3">
                  <Skeleton className="ml-auto h-10 w-2/3 rounded-2xl" />
                  <Skeleton className="h-16 w-3/4 rounded-2xl" />
                </div>
              ) : !messages || messages.length === 0 ? (
                <EmptyState title="No messages yet." description="Send a message to start the chat." />
              ) : (
                <>
                  {messages.map((m) => {
                    const isAgent = m.senderRole === "agent";
                    return (
                      <div key={m.id} className={cn("flex", isAgent ? "justify-start" : "justify-end")}>
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[75%]",
                            isAgent
                              ? "rounded-tl-md border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                              : "rounded-tr-md bg-fargo-700 text-white",
                          )}
                        >
                          {isAgent && <p className="mb-1 text-[11px] font-semibold text-fargo-700 dark:text-fargo-300">{m.senderName}</p>}
                          <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                          <p className={cn("mt-1 text-right text-[10px]", isAgent ? "text-slate-400" : "text-white/70")}>{formatTime(m.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {typing && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                        <span className="size-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                        <span className="size-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "120ms" }} />
                        <span className="size-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "240ms" }} />
                        <span className="sr-only">Jordan is typing…</span>
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </>
              )}
            </div>

            <form
              className="flex items-end gap-2 border-t border-slate-200 p-3 dark:border-slate-800"
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
            >
              <Textarea
                rows={1}
                tone="fargo"
                placeholder="Type a message to Jordan…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                aria-label="Chat message"
                className="max-h-32 flex-1"
              />
              <Button type="submit" variant="fargo" size="sm" className="h-11 w-11 p-0" aria-label="Send message" disabled={!draft.trim() || msgLoading}>
                <Send className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* TICKETS TAB */}
      <div hidden={tab !== "tickets"}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Support tickets — created and tracked in-app.
          </p>
          <Button variant="fargo" size="sm" onClick={() => setNewTicketOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            New Ticket
          </Button>
        </div>

        <Card>
          {ticketsLoading ? (
            <div className="space-y-2 p-5">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-2">
              <EmptyState
                title="No support tickets."
                description="If you need help, open a ticket and track its status here."
                action={
                  <Button variant="fargo" size="sm" onClick={() => setNewTicketOpen(true)}>
                    Open a Ticket
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => void openTicketDetail(t.id)}
                    className="flex w-full flex-col gap-2 px-5 py-4 text-left transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-slate-800/40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.subject}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                        {t.ticketReference} · {t.category} · {relativeTime(t.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* NEW CHAT MODAL */}
      <Modal
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        title="Start a support chat"
        description="Message the support specialist."
        footer={
          <>
            <Button variant="outline" onClick={() => setNewChatOpen(false)}>
              Cancel
            </Button>
            <Button variant="fargo" loading={newChatSaving} onClick={() => void createConversation()}>
              {newChatSaving ? "Starting…" : "Start Chat"}
            </Button>
          </>
        }
      >
        <form onSubmit={createConversation} className="space-y-4" noValidate>
          <Input
            label="Subject"
            tone="fargo"
            placeholder="e.g. Question about a pending payment"
            value={newChatSubject}
            onChange={(e) => {
              setNewChatErrors((p) => ({ ...p, subject: "" }));
              setNewChatSubject(e.target.value);
            }}
            error={newChatErrors.subject}
          />
          <Textarea
            label="Your message"
            tone="fargo"
            rows={4}
            placeholder="Describe your question or issue…"
            value={newChatMessage}
            onChange={(e) => {
              setNewChatErrors((p) => ({ ...p, message: "" }));
              setNewChatMessage(e.target.value);
            }}
            error={newChatErrors.message}
          />
        </form>
      </Modal>

      {/* NEW TICKET MODAL */}
      <Modal
        open={newTicketOpen}
        onClose={() => setNewTicketOpen(false)}
        title="Open a Support Ticket"
        description="Create a support ticket for review."
        footer={
          <>
            <Button variant="outline" onClick={() => setNewTicketOpen(false)}>
              Cancel
            </Button>
            <Button variant="fargo" loading={ticketSaving} onClick={() => void submitTicket()}>
              {ticketSaving ? "Creating…" : "Create Ticket"}
            </Button>
          </>
        }
      >
        <form onSubmit={submitTicket} className="space-y-4" noValidate>
          <Input
            label="Subject"
            tone="fargo"
            placeholder="Brief summary of the issue"
            value={newTicket.subject}
            onChange={(e) => {
              setTicketErrors((p) => ({ ...p, subject: "" }));
              setNewTicket((f) => ({ ...f, subject: e.target.value }));
            }}
            error={ticketErrors.subject}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              tone="fargo"
              options={TICKET_CATEGORIES.map((c) => ({ value: c, label: c }))}
              value={newTicket.category}
              onChange={(e) => {
                setTicketErrors((p) => ({ ...p, category: "" }));
                setNewTicket((f) => ({ ...f, category: e.target.value }));
              }}
              error={ticketErrors.category}
            />
            <Select
              label="Priority"
              tone="fargo"
              options={TICKET_PRIORITIES.map((p) => ({ value: p, label: p }))}
              value={newTicket.priority}
              onChange={(e) => setNewTicket((f) => ({ ...f, priority: e.target.value }))}
              error={ticketErrors.priority}
            />
          </div>
          <Textarea
            label="Description"
            tone="fargo"
            rows={5}
            placeholder="Describe the issue in a few sentences…"
            value={newTicket.description}
            onChange={(e) => {
              setTicketErrors((p) => ({ ...p, description: "" }));
              setNewTicket((f) => ({ ...f, description: e.target.value }));
            }}
            error={ticketErrors.description}
          />
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            Tickets are tracked in-app. No email or external ticketing system is contacted.
          </p>
        </form>
      </Modal>

      {/* TICKET DETAIL MODAL */}
      <Modal
        open={Boolean(detailTicket)}
        onClose={() => setDetailTicket(null)}
        title={detailTicket?.subject ?? "Ticket"}
        description={detailLoading ? "Loading…" : undefined}
        size="md"
      >
        {detailLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : detailTicket ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={detailTicket.status} />
              <PriorityBadge priority={detailTicket.priority} />
              <Badge tone="neutral">{detailTicket.category}</Badge>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ticket reference</p>
              <p className="mt-0.5 font-mono text-slate-800 dark:text-slate-200">{detailTicket.ticketReference}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
              <p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">{detailTicket.description}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              Opened {relativeTime(detailTicket.createdAt)}. Your ticket is being reviewed by the support team.
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = priority.toLowerCase();
  if (p === "high") return <Badge tone="warning">High</Badge>;
  if (p === "urgent") return <Badge tone="danger">Urgent</Badge>;
  if (p === "medium") return <Badge tone="info">Medium</Badge>;
  return <Badge tone="neutral">Low</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "open") return <Badge tone="info">Open</Badge>;
  if (s === "in progress" || s === "in_progress") return <Badge tone="warning">In Progress</Badge>;
  if (s === "resolved") return <Badge tone="success">Resolved</Badge>;
  return <Badge tone="neutral">{status}</Badge>;
}