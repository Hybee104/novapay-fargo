import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Headphones,
  LayoutGrid,
  MoveUpRight,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { BANK_TAGLINE } from "@/lib/constants";

export const metadata = {
  title: "NovaPAY Bank",
  description: "NovaPAY Bank — digital banking made simple.",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
            <a href="#features" className="hover:text-brand-800 dark:hover:text-brand-300">Features</a>
            <a href="#account" className="hover:text-brand-800 dark:hover:text-brand-300">Account</a>
            <a href="#faq" className="hover:text-brand-800 dark:hover:text-brand-300">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/novapay/dashboard">
              <Button size="sm">
                Open Dashboard
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_20%,rgba(68,113,179,0.16),transparent_60%)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-6xl dark:text-white">
              Digital banking,
              <span className="text-brand-700 dark:text-brand-400"> secure and effortless.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              {BANK_TAGLINE}. Manage dashboards, transfers, transaction history, analytics,
              notifications and support from a single place.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" fullWidth>
                  Get started
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              New accounts are created by an administrator.
            </p>
          </div>
        </section>

        {/* Feature grid */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">Everything a modern banking app needs</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-600 dark:text-slate-300">
              Every feature is built end-to-end with the same patterns a modern banking product would use.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<LayoutGrid className="size-5" aria-hidden="true" />}
              title="Interactive Dashboard"
              text="Available balance hero, pending activity, monthly spending vs credits and a live balance chart."
            />
            <FeatureCard
              icon={<MoveUpRight className="size-5" aria-hidden="true" />}
              title="Transfers"
              text="Create pending transfers with confirmation steps, references and automated notifications."
            />
            <FeatureCard
              icon={<BarChart3 className="size-5" aria-hidden="true" />}
              title="Balance Analytics"
              text="Recharts-powered balance history and monthly spending/credit breakdowns with range filters."
            />
            <FeatureCard
              icon={<BellRing className="size-5" aria-hidden="true" />}
              title="Notifications"
              text="Read and unread alerts with mark-all-as-read, generated as you use your account."
            />
            <FeatureCard
              icon={<Headphones className="size-5" aria-hidden="true" />}
              title="Support"
              text="Chat with the support assistant, open tickets and browse an FAQ."
            />
            <FeatureCard
              icon={<ShieldCheck className="size-5" aria-hidden="true" />}
              title="Security Center"
              text="Hashed passwords, signed sessions, security toggles and a login-activity log."
            />
          </div>
        </section>

        {/* Account overview */}
        <section id="account" className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                  Every account starts with full history
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  When an administrator provisions an account, the app generates a multi-year
                  ledger of transactions, monthly balance snapshots, pending items, notifications
                  and a support conversation so the interface is immediately usable.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <Bullet>Multi-year transaction history</Bullet>
                  <Bullet>Pending and completed ledger states</Bullet>
                  <Bullet>Monthly balance snapshots for charting</Bullet>
                  <Bullet>Counterparties and references</Bullet>
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Built for everyday use</p>
                <ul className="mt-2 space-y-1.5">
                  <li>Check balances and recent activity at a glance</li>
                  <li>Send and track transfers between accounts</li>
                  <li>Review spending and credit trends over time</li>
                  <li>Manage security settings and notifications</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">Common questions</h2>
          <div className="mt-8 space-y-3">
            <FaqItem
              q="How do I get an account?"
              a="Accounts are provisioned by an administrator from the admin dashboard, which keeps access to the application controlled."
            />
            <FaqItem
              q="What can I do after signing in?"
              a="You can review balances and transaction history, send transfers, track pending items, read analytics, manage notifications and contact support."
            />
            <FaqItem
              q="Is my account secure?"
              a="Sign-in details are hashed with scrypt and sessions use signed cookies. The security centre also provides two-factor, biometric and alert preferences plus a login-activity log."
            />
            <FaqItem
              q="How do I get help?"
              a="Use the support assistant in the app, open a ticket, or browse the FAQ. The security centre lets you review recent sign-in activity at any time."
            />
          </div>
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Ready to explore the interface?{" "}
            <Link href="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">
              Sign in
            </Link>
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center sm:px-6">
          <Logo />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2026 NovaPAY Bank. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <span className="inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{icon}</span>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{text}</p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{q}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{a}</p>
    </div>
  );
}