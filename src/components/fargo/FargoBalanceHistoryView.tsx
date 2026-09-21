"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { FargoBalanceChart } from "@/components/fargo/FargoBalanceChart";
import { formatCurrency, formatDate } from "@/lib/utils";

type Range = "7d" | "30d" | "6m" | "1y" | "all";

const RANGES: Array<{ value: Range; label: string }> = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
];

interface Point {
  date: string;
  balance: number;
}

export function FargoBalanceHistoryView() {
  const [range, setRange] = useState<Range>("30d");
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/fargo/balance-history?range=${range}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load balance history");
        if (!cancelled) setPoints(json.points as Point[]);
      } catch {
        if (!cancelled) setError("Unable to load balance history.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Balance History"
        description="Fargo starts at a $0.00 opening balance and tracks every change in the ledger."
      />

      <FargoBalanceChart />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Snapshot History</h2>
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="tablist" aria-label="Balance history range">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                role="tab"
                aria-selected={range === r.value}
                onClick={() => setRange(r.value)}
                className={
                  range === r.value
                    ? "rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-fargo-700 shadow-sm dark:bg-slate-900 dark:text-fargo-300"
                    : "rounded-md px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <CardContent className="pt-4">
          {loading ? (
            <SkeletonCard className="h-40" />
          ) : error ? (
            <EmptyState title="Unable to load snapshots" description={error} />
          ) : points.length === 0 ? (
            <EmptyState
              title="No snapshots in this range"
              description="Transfer funds in from NovaPAY or create a payment to generate balance snapshots."
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {points
                .slice()
                .reverse()
                .slice(0, 50)
                .map((p) => (
                  <li key={p.date} className="flex items-center justify-between gap-4 py-2.5">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{formatDate(new Date(p.date))}</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(p.balance)}</span>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}