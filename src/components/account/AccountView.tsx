"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CreditCard,
  Landmark,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate, initials } from "@/lib/utils";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
}

interface AccountInfo {
  type: string;
  accountNumber: string;
  routingNumber: string;
  currency: string;
  status: string;
  createdAt: string;
}

interface AccountData {
  profile: Profile;
  account: AccountInfo | null;
  balance: number;
}

export function AccountView() {
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/account", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/stats", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ])
      .then(([acc, stats]) => {
        setData({
          profile: acc.profile ?? { firstName: "", lastName: "", email: "", phone: "", isAdmin: false },
          account: acc.account ?? null,
          balance: stats?.summary?.balance ?? 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openEdit() {
    if (!data) return;
    setForm({
      firstName: data.profile.firstName,
      lastName: data.profile.lastName,
      phone: data.profile.phone ?? "",
    });
    setErrors({});
    setFormError(null);
    setEditOpen(true);
  }

  async function saveProfile() {
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(json.error ?? "Something went wrong. Please try again.");
        setErrors(json.errors ?? {});
        return;
      }
      setEditOpen(false);
      load();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const { profile, account } = data;
  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="space-y-5">
      {/* Profile */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-50 text-xl font-bold text-brand-800 dark:bg-brand-500/10 dark:text-brand-300">
                {initials(profile.firstName, profile.lastName)}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{fullName}</h2>
                  <Badge tone="success">Verified</Badge>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" aria-hidden="true" /> {profile.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-3.5" aria-hidden="true" /> {profile.phone || "No phone set"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              {profile.isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-800 transition-colors hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
                >
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Admin console
                </Link>
              )}
              <Button variant="outline" onClick={openEdit}>
                <UserIcon className="size-4" aria-hidden="true" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <Building2 className="size-4 text-slate-400" aria-hidden="true" />
              Account Summary
            </h2>
            <Badge tone="brand">Active</Badge>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-900 p-5 text-white shadow-inner dark:bg-slate-800/80">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{account?.type ?? "Premium Dollar Checking Account"}</p>
            <p className="mt-2 text-2xl font-bold sm:text-3xl">{formatCurrency(data.balance)}</p>
            <p className="mt-1 text-xs text-slate-400">Available balance</p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 font-mono text-sm">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Account number</p>
                <p>{account?.accountNumber ?? "7842-XXXX"}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Routing number</p>
                <p>{account?.routingNumber ?? "084000026"}</p>
              </div>
            </div>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Landmark className="size-4" aria-hidden="true" />
                Account type
              </dt>
              <dd className="font-medium text-slate-800 dark:text-slate-200">{account?.type ?? "Premium Dollar Checking Account"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <CreditCard className="size-4" aria-hidden="true" />
                Currency
              </dt>
              <dd className="font-medium text-slate-800 dark:text-slate-200">USD — US Dollar</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <RefreshCw className="size-4" aria-hidden="true" />
                Account since
              </dt>
              <dd className="font-medium text-slate-800 dark:text-slate-200">{account?.createdAt ? formatDate(account.createdAt) : "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Edit profile modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        description="Update your profile details."
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void saveProfile()}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              value={form.firstName}
              onChange={(e) => {
                setErrors((p) => ({ ...p, firstName: "" }));
                setForm((p) => ({ ...p, firstName: e.target.value }));
              }}
              error={errors.firstName}
            />
            <Input
              label="Last name"
              value={form.lastName}
              onChange={(e) => {
                setErrors((p) => ({ ...p, lastName: "" }));
                setForm((p) => ({ ...p, lastName: e.target.value }));
              }}
              error={errors.lastName}
            />
          </div>
          <Input
            label="Phone (optional)"
            type="tel"
            value={form.phone}
            onChange={(e) => {
              setErrors((p) => ({ ...p, phone: "" }));
              setForm((p) => ({ ...p, phone: e.target.value }));
            }}
            error={errors.phone}
            placeholder="+1 (555) 010-2030"
          />
          <div className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <span className="font-semibold">Note:</span> Email address cannot be changed from this panel. Create a new account if you need a different email.
          </div>
          {formError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              {formError}
            </p>
          )}
          <p className="flex items-center gap-2">
            <Link href="/novapay/security" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
              Manage security settings
            </Link>
          </p>
        </div>
      </Modal>
    </div>
  );
}