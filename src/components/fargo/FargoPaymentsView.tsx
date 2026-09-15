"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CreditCard, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrencyWithSign, relativeTime } from "@/lib/utils";

interface PaymentRow {
  id: string;
  recipientName: string;
  description: string | null;
  amount: number;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
];

export function FargoPaymentsView() {
  const router = useRouter();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [debounced, setDebounced] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(search), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("type", "Payment");
        if (status) params.set("status", status);
        if (debounced) params.set("search", debounced);
        const res = await fetch(`/api/fargo/payments?${params.toString()}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load payments");
        if (!cancelled) {
          setRows(json.transactions as PaymentRow[]);
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
  }, [status, debounced]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Payments are created as PENDING and reserved from your available balance."
        actions={
          <Link href="/fargo/payments/new">
            <Button variant="fargo">
              <PlusCircle className="size-4" aria-hidden="true" />
              New Payment
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Search"
              srOnlyLabel
              tone="fargo"
              placeholder="Search recipient, description, reference…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              label="Status"
              tone="fargo"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Unable to load payments" description={error} action={<button onClick={() => router.refresh()}>Retry</button>} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="Create a simulated payment to see it listed here."
          action={
            <Link href="/fargo/payments/new">
              <Button variant="fargo">
                <PlusCircle className="size-4" aria-hidden="true" />
                New Payment
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
                      <span className="rounded-full bg-red-50 p-2.5 text-red-500 dark:bg-red-500/10 dark:text-red-400">
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{t.recipientName}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {t.description ?? "Payment"} · {relativeTime(t.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyWithSign(t.amount)}</p>
                        <StatusBadge status={t.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Showing {rows.length} of {total} payment{total === 1 ? "" : "s"}
            <CreditCard className="ml-1 inline size-3.5" aria-hidden="true" />
          </p>
        </>
      )}
    </div>
  );
}