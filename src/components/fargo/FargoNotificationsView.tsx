"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellRing, Check, Info, ShieldAlert, ShoppingBag, ArrowLeftRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { cn, formatDateTime } from "@/lib/utils";

interface Notif {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const TYPE_ICON: Record<string, { icon: typeof Info; classes: string }> = {
  transfer: { icon: ArrowLeftRight, classes: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" },
  credit: { icon: ShoppingBag, classes: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
  security: { icon: ShieldAlert, classes: "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400" },
  system: { icon: Bell, classes: "bg-fargo-50 text-fargo-700 dark:bg-fargo-500/10 dark:text-fargo-300" },
};

export function FargoNotificationsView() {
  const [rows, setRows] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/fargo/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load notifications"))))
      .then((json) => setRows(json.notifications as Notif[]))
      .catch(() => setError("Something went wrong. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(id: string) {
    setRows((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`/api/fargo/notifications/${id}`, { method: "POST" });
    } catch {
      // non-fatal
    }
  }

  async function markAllRead() {
    await fetch("/api/fargo/notifications/read-all", { method: "POST" });
    setRows((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unread = rows.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Alerts and updates for your Fargo account."
        actions={
          unread > 0 ? (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              <Check className="size-4" aria-hidden="true" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Unable to load notifications" description={error} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You'll see Fargo alerts here when they happen."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/70" aria-label="Fargo notifications">
              {rows.map((n) => {
                const config = TYPE_ICON[n.type] ?? TYPE_ICON.system;
                const Icon = config.icon;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className={cn(
                        "flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40",
                        !n.read && "bg-fargo-50/50 dark:bg-fargo-950/40",
                      )}
                    >
                      <span className={cn("rounded-full p-2.5", config.classes)}>
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {n.title}
                          {!n.read && (
                            <span className="rounded-full bg-fargo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fargo-700 dark:bg-fargo-500/20 dark:text-fargo-300">
                              New
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{n.message}</p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          <Link href="/fargo/notifications" onClick={(e) => e.stopPropagation()} className="underline-offset-2 hover:underline">
                            {formatDateTime(n.createdAt)}
                          </Link>
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}