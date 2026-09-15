"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Clock3, SendHorizontal, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { BalanceChart } from "@/components/charts/BalanceChart";
import { SpendingChart } from "@/components/charts/SpendingChart";
import { formatCurrency, formatCurrencyWithSign, relativeTime } from "@/lib/utils";

interface StatsSummary {
  balance: number;
  accountNumber: string | null;
  pendingCount: number;
  pendingDebits: number;
  pendingCredits: number;
  totalTransactions: number;
  monthlySpending: number;
  monthlyCredits: number;
  recent: Array<{
    id: string;
    recipientName: string;
    description: string | null;
    amount: number;
    status: string;
    type: string;
    createdAt: string;
  }>;
}

interface MonthPoint {
  key: string;
  label: string;
  spending: number;
  credits: number;
}

export function DashboardView() {
  const [data, setData] = useState<{ summary: StatsSummary; monthly: MonthPoint[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load dashboard");
        if (!cancelled) {
          setData(json);
          setError(null);
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
  }, []);

  const summary = data?.summary;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonCard className="h-80" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <EmptyState
          title="Unable to load the dashboard"
          description={error ?? "Something went wrong. Please try again."}
          action={<Link href="/novapay/dashboard">Retry</Link>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting} — NovaPAY Bank`}
        description="Here is an overview of your simulated account activity."
        actions={
          <Link href="/novapay/transfer">
            <Button variant="primary">
              <SendHorizontal className="size-4" aria-hidden="true" />
              Send Money
            </Button>
          </Link>
        }
      />

      {/* Available balance hero */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.08),transparent_45%)] opacity-100" aria-hidden="true" />
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <Wallet className="size-4" aria-hidden="true" />
                Available Balance (simulated)
              </div>
              <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
                {formatCurrency(summary.balance)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge status="Active — Demo" />
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {summary.accountNumber}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatMini label="Pending debits" value={formatCurrency(summary.pendingDebits)} tone="warning" />
              <StatMini label="Pending credits" value={formatCurrency(summary.pendingCredits)} tone="info" />
              <StatMini label="Total transactions" value={String(summary.totalTransactions)} tone="neutral" />
              <StatMini label="Monthly credits" value={formatCurrency(summary.monthlyCredits)} tone="success" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Wallet className="size-5" aria-hidden="true" />}
          label="Available Balance"
          value={formatCurrency(summary.balance)}
          sub="Simulated available funds"
          href="/novapay/balance-history"
        />
        <StatCard
          icon={<Clock3 className="size-5" aria-hidden="true" />}
          label="Pending Transactions"
          value={String(summary.pendingCount)}
          sub={summary.pendingCount > 0 ? `${formatCurrency(summary.pendingDebits)} reserved` : "No pending activity"}
          href="/novapay/transactions/pending"
        />
        <StatCard
          icon={<ArrowLeftRight className="size-5" aria-hidden="true" />}
          label="Total Transactions"
          value={summary.totalTransactions.toLocaleString("en-US")}
          sub="All-time simulated ledger entries"
          href="/novapay/transactions"
        />
        <StatCard
          icon={<ArrowDownLeft className="size-5" aria-hidden="true" />}
          label="Monthly Activity"
          value={formatCurrency(summary.monthlySpending)}
          sub={`${formatCurrency(summary.monthlyCredits)} credited this month`}
          href="/novapay/transactions"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <BalanceChart />
        </div>
        <SpendingChart data={data.monthly} />
      </div>

      {/* Recent activity */}
      <Card>
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h2>
          <Link href="/novapay/transactions" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
            View all
          </Link>
        </div>
        <CardContent className="pt-2">
          {summary.recent.length === 0 ? (
            <EmptyState
              title="No simulated transactions found."
              description="Create a simulated transfer to see activity here."
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {summary.recent.slice(0, 6).map((t) => (
                <li key={t.id}>
                  <Link href={`/transactions/${t.id}`} className="flex items-center gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
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
                          t.amount >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-900 dark:text-slate-100"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatMini({ label, value, tone }: { label: string; value: string; tone: "warning" | "info" | "neutral" | "success" }) {
  const toneClasses = {
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-sky-600 dark:text-sky-400",
    neutral: "text-slate-900 dark:text-slate-100",
    success: "text-emerald-600 dark:text-emerald-400",
  } as const;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-sm font-bold ${toneClasses[tone]}`}>{value}</p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-brand-50 p-2.5 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              {icon}
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>
        </CardContent>
      </Card>
    </Link>
  );
}