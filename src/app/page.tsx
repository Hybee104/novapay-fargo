import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  FlaskConical,
  Headphones,
  LayoutGrid,
  Moon,
  MoveUpRight,
  ScanFace,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { BANK_TAGLINE } from "@/lib/constants";

export const metadata = {
  title: "NovaPAY Bank — Fictional Banking Demonstration",
  description:
    "NovaPAY BANK is a fictional banking demonstration. No real banking services, accounts, or money are provided.",
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
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200">
              <FlaskConical className="size-3.5" aria-hidden="true" />
              Fictional demo project
            </div>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-6xl dark:text-white">
              A fictional banking UI,
              <span className="text-brand-700 dark:text-brand-400"> built for demonstration.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              {BANK_TAGLINE}. A portfolio project that exercises dashboards, transfers,
              transaction history, analytics, notifications and support — with entirely invented
              data.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" fullWidth>
                  Open the demo
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              No sign-up is public — an administrator creates demo accounts.
            </p>
            <div className="mx-auto mt-8 max-w-2xl text-left">
              <DemoNotice />
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">Everything a modern banking app needs</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-600 dark:text-slate-300">
            Every feature is built end-to-end with the same patterns a real banking product would use.
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

        {/* Demo contents */}
        <section id="account" className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200">
                  <FlaskConical className="size-3.5" aria-hidden="true" />
                  Sample data generator
                </span>
                <h2 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                  Every account starts with generated history
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  When an administrator provisions a demo account, the app deterministically
                  generates a multi-year ledger of invented transactions, monthly balance snapshots,
                  pending items, notifications and a support conversation. Every figure is synthetic
                  test data chosen to exercise the interface.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <Bullet>Deterministic multi-year transaction history</Bullet>
                  <Bullet>Pending and completed ledger states</Bullet>
                  <Bullet>Monthly balance snapshots for charting</Bullet>
                  <Bullet>Synthetic counterparties and references</Bullet>
                </ul>
              </div>
              <div className="space-y-4">
                <DemoNotice
                  bankName="Fargo"
                  message="NovaPAY and Fargo are both invented brands created for this demo. The account numbers, routing numbers, balances and transaction records shown inside the app are fabricated sample values."
                />
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">What this is not</p>
                  <ul className="mt-2 space-y-1.5">
                    <li>Not a bank, lender, or licensed financial institution</li>
                    <li>Not connected to any payment network or real account</li>
                    <li>Not able to hold, move, or request real money</li>
                    <li>Not an offer of any financial product or service</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">Common questions</h2>
          <div className="mt-8 space-y-3">
            <FaqItem
              q="Is this a real bank?"
              a="No. NovaPAY is a fictional banking application built as a software demonstration project. There is no real bank, account, card, or financial service behind it, and the NovaPAY and Fargo brands are invented for this demo."
            />
            <FaqItem
              q="Can I lose or send real money?"
              a="No. There is no real money anywhere in this project. Transfers only change a synthetic number inside this demonstration application."
            />
            <FaqItem
              q="Are the balances and transactions real?"
              a="No. Balances, account and routing numbers, counterparties and the full transaction history are generated sample data created to exercise the interface."
            />
            <FaqItem
              q="Is my data safe / private?"
              a="Sign-in details are hashed with scrypt and sessions use signed cookies. Never reuse a real password here — this is a demo, not a service."
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
            © 2026 NovaPAY — a fictional demo project. Not a real bank.
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