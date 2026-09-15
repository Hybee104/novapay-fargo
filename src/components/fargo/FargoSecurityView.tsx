"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toggle } from "@/components/ui/Toggle";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { formatDateTime } from "@/lib/utils";

interface SecurityData {
  preferences: {
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    securityNotificationsEnabled: boolean;
    transactionAlertsEnabled: boolean;
  };
  activity: Array<{
    id: string;
    event: string;
    ip: string;
    userAgent: string;
    createdAt: string;
  }>;
}

export function FargoSecurityView() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/fargo/security", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load security settings");
        if (!cancelled) setData(json);
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

  async function togglePreference(key: keyof SecurityData["preferences"], value: boolean) {
    if (!data) return;
    setSaving(true);
    setData({ ...data, preferences: { ...data.preferences, [key]: value } });
    try {
      await fetch("/api/fargo/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {
      // non-fatal
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <SkeletonCard className="h-96" />;

  if (error || !data) {
    return <EmptyState title="Unable to load security settings" description={error ?? "Something went wrong."} />;
  }

  const prefs = data.preferences;

  return (
    <div className="space-y-6">
      <PageHeader title="Security" description="Security preferences shared across your simulated account environment." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardContent className="space-y-5 p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Preferences</h2>
            <Toggle
              tone="fargo"
              label="Two-factor authentication"
              description="Simulated 2FA. No real codes are sent."
              checked={prefs.twoFactorEnabled}
              onCheckedChange={(v) => togglePreference("twoFactorEnabled", v)}
              disabled={saving}
            />
            <Toggle
              tone="fargo"
              label="Biometric sign-in"
              description="Simulated biometric unlock. Not connected to any device."
              checked={prefs.biometricEnabled}
              onCheckedChange={(v) => togglePreference("biometricEnabled", v)}
              disabled={saving}
            />
            <Toggle
              tone="fargo"
              label="Security notifications"
              description="Receive simulated alerts for sign-in events."
              checked={prefs.securityNotificationsEnabled}
              onCheckedChange={(v) => togglePreference("securityNotificationsEnabled", v)}
              disabled={saving}
            />
            <Toggle
              tone="fargo"
              label="Transaction alerts"
              description="Receive simulated alerts for payments and transfers."
              checked={prefs.transactionAlertsEnabled}
              onCheckedChange={(v) => togglePreference("transactionAlertsEnabled", v)}
              disabled={saving}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Sign-in Activity</h2>
            {data.activity.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No sign-in events recorded.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {data.activity.map((a) => (
                  <li key={a.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={
                          a.event.includes("FAILED") || a.event.includes("LOCKED")
                            ? "rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400"
                            : "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        }
                      >
                        {a.event}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{formatDateTime(a.createdAt)}</span>
                    </div>
                    <p className="mt-1.5 truncate text-xs text-slate-500 dark:text-slate-400">{a.userAgent}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}