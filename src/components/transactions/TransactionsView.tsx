"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTableRows } from "@/components/ui/Skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/Table";
import { cn, formatCurrencyWithSign, formatDateTime, relativeTime } from "@/lib/utils";

interface Tx {
  id: string;
  transactionReference: string;
  type: string;
  amount: number;
  currency: string;
  recipientName: string;
  recipientReference: string | null;
  recipientEmail: string | null;
  description: string | null;
  category: string | null;
  status: string;
  runningBalance?: number | null;
  createdAt: string;
}

interface ListResponse {
  transactions: Tx[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const TYPES = ["All types", "Transfer", "Deposit", "Withdrawal", "Payment", "Refund"];
const STATUSES = ["All statuses", "COMPLETED", "PENDING"];

export function TransactionsView({ initialStatus }: { initialStatus?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? TYPES[0]);
  const [status, setStatus] = useState(searchParams.get("status") ?? initialStatus ?? STATUSES[0]);
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));

  const fetchIdRef = useRef(0);

  function beginFetch() {
    setLoading(true);
    setError(null);
  }

  useEffect(() => {
    const controller = new AbortController();
    const id = ++fetchIdRef.current;
    const query = [
      `search=${encodeURIComponent(search)}`,
      `type=${encodeURIComponent(type === TYPES[0] ? "" : type)}`,
      `status=${encodeURIComponent(status === STATUSES[0] && status !== initialStatus ? "" : status)}`,
      from ? `from=${encodeURIComponent(from)}` : "",
      to ? `to=${encodeURIComponent(to)}` : "",
      `page=${page}`,
      `pageSize=10`,
    ]
      .filter(Boolean)
      .join("&");
    fetch(`/api/transactions?${query}`, { cache: "no-store", signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load transactions"))))
      .then((json) => {
        if (fetchIdRef.current !== id) return;
        setData(json);
      })
      .catch((err) => {
        if (!(err instanceof DOMException && err.name === "AbortError") && fetchIdRef.current === id) {
          setError("Something went wrong. Please try again.");
        }
      })
      .finally(() => {
        if (fetchIdRef.current === id) setLoading(false);
      });
    return () => controller.abort();
  }, [search, type, status, from, to, page, initialStatus]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type !== TYPES[0]) params.set("type", type);
    if (status !== STATUSES[0] && status !== initialStatus) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(`/novapay/transactions${initialStatus === "PENDING" ? "/pending" : ""}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [search, type, status, from, to, page, router, initialStatus]);

  function applyPreset(statusValue: string) {
    beginFetch();
    setStatus(statusValue);
    setPage(1);
  }

  function changePage(next: number) {
    beginFetch();
    setPage(next);
  }

  const totalPages = data?.totalPages ?? 1;
  const startPage = Math.max(1, Math.min(page, totalPages));

  return (
    <div className="space-y-5">
      {/* Pending filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={status === STATUSES[0]} onClick={() => applyPreset(STATUSES[0])}>
          All
        </FilterChip>
        <FilterChip active={status === "COMPLETED"} onClick={() => applyPreset("COMPLETED")}>
          Completed
        </FilterChip>
        <FilterChip active={status === "PENDING"} onClick={() => applyPreset("PENDING")}>
          Pending
        </FilterChip>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="gap-3 p-4 sm:grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.9fr_0.9fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-8 top-1/2 size-4 -translate-y-1/2 text-slate-400 sm:left-3.5" aria-hidden="true" />
            {search ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  beginFetch();
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
            <Input
              className="sm:pl-9"
              placeholder="Search recipient, reference, description…"
              value={search}
              onChange={(e) => {
                beginFetch();
                setSearch(e.target.value);
                setPage(1);
              }}
              aria-label="Search transactions"
            />
          </div>
          <Select
            aria-label="Filter by type"
            options={TYPES.map((t) => ({ value: t, label: t }))}
            value={type}
            onChange={(e) => {
              beginFetch();
              setType(e.target.value);
              setPage(1);
            }}
          />
          <Select
            aria-label="Filter by status"
            options={STATUSES.map((s) => ({ value: s, label: s }))}
            value={status}
            onChange={(e) => {
              beginFetch();
              setStatus(e.target.value);
              setPage(1);
            }}
          />
          <Input
            aria-label="From date"
            type="date"
            value={from}
            onChange={(e) => {
              beginFetch();
              setFrom(e.target.value);
              setPage(1);
            }}
          />
          <Input
            aria-label="To date"
            type="date"
            value={to}
            onChange={(e) => {
              beginFetch();
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        {loading ? (
          <div className="p-5">
            <SkeletonTableRows rows={6} />
          </div>
        ) : error ? (
          <EmptyState title="Something went wrong" description={error} />
        ) : !data || data.transactions.length === 0 ? (
          <div className="p-2">
            <EmptyState
              title="No simulated transactions found."
              description="Try adjusting your filters, or create a simulated transfer."
              action={
                <Link href="/novapay/transfer">
                  <Button variant="outline">Send Money</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="px-5 pt-4 text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)}</span> of{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{data.total}</span> simulated transactions
            </div>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Transaction</TableHeaderCell>
                    <TableHeaderCell>Description</TableHeaderCell>
                    <TableHeaderCell className="text-center">Status</TableHeaderCell>
                    <TableHeaderCell className="text-right">Amount</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Link href={`/transactions/${t.id}`} className="group flex items-center gap-3">
                          <span
                            className={cn(
                              "rounded-full p-2.5",
                              t.amount >= 0
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
                            )}
                          >
                            {t.amount >= 0 ? <ArrowDownLeft className="size-4" aria-hidden="true" /> : <ArrowUpRight className="size-4" aria-hidden="true" />}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-300">
                              {t.recipientName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {t.type}
                              {t.category && t.category !== t.type ? <span className="text-slate-400 dark:text-slate-500"> · {t.category}</span> : null}
                              <span className="text-slate-400 dark:text-slate-500"> · </span>
                              {formatDateTime(t.createdAt)}
                            </p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <p className="line-clamp-2 max-w-xs text-sm text-slate-600 dark:text-slate-300">{t.description ?? "—"}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-400">{t.transactionReference}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={t.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <p className={cn("text-sm font-bold", t.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100")}>
                          {formatCurrencyWithSign(t.amount)}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile rows */}
            <ul className="divide-y divide-slate-100 md:hidden dark:divide-slate-800/70">
              {data.transactions.map((t) => (
                <li key={t.id}>
                  <Link href={`/transactions/${t.id}`} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <span
                      className={cn(
                        "rounded-full p-2.5",
                        t.amount >= 0
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
                      )}
                    >
                      {t.amount >= 0 ? <ArrowDownLeft className="size-4" aria-hidden="true" /> : <ArrowUpRight className="size-4" aria-hidden="true" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{t.recipientName}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {t.type}
                        {t.category && t.category !== t.type ? <span className="text-slate-400 dark:text-slate-500"> · {t.category}</span> : null}
                        <span className="text-slate-400 dark:text-slate-500"> · </span>
                        {relativeTime(t.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold", t.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100")}>
                        {formatCurrencyWithSign(t.amount)}
                      </p>
                      <StatusBadge status={t.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Page {startPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => changePage(Math.max(1, page - 1))}>
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => changePage(Math.min(totalPages, page + 1))}>
                    Next
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        active
          ? "border-brand-800 bg-brand-900 text-white"
          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
      )}
    >
      {children}
    </button>
  );
}