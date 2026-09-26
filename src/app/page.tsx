import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Headphones,
  Landmark,
  LayoutGrid,
  Moon,
  MoveUpRight,
  ScanFace,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { DEMO_USER, BANK_TAGLINE } from "@/lib/constants";

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
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-800 dark:bg-brand-500/10 dark:text-brand-300">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Secure digital banking
            </div>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-6xl dark:text-white">
              Modern digital banking,
              <span className="text-brand-700 dark:text-brand-400"> built for you.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              {BANK_TAGLINE}. Explore balances, transfers, transaction history, analytics, notifications and support — all in one place, ready to explore.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" fullWidth>
                  Sign in to NovaPAY
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 font-mono text-xs text-slate-400 dark:text-slate-500">
              Example login: {DEMO_USER.email} · {DEMO_USER.password}
            </p>
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

        {/* Demo section */}
        <section id="account" className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-500/10 dark:text-brand-300">
                  <Landmark className="size-3.5" aria-hidden="true" />
                  Seeded account
                </span>
                <h2 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                  Start with a $650,000.00 opening balance
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Your account comes with a full 2021–2026 transaction history, an opening balance of
                  $650,000.00, pending transfers, notifications and a ready-to-use support conversation. Every entry
                  is marked PENDING or COMPLETED in the ledger.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <Bullet>Premium Dollar Checking account in USD</Bullet>
                  <Bullet>5 years of transaction history</Bullet>
                  <Bullet>Pending-transfer workflow with reserved funds</Bullet>
                  <Bullet>Fully responsive with dark mode support</Bullet>
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 shadow-2xl dark:border-slate-800">
                <BalanceMock />
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
              a="NovaPAY Bank is a digital banking platform — there is no real bank, account, card, or financial service behind it."
            />
            <FaqItem
              q="Can I lose or send real money?"
              a="No real money is ever sent or received. Transfers only update a numeric balance inside your bank account."
            />
            <FaqItem
              q="Is my data safe / private?"
              a="Everything stays on your machine. Passwords are hashed with scrypt, sessions use signed cookies, and nothing is uploaded anywhere."
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

function BalanceMock() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Moon className="size-3.5" aria-hidden="true" />
          Dashboard preview
        </span>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-400">Active</span>
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Available balance</p>
        <p className="mt-1 text-3xl font-bold text-white">$650,000.00</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          <ScanFace className="size-3.5" aria-hidden="true" />
          Premium Dollar Checking · USD
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MockStat label="Pending debits" value="$10,000.00" tone="text-amber-400" />
        <MockStat label="Pending credits" value="$1,250.00" tone="text-sky-400" />
        <MockStat label="Total entries" value="128" tone="text-slate-100" />
        <MockStat label="Monthly credits" value="$18,400.00" tone="text-emerald-400" />
      </div>
      <div className="flex h-16 items-end gap-1" aria-hidden="true">
        {[38, 46, 42, 60, 52, 70, 62, 82, 74, 92, 84, 100, 66].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-brand-800/60 to-brand-500" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function MockStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl bg-slate-900 px-3 py-2.5 ring-1 ring-inset ring-white/10">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${tone}`}>{value}</p>
    </div>
  );
}