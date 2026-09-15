"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

interface AccountData {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  account: {
    type: string;
    shortType: string;
    currency: string;
    accountNumber: string;
    routingNumber: string;
    status: string;
    balance: number;
    createdAt: string;
  } | null;
}

export function FargoAccountView() {
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/fargo/account", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load account");
        if (!cancelled) {
          setData(json);
          setFirstName(json.profile.firstName ?? "");
          setLastName(json.profile.lastName ?? "");
          setPhone(json.profile.phone ?? "");
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

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      const res = await fetch("/api/fargo/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save profile");
      setResult("Profile updated.");
    } catch {
      setResult("Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <SkeletonCard className="h-96" />;

  if (error || !data) {
    return <EmptyState title="Unable to load your account" description={error ?? "Something went wrong."} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Account" description="Your Fargo simulated checking account details." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Profile</h2>
            <form onSubmit={onSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="First name" tone="fargo" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Input label="Last name" tone="fargo" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Email" tone="fargo" value={data.profile.email} disabled />
                <Input label="Phone" tone="fargo" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
              {result && <p className="text-sm font-medium text-fargo-700 dark:text-fargo-300">{result}</p>}
              <Button type="submit" variant="fargo" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Fargo Account</h2>
            {data.account ? (
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Balance</dt>
                  <dd className="text-right font-bold text-slate-900 dark:text-slate-50">{formatCurrency(data.account.balance)}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Type</dt>
                  <dd className="text-right font-medium text-slate-900 dark:text-slate-100">{data.account.shortType}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Account number</dt>
                  <dd className="text-right font-mono text-xs font-medium text-slate-900 dark:text-slate-100">{data.account.accountNumber}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Routing number</dt>
                  <dd className="text-right font-mono text-xs font-medium text-slate-900 dark:text-slate-100">{data.account.routingNumber}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Status</dt>
                  <dd className="text-right">
                    <StatusBadge status={data.account.status} />
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No Fargo account found for this simulation user.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}