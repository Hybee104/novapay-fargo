"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock3, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { formatCurrencyWithSign, relativeTime } from "@/lib/utils";

interface PendingRow {
  id: string;
  recipientName: string;
  description: string | null;
  amount: number;
  status: string;
  createdAt: string;
  paymentReference: string | null;
}

export function FargoPendingView() {
  const [rows, setRows] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/fargo/pending", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load pending transactions");
        if (!cancelled) setRows(json.transactions as PendingRow[]);
      } catch {
        if (!cancelled) setError("Something went wrong. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const reserved = rows.reduce((sum, r) => sum + Math.abs(r.amount), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Transactions"
        description="Fargo payments are created PENDING and their amounts are reserved from your available balance."
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Unable to load pending payments" description={error} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No pending payments"
          description="Payments you create stay pending until they are approved."
        />
      ) : (
        <>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock3 className="size-4" aria-hidden="true" />
                {rows.length} pending payment{rows.length === 1 ? "" : "s"} · {formatCurrencyWithSign(-reserved)} reserved
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {rows.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/fargo/transactions/${t.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <span className="rounded-full bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                        <Clock3 className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{t.recipientName}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {t.description ?? t.paymentReference ?? "Payment"} · {relativeTime(t.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{formatCurrencyWithSign(t.amount)}</p>
                        <StatusBadge status={t.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <p className="flex items-start gap-2 text-xs text-slate-400 dark:text-slate-500">
            <ArrowUpRight className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            Pending amounts reduce your available balance but remain invisible until completed.
          </p>
        </>
      )}
    </div>
  );
}