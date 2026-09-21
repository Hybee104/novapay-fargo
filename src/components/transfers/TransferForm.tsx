"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Pencil, Search, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency, round2 } from "@/lib/utils";

interface FormState {
  recipientName: string;
  recipientEmail: string;
  recipientReference: string;
  amount: string;
  currency: string;
  purpose: string;
  description: string;
}

const INITIAL: FormState = {
  recipientName: "",
  recipientEmail: "",
  recipientReference: "",
  amount: "",
  currency: "USD",
  purpose: "General transfer",
  description: "",
};

const PURPOSES = [
  "General transfer",
  "Rent",
  "Salary",
  "Invoice / Business",
  "Personal gift",
  "Tuition",
  "Other",
];

export function TransferForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [available, setAvailable] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ reference: string; amount: number; status: string } | null>(null);

  useEffect(() => {
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.summary?.balance != null) setAvailable(d.summary.balance);
      })
      .catch(() => {});
  }, []);

  function setField(name: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormError(null);
  }

  const amountValue = parseFloat(form.amount.replace(/,/g, ""));

  function validateStep1(): boolean {
    const next: Record<string, string> = {};
    if (!form.recipientName.trim()) next.recipientName = "Please enter a valid recipient.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail)) next.recipientEmail = "Enter a valid recipient email.";
    if (!form.recipientReference.trim()) next.recipientReference = "Recipient account / reference is required.";
    if (!form.amount.trim() || !Number.isFinite(amountValue) || amountValue <= 0) {
      next.amount = "Enter a valid USD amount.";
    } else if (amountValue > 10000000) {
      next.amount = "Amount exceeds the transfer limit ($10,000,000.00).";
    }
    if (form.currency !== "USD") next.currency = "Only USD is supported.";
    if (form.currency === "USD" && available != null && amountValue > available) {
      next.amount = "Insufficient available funds.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goToReview() {
    setFormError(null);
    if (!validateStep1()) return;
    setStep(2);
  }

  function backToForm() {
    setStep(1);
  }

  async function confirmTransfer() {
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/transactions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: form.recipientName,
          recipientEmail: form.recipientEmail,
          recipientReference: form.recipientReference,
          amount: round2(amountValue),
          currency: form.currency,
          purpose: form.purpose,
          description: form.description,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        if (data.errors) setErrors(data.errors);
        if (data.insufficientFunds) setStep(1);
        return;
      }
      setResult({ reference: data.transaction.transactionReference, amount: data.transaction.amount, status: data.transaction.status });
      setStep(3);
    } catch {
      setFormError("Something went wrong. Please try again.");
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  }

  const total = round2(amountValue || 0);

  if (step === 3 && result) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardContent className="flex flex-col items-center px-6 py-10 text-center">
            <span className="rounded-full bg-emerald-50 p-4 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 className="size-10" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-slate-50">Transfer created</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Your transfer of <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(Math.abs(result.amount))}</span> to{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{form.recipientName}</span> is now{" "}
              <span className="font-semibold text-amber-600 dark:text-amber-400">PENDING</span>.
            </p>
            <div className="mt-5 w-full space-y-2 rounded-xl bg-slate-50 p-4 text-left text-sm dark:bg-slate-800/60">
              <Row label="Reference" value={result.reference} mono />
              <Row label="Status" value="PENDING" />
              <Row label="Transfer fee" value="$0.00" />
              <Row label="New available balance" value={formatCurrency((available ?? 0) - Math.abs(result.amount))} />
            </div>
            <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
              <Link href="/novapay/transactions" className="flex-1">
                <Button variant="outline" fullWidth>
                  View Transactions
                </Button>
              </Link>
              <Link href="/novapay/dashboard" className="flex-1">
                <Button fullWidth>Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardContent className="p-6">
          {/* Steps indicator */}
          <ol className="mb-6 flex items-center gap-2 text-sm" aria-label="Transfer steps">
            {(["Transfer details", "Review transfer"] as const).map((label, i) => {
              const n = (i + 1) as 1 | 2;
              const active = step === n;
              return (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={
                      active
                        ? "flex size-6 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white"
                        : "flex size-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }
                  >
                    {n}
                  </span>
                  <span className={active ? "font-semibold text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}>{label}</span>
                  {n === 1 && <ArrowRight className="size-3.5 text-slate-300 dark:text-slate-600" aria-hidden="true" />}
                </li>
              );
            })}
          </ol>

          {/* Available balance */}
          <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Wallet className="size-4" aria-hidden="true" />
              Available balance
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
              {available == null ? "—" : formatCurrency(available)}
            </span>
          </div>

          {step === 1 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                goToReview();
              }}
              className="space-y-4"
              noValidate
            >
              <div>
                <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Who are you sending to?</h2>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                  Enter the recipient details for your transfer.
                </p>
                <div className="space-y-4">
                  <Input
                    label="Recipient name"
                    placeholder="e.g. John Smith"
                    value={form.recipientName}
                    onChange={(e) => setField("recipientName", e.target.value)}
                    error={errors.recipientName}
                    autoComplete="off"
                  />
                  <Input
                    label="Recipient email"
                    type="email"
                    placeholder="recipient@example.com"
                    value={form.recipientEmail}
                    onChange={(e) => setField("recipientEmail", e.target.value)}
                    error={errors.recipientEmail}
                    autoComplete="off"
                  />
                  <Input
                    label="Recipient account / reference"
                    placeholder="e.g. ACC-001234"
                    value={form.recipientReference}
                    onChange={(e) => setField("recipientReference", e.target.value)}
                    error={errors.recipientReference}
                    hint="e.g. the recipient's account number or IBAN."
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
                <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Transfer details</h2>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                  Amount is deducted from your available balance.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_150px]">
                  <Input
                    label="Amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setField("amount", e.target.value)}
                    error={errors.amount}
                    aria-describedby="amount-note"
                  />
                  <Select
                    label="Currency"
                    options={[{ value: "USD", label: "USD — US Dollar" }]}
                    value={form.currency}
                    onChange={(e) => setField("currency", e.target.value)}
                    error={errors.currency}
                  />
                </div>
                <p id="amount-note" className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Transfers are processed in USD.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    label="Transfer purpose"
                    options={PURPOSES.map((p) => ({ value: p, label: p }))}
                    value={form.purpose}
                    onChange={(e) => setField("purpose", e.target.value)}
                    error={errors.purpose}
                  />
                  <Input
                    label="Description (optional)"
                    placeholder="e.g. June rent"
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    error={errors.description}
                    maxLength={240}
                  />
                </div>
              </div>

              {formError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                  {formError}
                </p>
              )}

              <Button type="submit" size="lg" fullWidth>
                Review Transfer
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              <button
                type="button"
                onClick={backToForm}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Edit transfer details
              </button>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                    <Search className="size-4 text-slate-400" aria-hidden="true" />
                    Review Transfer
                  </h2>
                  <button
                    type="button"
                    onClick={backToForm}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit
                  </button>
                </div>
                <div className="space-y-3 px-5 py-5 text-sm">
                  <Row label="Recipient" value={form.recipientName} />
                  <Row label="Recipient email" value={form.recipientEmail} />
                  <Row label="Recipient reference" value={form.recipientReference} mono />
                  <Row label="Amount" value={formatCurrency(amountValue || 0)} strong />
                  <Row label="Transfer fee" value="$0.00" />
                  <div className="!mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Total</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{formatCurrency(total)}</span>
                  </div>
                  <Row label="Purpose" value={form.purpose} />
                  {form.description && <Row label="Description" value={form.description} />}
                </div>
              </div>

              {formError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                  {formError}
                </p>
              )}

              <Button
                size="lg"
                fullWidth
                variant="primary"
                loading={submitting}
                onClick={() => void confirmTransfer()}
              >
                {submitting ? "Creating transfer…" : "Confirm Transfer"}
              </Button>

              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Transfers over $10,000,000.00 are not allowed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, mono = false, strong = false }: { label: string; value: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span
        className={
          strong
            ? "text-right font-bold text-slate-900 dark:text-slate-50"
            : `max-w-[60%] text-right font-medium text-slate-800 dark:text-slate-200 ${mono ? "font-mono text-xs" : ""}`
        }
      >
        {value}
      </span>
    </div>
  );
}