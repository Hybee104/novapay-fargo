"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowRightToLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrencyWithSign, relativeTime } from "@/lib/utils";

interface TransferRow {
  id: string;
  recipientName: string;
  description: string | null;
  amount: number;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PENDING", label: "Pending" },
];

export function FargoTransfersView() {
  const [rows, setRows] = useState<TransferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("type", "Transfer");
        if (status) params.set("status", status);
        const res = await fetch(`/api/fargo/transfers?${params.toString()}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load transfers");
        if (!cancelled) {
          setRows(json.transactions as TransferRow[]);
          setTotal(json.total as number);
        }
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
  }, [status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transfers"
        description="Internal transfers move funds in from your linked NovaPAY demo account."
        actions={
          <Link href="/novapay/transfer-to-fargo">
            <Button variant="fargo">
              <ArrowRightToLine className="size-4" aria-hidden="true" />
              Transfer from NovaPAY
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="p-5">
          <Select
            label="Status"
            tone="fargo"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Unable to load transfers" description={error} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No transfers yet"
          description="Transfer funds in from your NovaPAY account to see them here."
          action={
            <Link href="/novapay/transfer-to-fargo">
              <Button variant="fargo">
                <ArrowRightToLine className="size-4" aria-hidden="true" />
                Transfer from NovaPAY
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {rows.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/fargo/transactions/${t.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <span className="rounded-full bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <ArrowDownLeft className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{t.recipientName}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {t.description ?? "Internal transfer"} · {relativeTime(t.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrencyWithSign(t.amount)}</p>
                        <StatusBadge status={t.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Showing {rows.length} of {total} transfer{total === 1 ? "" : "s"}
          </p>
        </>
      )}
    </div>
  );
}