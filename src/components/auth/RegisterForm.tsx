"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setField(name: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    const clientErrors: Record<string, string> = {};
    if (!form.firstName.trim()) clientErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) clientErrors.lastName = "Last name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) clientErrors.email = "Enter a valid email address.";
    if (form.password.length < 8) clientErrors.password = "Password must be at least 8 characters.";
    if (form.confirmPassword !== form.password) clientErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create an account</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Join NovaPAY Bank in less than a minute.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              autoComplete="given-name"
              placeholder="Michael"
              value={form.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              error={errors.firstName}
            />
            <Input
              label="Last name"
              autoComplete="family-name"
              placeholder="Anderson"
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              error={errors.lastName}
            />
          </div>

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            error={errors.email}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters with uppercase, lowercase and a number."
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            error={errors.password}
          />

          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => setField("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
          />

          {formError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              {formError}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline dark:text-brand-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}