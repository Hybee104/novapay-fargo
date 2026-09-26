import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "@/components/auth/LoginForm";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { BANK_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sign in — NovaPAY Bank (Demo)",
  description:
    "Sign in to the NovaPAY demo application. Fictional project — not a real bank, and no working credentials are published on this page.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/novapay/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <Link href="/" aria-label="NovaPAY Bank home">
        <Logo />
      </Link>
      <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
        {BANK_TAGLINE}
      </p>
      <div className="mt-6 w-full max-w-md">
        <DemoNotice />
      </div>
      <div className="mt-8 w-full max-w-md">
        <LoginForm />
      </div>
      <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">
        © 2026 NovaPAY — a fictional demo project. Not a real bank.
      </p>
    </main>
  );
}