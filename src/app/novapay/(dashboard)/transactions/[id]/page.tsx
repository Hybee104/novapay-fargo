import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Clock3, Copy } from "lucide-react";
import { notFound } from "next/navigation";
import { getTransactionById } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatCurrencyWithSign, formatDateTime } from "@/lib/utils";

interface Params {
  id: string;
}

export const metadata: Metadata = {
  title: "Transaction Details",
  description: "Details of a simulated transaction.",
};

export default async function TransactionDetailPage({ params }: { params: Promise<Params> }) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const { id } = await params;
  const t = await getTransactionById(user.id, id);
  if (!t) notFound();

  const isCredit = t.amount >= 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title={t.recipientName}
        description={`Transaction details for ${t.transactionReference}`}
        actions={
          <Link href="/novapay/transactions">
            <Button variant="outline">Back to Transactions</Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-3 border-b border-slate-200 pb-6 dark:border-slate-800">
            <span
              className={
                isCredit
                  ? "rounded-full bg-emerald-50 p-4 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "rounded-full bg-red-50 p-4 text-red-500 dark:bg-red-500/10 dark:text-red-400"
              }
            >
              {isCredit ? <ArrowDownLeft className="size-8" aria-hidden="true" /> : <ArrowUpRight className="size-8" aria-hidden="true" />}
            </span>
            <p className={`text-4xl font-bold tracking-tight ${isCredit ? "text-emerald-600" : "text-slate-900 dark:text-slate-50"}`}>
              {formatCurrencyWithSign(t.amount)}
            </p>
            <StatusBadge status={t.status} />
            <Badge tone={isCredit ? "success" : "neutral"}>{t.type}</Badge>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <DetailRow label="Transaction type" value={t.type} />
            <DetailRow label="Category" value={t.category ?? "—"} />
            <DetailRow label="Description" value={t.description ?? "—"} />
            <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Recipient</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <DetailRow label="Name" value={t.recipientName} />
                <DetailRow label="Email" value={t.recipientEmail ?? "—"} />
                <DetailRow label="Account / reference" value={t.recipientReference ?? "—"} />
              </div>
            </div>
            <DetailRow label="Transaction reference" value={t.transactionReference} mono />
            <DetailRow label="Date & time" value={formatDateTime(t.createdAt)} />
            <DetailRow label="Currency" value={t.currency} />
            <DetailRow
              label={t.status === "PENDING" ? "Balance after (once settled)" : "Balance after this transaction"}
              value={
                t.runningBalance != null
                  ? formatCurrency(t.runningBalance)
                  : t.status === "PENDING"
                    ? "— (reserved)"
                    : "—"
              }
              mono={t.runningBalance != null}
            />
          </dl>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-5 text-center dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Official receipt available for this transaction</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              This simulated receipt would typically be provided as a downloadable PDF by the bank.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <Clock3 className="size-4 shrink-0" aria-hidden="true" />
        <p>
          {t.status === "PENDING" ? (
            <>
              This simulated transfer is waiting to be processed. As a demo, it may stay pending until a simulated approval occurs. The displayed available balance already excludes pending debits.
            </>
          ) : (
            <>
              A simulated record stored in the local NovaPAY Bank demo database (<span className="font-mono">dev.db</span>).{" "}
              <span className="inline-flex items-center gap-0.5">
                <Copy className="size-3" aria-hidden="true" /> Reference copied when requested
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className={`text-right font-medium text-slate-800 dark:text-slate-200 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}