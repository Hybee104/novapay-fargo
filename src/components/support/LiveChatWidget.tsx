"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Headset, Send, Smile, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENT_PROFILE } from "@/lib/supportAgent";
import { FARGO_AGENT_PROFILE } from "@/lib/fargoAgent";

type Variant = "novapay" | "fargo";

interface ChatMessage {
  id: string;
  senderRole: "user" | "agent";
  senderName: string;
  body: string;
  createdAt: string;
}

interface ApiConversation {
  id: string;
  agentName: string;
  status: string;
  updatedAt: string;
  preview: string;
  messageCount: number;
  lastSender: string;
}

interface LiveChatWidgetProps {
  variant: Variant;
  firstName?: string;
}

const QUICK_OPTIONS: Array<{ label: string; message: string }> = [
  { label: "Account balance", message: "I need help checking my account balance." },
  { label: "Transfer issue", message: "I can't complete a transfer. Can you help?" },
  { label: "Card support", message: "I need support with my card." },
  { label: "Transaction issue", message: "I have a question about a transaction." },
  { label: "Account security", message: "I want to review my account security settings." },
  { label: "Other", message: "I have another question about my account." },
];

const EMOJIS = ["😊", "👋", "👍", "🙏", "😀", "🤝", "🎉", "❤️"];

const AGENTS: Record<Variant, { displayName: string; shortName: string; color: string }> = {
  novapay: {
    displayName: AGENT_PROFILE.displayName,
    shortName: AGENT_PROFILE.displayName.split(" — ")[0].trim(),
    color: AGENT_PROFILE.avatarColor,
  },
  fargo: {
    displayName: FARGO_AGENT_PROFILE.displayName,
    shortName: FARGO_AGENT_PROFILE.displayName.split(" — ")[0].trim(),
    color: FARGO_AGENT_PROFILE.avatarColor,
  },
};

const THEME: Record<
  Variant,
  {
    api: string;
    header: string;
    button: string;
    send: string;
    userBubble: string;
    inputFocus: string;
    chipHover: string;
    focusRing: string;
  }
> = {
  novapay: {
    api: "/api/support",
    header: "bg-brand-800",
    button: "bg-brand-700 hover:bg-brand-800",
    send: "bg-brand-700 hover:bg-brand-800",
    userBubble: "bg-brand-900 text-white",
    inputFocus: "focus:ring-brand-500",
    chipHover: "hover:border-brand-400 hover:text-brand-700",
    focusRing: "focus-visible:ring-brand-500/40",
  },
  fargo: {
    api: "/api/fargo/support",
    header: "bg-fargo-800",
    button: "bg-fargo-700 hover:bg-fargo-800",
    send: "bg-fargo-700 hover:bg-fargo-800",
    userBubble: "bg-fargo-700 text-white",
    inputFocus: "focus:ring-fargo-500",
    chipHover: "hover:border-fargo-500 hover:text-fargo-700",
    focusRing: "focus-visible:ring-fargo-500/40",
  },
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

async function readJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function AgentAvatar({ shortName, color, className }: { shortName: string; color: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
        className,
      )}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {shortName.slice(0, 2)}
    </div>
  );
}

export function LiveChatWidget({ variant, firstName }: LiveChatWidgetProps) {
  const router = useRouter();
  const theme = THEME[variant];
  const agent = AGENTS[variant];

  const goToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sendingRef = useRef(false);
  const lastSeenRef = useRef<{ id: string; count: number } | null>(null);

  // Keep the client-side unread marker in sync while the chat is open and visible.
  useEffect(() => {
    if (open && conversationId && messages.length > 0) {
      lastSeenRef.current = { id: conversationId, count: messages.length };
    }
  }, [open, conversationId, messages]);

  // Poll for new support responses only while the chat is closed.
  useEffect(() => {
    if (open) return;
    let active = true;

    const tick = async () => {
      try {
        const res = await fetch(`${theme.api}/conversations`, { cache: "no-store" });
        if (res.status === 401) {
          if (active) goToLogin();
          return;
        }
        if (!res.ok) return;
        const json = await readJson<{ conversations?: ApiConversation[] }>(res);
        if (!json) return;
        const latest = json.conversations?.[0];
        if (!latest) return;
        if (!lastSeenRef.current) {
          lastSeenRef.current = { id: latest.id, count: latest.messageCount };
          setUnreadCount(0);
          return;
        }
        if (latest.id === lastSeenRef.current.id && latest.messageCount > lastSeenRef.current.count) {
          setUnreadCount(Math.min(99, latest.messageCount - lastSeenRef.current.count));
        } else {
          setUnreadCount(0);
        }
      } catch {
        // Keep the previous badge state on network errors.
      }
    };

    void tick();
    const interval = window.setInterval(tick, 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [theme.api, open, goToLogin]);

  const loadMessages = useCallback(
    async (id: string) => {
      const res = await fetch(`${theme.api}/conversations/${id}/messages`, { cache: "no-store" });
      if (res.status === 401) {
        goToLogin();
        return;
      }
      if (res.status === 404) {
        setConversationId(null);
        setMessages([]);
        return;
      }
      const json = await readJson<{ messages?: ChatMessage[] }>(res);
      if (!json?.messages) return;
      setMessages(json.messages);
      lastSeenRef.current = { id, count: json.messages.length };
      setUnreadCount(0);
      setAnnouncement(`Chat opened. ${json.messages.length} message${json.messages.length === 1 ? "" : "s"} in this conversation.`);
    },
    [theme.api, goToLogin],
  );

  const openChat = useCallback(async () => {
    setOpen(true);
    setLoadingHistory(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${theme.api}/conversations`, { cache: "no-store" });
      if (res.status === 401) {
        goToLogin();
        return;
      }
      const json = await readJson<{ conversations?: ApiConversation[] }>(res);
      const latest = json?.conversations?.[0] ?? null;
      if (latest) {
        setConversationId(latest.id);
        await loadMessages(latest.id);
      } else {
        setConversationId(null);
        setMessages([]);
      }
    } finally {
      setLoadingHistory(false);
    }
    window.setTimeout(() => inputRef.current?.focus(), 160);
  }, [theme.api, loadMessages, goToLogin]);

  const closeChat = useCallback(() => {
    setOpen(false);
    setEmojiOpen(false);
    setErrorMsg(null);
  }, []);

  const sendMessage = useCallback(
    async (raw: string, subject?: string) => {
      const body = raw.trim();
      if (!body || sendingRef.current) return;
      sendingRef.current = true;
      setSending(true);
      setTyping(true);
      setEmojiOpen(false);
      setErrorMsg(null);

      const typingDelay = 900 + Math.random() * 700;

      try {
        if (!conversationId) {
          const res = await fetch(`${theme.api}/conversations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject: subject ?? "Support request", message: body }),
          });
          if (res.status === 401) {
            goToLogin();
            return;
          }
          const json = await readJson<{
            ok?: boolean;
            error?: string;
            conversation?: { id?: string };
            messages?: ChatMessage[];
          }>(res);
          if (!res.ok || !json?.conversation?.id) {
            setErrorMsg(typeof json?.error === "string" ? json.error : "Couldn't start the conversation.");
            setDraft(body);
            return;
          }
          setConversationId(json.conversation.id);
          const userMsg = json.messages?.find((m) => m.senderRole === "user") ?? null;
          const agentMsg = json.messages?.find((m) => m.senderRole === "agent") ?? null;
          if (userMsg) setMessages([userMsg]);
          if (agentMsg) {
            await new Promise<void>((resolve) => window.setTimeout(resolve, typingDelay));
            setMessages((prev) => [...prev, agentMsg]);
            setAnnouncement(`New message from ${agent.shortName}.`);
          }
        } else {
          const res = await fetch(`${theme.api}/conversations/${conversationId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body }),
          });
          if (res.status === 401) {
            goToLogin();
            return;
          }
          const json = await readJson<{
            ok?: boolean;
            error?: string;
            userMessage?: ChatMessage;
            agentMessage?: ChatMessage;
          }>(res);
          if (!res.ok || !json?.userMessage) {
            setErrorMsg(typeof json?.error === "string" ? json.error : "Message couldn't be sent. Please try again.");
            setDraft(body);
            return;
          }
          setMessages((prev) => [...prev, json.userMessage as ChatMessage]);
          if (json.agentMessage) {
            await new Promise<void>((resolve) => window.setTimeout(resolve, typingDelay));
            setMessages((prev) => [...prev, json.agentMessage as ChatMessage]);
            setAnnouncement(`New message from ${agent.shortName}.`);
          }
        }
      } catch {
        setErrorMsg("Message couldn't be sent. Please try again.");
        setDraft(body);
      } finally {
        sendingRef.current = false;
        setSending(false);
        setTyping(false);
        setDraft("");
      }
    },
    [theme.api, conversationId, agent.shortName, goToLogin],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeChat();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing, open]);

  useEffect(() => {
    if (!announcement) return;
    const t = window.setTimeout(() => setAnnouncement(""), 4000);
    return () => window.clearTimeout(t);
  }, [announcement]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(draft);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] flex flex-col items-end gap-3 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      {/* Screen-reader live region */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* Chat panel */}
      <div
        id="live-chat-panel"
        role="dialog"
        aria-modal="false"
        aria-label="Customer support chat"
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={cn(
          "flex w-full max-w-[400px] origin-bottom-right flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 transition-all duration-200 ease-out",
          "h-[calc(100dvh-7rem)] sm:h-[560px]",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-[0.98] opacity-0",
        )}
      >
        {/* Header */}
        <header className={cn("flex items-center gap-3 px-4 py-3.5 text-white", theme.header)}>
          <AgentAvatar shortName={agent.shortName} color={agent.color} className="ring-2 ring-white/20" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Customer Support</p>
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-semibold">{agent.shortName}</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                </span>
                Online
              </span>
            </div>
            <p className="text-[11px] text-white/70">We&apos;re here to help</p>
          </div>
          <button
            type="button"
            onClick={closeChat}
            aria-label="Close chat"
            className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-slate-50 px-4 py-4">
          {loadingHistory ? (
            <div className="space-y-3" aria-busy="true" aria-label="Loading conversation">
              <div className="flex gap-2.5">
                <div className="size-8 shrink-0 animate-pulse rounded-full bg-slate-200" />
                <div className="h-10 w-3/4 animate-pulse rounded-2xl rounded-tl-md bg-slate-200" />
              </div>
              <div className="flex justify-end">
                <div className="h-9 w-1/2 animate-pulse rounded-2xl rounded-tr-md bg-slate-200" />
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="animate-[np-chat-msg_180ms_ease-out]">
              <div className="flex gap-2.5">
                <AgentAvatar shortName={agent.shortName} color={agent.color} />
                <div className="max-w-[85%]">
                  <p className="text-[11px] font-medium text-slate-500">{agent.shortName} · just now</p>
                  <div className="mt-1 whitespace-pre-line rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm ring-1 ring-slate-200">
                    {`Hi ${firstName || "there"} 👋`}
                    <br />
                    How can I help you today?
                  </div>
                  <div className="mt-3 flex max-w-full flex-wrap gap-2">
                    {QUICK_OPTIONS.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => void sendMessage(option.message, option.label)}
                        className={cn(
                          "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2",
                          theme.chipHover,
                          theme.focusRing,
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.senderRole === "user";
              return (
                <div
                  key={m.id}
                  className={cn("flex animate-[np-chat-msg_180ms_ease-out] gap-2.5", isUser ? "justify-end" : "justify-start")}
                >
                  {!isUser && <AgentAvatar shortName={agent.shortName} color={agent.color} />}
                  <div className={cn("max-w-[82%]", isUser && "items-end text-right")}>
                    {!isUser && <p className="px-0.5 text-[11px] font-medium text-slate-500">{agent.shortName}</p>}
                    <div
                      className={cn(
                        "inline-block max-w-full whitespace-pre-wrap px-3.5 py-2.5 text-left text-sm leading-relaxed shadow-sm",
                        isUser
                          ? cn("rounded-2xl rounded-tr-md", theme.userBubble)
                          : "rounded-2xl rounded-tl-md bg-white text-slate-800 ring-1 ring-slate-200",
                      )}
                    >
                      {m.body}
                    </div>
                    <p className="mt-1 px-0.5 text-[10px] text-slate-400">{formatTime(m.createdAt)}</p>
                  </div>
                </div>
              );
            })
          )}

          {typing && (
            <div className="flex animate-[np-chat-msg_180ms_ease-out] items-end gap-2.5">
              <AgentAvatar shortName={agent.shortName} color={agent.color} />
              <div>
                <p className="px-1 text-[11px] font-medium text-slate-500">{agent.shortName} is typing…</p>
                <div
                  className="mt-1 inline-flex items-center gap-1 rounded-2xl rounded-tl-md bg-white px-3.5 py-3 shadow-sm ring-1 ring-slate-200"
                  role="status"
                >
                  <span className="sr-only">{agent.shortName} is typing</span>
                  <span className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                  <span className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "120ms" }} />
                  <span className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "240ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="border-t border-slate-200 bg-white">
          {errorMsg && <p className="px-4 pt-2 text-xs font-medium text-red-600">{errorMsg}</p>}
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2 px-3 py-3">
            {emojiOpen && (
              <div className="absolute bottom-full left-3 mb-2 grid grid-cols-4 gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    aria-label={`Insert emoji ${emoji}`}
                    onClick={() => setDraft((d) => d + emoji)}
                    className="flex size-9 items-center justify-center rounded-lg text-lg transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setEmojiOpen((v) => !v)}
              aria-label="Add an emoji"
              aria-expanded={emojiOpen}
              className={cn(
                "shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2",
                theme.focusRing,
              )}
            >
              <Smile className="size-5" />
            </button>
            <label htmlFor="live-chat-message" className="sr-only">
              Message
            </label>
            <input
              id="live-chat-message"
              ref={inputRef}
              type="text"
              value={draft}
              maxLength={1000}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your message…"
              autoComplete="off"
              className={cn(
                "min-w-0 flex-1 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none ring-1 ring-inset ring-slate-200 transition-shadow placeholder:text-slate-400 focus:ring-2",
                theme.inputFocus,
              )}
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              aria-label="Send message"
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
                theme.send,
                theme.focusRing,
              )}
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating button */}
      <button
        type="button"
        onClick={() => (open ? closeChat() : void openChat())}
        aria-label={open ? "Close customer support chat" : "Open customer support chat"}
        aria-expanded={open}
        aria-controls="live-chat-panel"
        title="Customer Support"
        className={cn(
          "group pointer-events-auto relative flex size-14 items-center justify-center rounded-full text-white shadow-xl shadow-slate-900/25 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4",
          theme.button,
          theme.focusRing,
        )}
      >
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 sm:block">
          Customer Support
        </span>
        {open ? (
          <X className="size-6 transition-transform duration-200" />
        ) : (
          <Headset className="size-6 transition-transform duration-200" />
        )}
        {unreadCount > 0 && !open && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-[np-chat-pop_220ms_ease-out] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}