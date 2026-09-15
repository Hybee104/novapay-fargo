"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatCurrencyWithSign, relativeTime } from "@/lib/utils";

interface TxRow {
  id: string;
  recipientName: string;
  description: string | null;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
}

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "Transfer", label: "Transfers" },
  { value: "Payment", label: "Payments" },
  { value: "Deposit", label: "Deposits" },
  { value: "Refund", label: "Refunds" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PENDING", label: "Pending" },
];

const PAGE_SIZE = 10;

export function FargoTransactionsView() {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
        if (debounced) params.set("search", debounced);
        if (type) params.set("type", type);
        if (status) params.set("status", status);
        params.set("page", String(page));
        params.set("pageSize", String(PAGE_SIZE));
        const res = await fetch(`/api/fargo/transactions?${params.toString()}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load transactions");
        if (!cancelled) {
          setRows(json.transactions as TxRow[]);
          setTotal(json.total as number);
          setTotalPages(json.totalPages as number);
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
  }, [debounced, type, status, page]);

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" description="Every simulated entry in your Fargo ledger." />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Search"
              srOnlyLabel
              tone="fargo"
              placeholder="Search recipient, description, reference…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              label="Type"
              tone="fargo"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            />
            <Select
              label="Status"
              tone="fargo"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Unable to load transactions" description={error} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Try adjusting your filters or make your first Fargo payment."
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
                      <span
                        className={
                          t.amount >= 0
                            ? "rounded-full bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "rounded-full bg-red-50 p-2.5 text-red-500 dark:bg-red-500/10 dark:text-red-400"
                        }
                      >
                        {t.amount >= 0 ? (
                          <ArrowDownLeft className="size-4" aria-hidden="true" />
                        ) : (
                          <ArrowUpRight className="size-4" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{t.recipientName}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {t.description ?? t.type} · {relativeTime(t.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            t.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {formatCurrencyWithSign(t.amount)}
                        </p>
                        <StatusBadge status={t.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Page {page} of {totalPages} · {total} transaction{total === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}