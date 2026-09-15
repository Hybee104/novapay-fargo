"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DEMO_USER } from "@/lib/constants";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email is required." }));
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required." }));
    }
    if (!email.trim() || !password) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        setErrors(data.errors ?? {});
        return;
      }
      router.push("/novapay/dashboard");
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail(DEMO_USER.email);
    setPassword(DEMO_USER.password);
    setErrors({});
    setFormError(null);
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sign in to your account</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Access the NovaPAY Bank demonstration dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 rounded border-slate-300 text-brand-800 focus:ring-brand-500 dark:border-slate-600"
              />
              Remember me
            </label>
            <Link
              href="/register"
              className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
            >
              Forgot password?
            </Link>
          </div>

          {formError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              {formError}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
            <Sparkles className="size-4" aria-hidden="true" />
            Demo credentials
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300/80">
            Email: <span className="font-mono">{DEMO_USER.email}</span>
            <br />
            Password: <span className="font-mono">{DEMO_USER.password}</span>
          </p>
          <button
            type="button"
            onClick={fillDemo}
            className="mt-2 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-500/50 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-slate-800"
          >
            Fill demo credentials
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        New to the demo?{" "}
        <Link href="/register" className="font-medium text-brand-700 hover:underline dark:text-brand-300">
          Create a demo account
        </Link>
      </p>
    </div>
  );
}