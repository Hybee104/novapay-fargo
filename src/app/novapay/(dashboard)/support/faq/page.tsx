"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface Faq {
  q: string;
  a: string;
  category: string;
}

const FAQS: Faq[] = [
  {
    category: "General",
    q: "Is this a real bank?",
    a: "No. NovaPAY Bank is a fictional banking demonstration. There is no real bank, account, card, or financial service behind it.",
  },
  {
    category: "General",
    q: "Is any real money involved?",
    a: "No. Every balance, transfer, transaction and notification lives only inside the local application database (dev.db). No external payment processor, bank API or real funds are ever contacted.",
  },
  {
    category: "Transfers",
    q: "Why did my transfer show as PENDING?",
    a: "Transfers are created as PENDING to demonstrate how banks reserve funds. The amount is reserved in your simulated available balance but not settled.",
  },
  {
    category: "Accounts",
    q: "What are the account and routing numbers?",
    a: "They are fictional placeholders (DEMO-7842-XXXX and DEMO-ROUTING). They exist only to make the interface look realistic and are not valid with any real institution.",
  },
  {
    category: "Security",
    q: "How secure is my demo account?",
    a: "Passwords are hashed with scrypt and sessions use signed cookies, all stored locally. The 2FA, biometric and alert toggles simulate the controls of a real banking app but do not connect to any external security service.",
  },
  {
    category: "Support",
    q: "Is the chat agent real?",
    a: "No. 'Sarah — Northstar Support' is a scripted, keyword-driven reply engine that runs locally. It never connects to any real customer-service system or network.",
  },
  {
    category: "Data",
    q: "Where is my data stored?",
    a: "Everything is stored in a local SQLite database inside this project (prisma/dev.db). Nothing is uploaded, tracked or shared anywhere.",
  },
];

export default function SupportFaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-brand-50 p-2.5 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <HelpCircle className="size-5" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">Frequently Asked Questions</h1>
      </div>

      <Card>
        <CardContent className="space-y-2 p-5">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q} className="rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0">
                      <Badge tone="brand">{faq.category}</Badge>
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={cn("size-4 shrink-0 text-slate-400 transition-transform", isOpen && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-4 py-4 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Still have questions?{" "}
        <Link href="/novapay/support" className="font-medium text-brand-700 hover:underline dark:text-brand-300">
          Start a chat with the simulated agent
        </Link>
      </p>
    </div>
  );
}