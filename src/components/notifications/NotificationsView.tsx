"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, CheckCheck, Info, ShieldAlert, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonTableRows } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { relativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const TYPE_STYLES: Record<string, { icon: React.ReactNode; ring: string }> = {
  transfer: {
    icon: <ArrowUpRight className="size-4" aria-hidden="true" />,
    ring: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  },
  credit: {
    icon: <ArrowDownLeft className="size-4" aria-hidden="true" />,
    ring: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  security: {
    icon: <ShieldAlert className="size-4" aria-hidden="true" />,
    ring: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  reminder: {
    icon: <Wallet className="size-4" aria-hidden="true" />,
    ring: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
  },
};

export function NotificationsView() {
  const { toast } = useToast();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setItems(json?.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unread = items.filter((n) => !n.read).length;

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    fetch(`/api/notifications/${id}`, { method: "POST" }).catch(() => {});
  }

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (!res.ok) throw new Error("failed");
    } catch {
      toast({ title: "Could not mark all as read", tone: "error" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{unread}</span> unread notification{unread === 1 ? "" : "s"}
        </p>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={unread === 0}>
          <CheckCheck className="size-4" aria-hidden="true" />
          Mark all as read
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-5">
            <SkeletonTableRows rows={4} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No notifications yet."
            description="Simulated account notifications will appear here as you use the demo."
            action={
              <Link href="/novapay/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {items.map((n) => {
              const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.reminder;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40",
                      !n.read && "bg-brand-900/[0.03] dark:bg-brand-500/[0.04]",
                    )}
                  >
                    <span className={cn("mt-0.5 rounded-full p-2.5", style.ring)}>{style.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm font-semibold text-slate-900 dark:text-slate-100", !n.read && "text-brand-800 dark:text-brand-200")}>
                          {n.title}
                        </p>
                        {!n.read && <Badge tone="brand">New</Badge>}
                      </div>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{n.message}</p>
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                        <Info className="size-3" aria-hidden="true" />
                        {relativeTime(n.createdAt)}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}