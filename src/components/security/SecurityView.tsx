"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, Fingerprint, KeyRound, Laptop, Lock, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import { Modal } from "@/components/ui/Modal";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime, relativeTime } from "@/lib/utils";

interface Preferences {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  securityNotificationsEnabled: boolean;
  transactionAlertsEnabled: boolean;
}

interface ActivityEntry {
  id: string;
  event: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export function SecurityView() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // password modal
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/security", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json) {
          setPrefs(json.preferences);
          setActivity(json.activity ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(key: keyof Preferences, value: boolean) {
    if (!prefs) return;
    setSavingKey(key);
    const previous = prefs[key];
    setPrefs((p) => (p ? { ...p, [key]: value } : p));
    try {
      const res = await fetch("/api/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) {
        setPrefs((p) => (p ? { ...p, [key]: previous } : p));
        toast({ title: "Could not update setting", tone: "error" });
      } else {
        toast({ title: "Setting updated", description: "Security preference saved.", tone: "success" });
      }
    } catch {
      setPrefs((p) => (p ? { ...p, [key]: previous } : p));
      toast({ title: "Something went wrong", tone: "error" });
    } finally {
      setSavingKey(null);
    }
  }

  async function changePassword(e?: React.FormEvent) {
    e?.preventDefault();
    setPwSaving(true);
    setPwError(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwForm),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwError(json.error ?? "Something went wrong. Please try again.");
        setPwErrors(json.errors ?? {});
        return;
      }
      setPwOpen(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password updated", description: "Your simulated password was changed successfully.", tone: "success" });
    } catch {
      setPwError("Something went wrong. Please try again.");
    } finally {
      setPwSaving(false);
    }
  }

  if (loading || !prefs) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const toggles = [
    {
      key: "twoFactorEnabled" as const,
      label: "Two-factor authentication (2FA)",
      description: "Require a one-time code at sign-in. Simulated for demo purposes — no real codes are sent.",
      icon: <ShieldCheck className="size-4 text-brand-700 dark:text-brand-300" />,
    },
    {
      key: "biometricEnabled" as const,
      label: "Face / fingerprint sign-in",
      description: "Allow biometric unlock on supported demo sessions.",
      icon: <Fingerprint className="size-4 text-brand-700 dark:text-brand-300" />,
    },
    {
      key: "securityNotificationsEnabled" as const,
      label: "Security notifications",
      description: "Notify me about simulated security events, such as sign-ins from new devices.",
      icon: <BellRing className="size-4 text-brand-700 dark:text-brand-300" />,
    },
    {
      key: "transactionAlertsEnabled" as const,
      label: "Instant transaction alerts",
      description: "Send a simulated alert every time a transfer is created in the demo.",
      icon: <KeyRound className="size-4 text-brand-700 dark:text-brand-300" />,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Password */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="rounded-xl bg-slate-100 p-2.5 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <Lock className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Password</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Change the password used to sign in to this demo environment.
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setPwOpen(true)}>
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Account Preferences</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            These controls simulate the toggles a real banking app would offer. Changes are stored locally.
          </p>
          <div className="mt-5 space-y-5">
            {toggles.map((t) => (
              <Toggle
                key={t.key}
                checked={prefs[t.key]}
                label={t.label}
                description={t.description}
                loading={savingKey === t.key}
                onCheckedChange={(v) => void toggle(t.key, v)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Login activity */}
      <Card>
        <div className="flex items-center gap-3 px-6 pt-5">
          <span className="rounded-xl bg-slate-100 p-2.5 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Laptop className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Login Activity</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Simulated security events on this demo account
            </p>
          </div>
        </div>
        <CardContent className="pt-4">
          {activity.length === 0 ? (
            <EmptyState title="No login activity recorded." description="Sign-in events will appear here as they happen." />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <span className="rounded-full bg-brand-50 p-2 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    <MonitorSmartphone className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatEvent(a.event)}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {a.ip ?? "Unknown location"} · {relativeTime(a.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge tone={a.event.includes("FAILED") ? "danger" : "success"}>
                      {a.event.includes("FAILED") ? "Failed" : "Success"}
                    </Badge>
                    <p className="mt-1 font-mono text-[10px] text-slate-400">{formatDateTime(a.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            Shows only locally recorded simulated events — no real devices or locations are tracked.
          </p>
        </CardContent>
      </Card>

      {/* Password modal */}
      <Modal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        title="Change Password"
        description="Update the password for your demo account."
        footer={
          <>
            <Button variant="outline" onClick={() => setPwOpen(false)}>
              Cancel
            </Button>
            <Button loading={pwSaving} onClick={() => void changePassword()}>
              {pwSaving ? "Updating…" : "Update Password"}
            </Button>
          </>
        }
      >
        <form
          onSubmit={changePassword}
          className="space-y-4"
          noValidate
        >
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={pwForm.currentPassword}
            onChange={(e) => {
              setPwErrors((p) => ({ ...p, currentPassword: "" }));
              setPwForm((p) => ({ ...p, currentPassword: e.target.value }));
            }}
            error={pwErrors.currentPassword}
          />
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters with uppercase, lowercase and a number."
            value={pwForm.newPassword}
            onChange={(e) => {
              setPwErrors((p) => ({ ...p, newPassword: "" }));
              setPwForm((p) => ({ ...p, newPassword: e.target.value }));
            }}
            error={pwErrors.newPassword}
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={pwForm.confirmPassword}
            onChange={(e) => {
              setPwErrors((p) => ({ ...p, confirmPassword: "" }));
              setPwForm((p) => ({ ...p, confirmPassword: e.target.value }));
            }}
            error={pwErrors.confirmPassword}
          />
          {pwError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              {pwError}
            </p>
          )}
        </form>
      </Modal>

      <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <ShieldCheck className="size-4 text-emerald-500" aria-hidden="true" />
        This demo simulates banking-grade security hardening. Nothing here affects any real account.{" "}
        <Link href="/novapay/support" className="font-medium text-brand-700 hover:underline dark:text-brand-300">
          Contact support
        </Link>
      </p>
    </div>
  );
}

function formatEvent(event: string): string {
  switch (event) {
    case "LOGIN_SUCCESS":
      return "Signed in successfully";
    case "LOGIN_FAILED":
      return "Failed sign-in attempt";
    case "LOGOUT":
      return "Signed out";
    case "REGISTER":
      return "Demo account created";
    case "PASSWORD_CHANGE":
      return "Password changed";
    case "TRANSFER_CREATED":
      return "Simulated transfer created";
    default:
      return event.replace(/_/g, " ");
  }
}