"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatCurrencyWithSign } from "@/lib/utils";

interface TxDetail {
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
  runningBalance: number | null;
  createdAt: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function FargoTransactionDetailView({ id }: { id: string }) {
  const [tx, setTx] = useState<TxDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/fargo/transactions/${id}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load transaction");
        if (!cancelled) setTx(json);
      } catch {
        if (!cancelled) setError("Unable to load this transaction.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <SkeletonCard className="h-96" />;

  if (error || !tx) {
    return (
      <div>
        <PageHeader title="Transaction" description="Fargo ledger entry" />
        <EmptyState title="Unable to load this transaction" description={error ?? "It may no longer exist."} />
      </div>
    );
  }

  const isCredit = tx.amount >= 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Details"
        description="Fargo ledger entry"
        actions={
          <Link href="/fargo/transactions">
            <Button variant="secondary" size="sm">
              Back to Transactions
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <span
                className={
                  isCredit
                    ? "rounded-full bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "rounded-full bg-red-50 p-3 text-red-500 dark:bg-red-500/10 dark:text-red-400"
                }
              >
                {isCredit ? (
                  <ArrowDownLeft className="size-5" aria-hidden="true" />
                ) : (
                  <ArrowUpRight className="size-5" aria-hidden="true" />
                )}
              </span>
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{tx.recipientName}</p>
                <StatusBadge status={tx.status} />
              </div>
            </div>
            <p className={`mt-5 text-3xl font-bold ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-50"}`}>
              {formatCurrencyWithSign(tx.amount)}
            </p>
            {tx.description && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{tx.description}</p>}
            {tx.runningBalance != null && (
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                Running balance after this entry: {formatCurrency(tx.runningBalance)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Reference" value={tx.transactionReference} mono />
              <Row label="Date" value={formatDate(tx.createdAt)} />
              <Row label="Type" value={tx.type} />
              <Row label="Category" value={tx.category ?? "—"} />
              <Row label="Currency" value={tx.currency} />
              <Row label="Recipient" value={tx.recipientName} />
              {tx.recipientReference && <Row label="Recipient reference" value={tx.recipientReference} />}
              {tx.recipientEmail && <Row label="Recipient email" value={tx.recipientEmail} />}
              <Row label="Status" value={tx.status} />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className={`text-right font-medium text-slate-900 dark:text-slate-100 ${mono ? "font-mono text-xs mt-0.5" : ""}`}>{value}</dd>
    </div>
  );
}