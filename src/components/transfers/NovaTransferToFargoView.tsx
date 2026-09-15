"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRightToLine, Info, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FARGO_BANK_NAME, FARGO_ACCOUNT, SIMULATION_COPY } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export function NovaTransferToFargoView() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ nova: number; fargo: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setErrors({});
    try {
      const res = await fetch("/api/fargo/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess({ nova: json.novaAvailableBalance as number, fargo: json.fargoAvailableBalance as number });
      setAmount("");
      setDescription("");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Transfer to ${FARGO_BANK_NAME}`}
        description="Move simulated funds from your NovaPAY account into Fargo. Both sides are updated atomically in the local database."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="p-5 sm:p-6">
            {success ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Transfer completed</p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                    NovaPAY available: <strong>{formatCurrency(success.nova)}</strong> · Fargo available:{" "}
                    <strong>{formatCurrency(success.fargo)}</strong>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => setSuccess(null)}>
                    Make another transfer
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <Input
                  label="Amount (USD)"
                  placeholder="0.00"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  error={errors.amount}
                />
                <Textarea
                  label="Description (optional)"
                  rows={2}
                  placeholder="e.g. Moving savings to Fargo"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  error={errors.description}
                  maxLength={240}
                />

                {error && (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Link href="/novapay/transfer">
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <ArrowRightToLine className="size-4" aria-hidden="true" />
                        Transfer to Fargo
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">What happens?</h2>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                <li>Your NovaPAY balance decreases by the transfer amount.</li>
                <li>Your Fargo balance increases by the exact same amount.</li>
                <li>A paired ledger entry (Internal Transfer) is recorded for both environments.</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <Info className="mt-px size-4 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                <span>
                  Fargo is a {FARGO_ACCOUNT.type.toLowerCase()} with a simulated opening balance of {formatCurrency(0)}.{" "}
                  {SIMULATION_COPY}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}