import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { BANK_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Create a demo account — NovaPAY Bank",
  description: "Register for the NovaPAY Bank simulation.",
};

export default async function RegisterPage() {
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
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">
        NovaPAY Bank — Simulated Account. Registration creates a local simulated identity only.
      </p>
    </main>
  );
}