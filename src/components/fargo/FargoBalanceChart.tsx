"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatCompactCurrency, formatDate, formatCurrency, money } from "@/lib/utils";

type Range = "7d" | "30d" | "6m" | "1y" | "all";

const RANGES: Array<{ value: Range; label: string }> = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
];

const TEAL = "#0d9488";

export function FargoBalanceChart() {
  const [range, setRange] = useState<Range>("30d");
  const [points, setPoints] = useState<Array<{ date: Date; balance: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/fargo/balance-history?range=${range}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load balance history");
        if (!cancelled) {
          setPoints(
            (json.points as Array<{ date: string; balance: number }>).map((p) => ({
              date: new Date(p.date),
              balance: money(p.balance),
            })),
          );
        }
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

  const last = points.length > 0 ? points[points.length - 1].balance : 0;
  const first = points.length > 0 ? points[0].balance : 0;
  const change = last - first;

  return (
    <Card className="h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Available Balance</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Simulated balance history</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="tablist" aria-label="Balance history range">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              role="tab"
              aria-selected={range === r.value}
              onClick={() => {
                setRange(r.value);
                setLoading(true);
                setError(null);
              }}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fargo-500",
                range === r.value
                  ? "bg-white text-fargo-700 shadow-sm dark:bg-slate-900 dark:text-fargo-300"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-3">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-44 w-full" />
          </div>
        ) : error ? (
          <p className="py-12 text-center text-sm text-red-500">{error}</p>
        ) : (
          <>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{formatCurrency(last)}</p>
            <p className={cn("mt-0.5 text-xs font-medium", change === 0 ? "text-slate-400" : change > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
              {change === 0 ? "No change in range" : `${change > 0 ? "▲" : "▼"} ${formatCurrency(Math.abs(change))} over range`} (simulated)
            </p>
          </>
        )}
      </div>

      <div className="h-56 px-3 pb-4 pt-2">
        {loading || error ? null : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="fargoBalanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TEAL} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={TEAL} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis
                dataKey="date"
                tickFormatter={(d: Date) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                minTickGap={32}
              />
              <YAxis
                tickFormatter={(v: number) => formatCompactCurrency(v)}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={70}
                domain={["auto", "auto"]}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Simulated balance"]}
                labelFormatter={(label) => formatDate(new Date(String(label)))}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-slate-200)",
                  fontSize: 13,
                }}
              />
              <Area type="monotone" dataKey="balance" stroke={TEAL} strokeWidth={2.5} fill="url(#fargoBalanceFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}