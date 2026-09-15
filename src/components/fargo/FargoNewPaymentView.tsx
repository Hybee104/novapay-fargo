"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, CreditCard, Info, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FARGO_PAYMENT_CATEGORIES } from "@/lib/fargoValidation";
import { FARGO_ACCOUNT } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export function FargoNewPaymentView() {
  const router = useRouter();
  const [recipientName, setRecipientName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setErrors({});
    try {
      const res = await fetch("/api/fargo/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName, description, amount, category }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/fargo/pending");
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
        title="New Payment"
        description="Create a simulated Fargo payment. It is always created with a PENDING status."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <Input
                label="Recipient"
                tone="fargo"
                placeholder="Who are you paying? (e.g. City Utilities)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                error={errors.recipientName}
                maxLength={120}
                autoComplete="off"
              />

              <Input
                label="Amount (USD)"
                tone="fargo"
                placeholder="0.00"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={errors.amount}
              />

              <Select
                label="Category"
                tone="fargo"
                placeholder="Select a category"
                options={FARGO_PAYMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                error={errors.category}
              />

              <Textarea
                label="Description"
                tone="fargo"
                rows={3}
                placeholder="What is this payment for?"
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
                <Link href="/fargo/payments">
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" variant="fargo" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <CreditCard className="size-4" aria-hidden="true" />
                      Create Payment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">How payments work</h2>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-fargo-600 dark:text-fargo-400" aria-hidden="true" />
                  Every payment starts as <strong>PENDING</strong>.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-fargo-600 dark:text-fargo-400" aria-hidden="true" />
                  The amount is reserved from your available balance immediately.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-fargo-600 dark:text-fargo-400" aria-hidden="true" />
                  No real money moves. This is a simulation.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <Info className="mt-px size-4 shrink-0 text-fargo-600 dark:text-fargo-400" aria-hidden="true" />
                <span>
                  Fargo is a {FARGO_ACCOUNT.type.toLowerCase()} with a simulated opening balance of {formatCurrency(0)}. Transfer
                  funds in from NovaPAY to make payments.
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}