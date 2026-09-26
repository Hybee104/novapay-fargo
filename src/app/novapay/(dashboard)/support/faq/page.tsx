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
    a: "No. NovaPAY Bank is a fictional banking application built as a software demonstration project. There is no real bank, account, card, or financial service behind it, and the NovaPAY and Fargo brands are invented for this demo.",
  },
  {
    category: "General",
    q: "Is any real money involved?",
    a: "No. Balances, transfers, transactions and notifications are synthetic demo values held only inside this demonstration application. No external payment processor, bank API or real funds are ever contacted.",
  },
  {
    category: "Transfers",
    q: "Why did my transfer show as PENDING?",
    a: "Transfers are created as PENDING to mirror how banks reserve funds. The amount is reserved in your available balance and settles once approval is confirmed.",
  },
  {
    category: "Accounts",
    q: "What are the account and routing numbers?",
    a: "They are masked placeholders (7842-XXXX and 084000026) used to keep the interface realistic and are not valid with any real institution.",
  },
  {
    category: "Security",
    q: "How secure is my account?",
    a: "Passwords are hashed with scrypt and sessions use signed cookies. The 2FA, biometric and alert toggles mirror the controls of a real banking app.",
  },
  {
    category: "Support",
    q: "Is the chat agent real?",
    a: "No. 'Sarah — Northstar Support' is an automated, keyword-driven reply engine. It never connects to any real customer-service system.",
  },
  {
    category: "Data",
    q: "Where is my data stored?",
    a: "This is a fictional demonstration application, so the sign-in details you enter and the generated demo records are stored by the application itself in order to run the demo. Do not enter real personal information and never reuse a real password here.",
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
          Start a chat with our support team
        </Link>
      </p>
    </div>
  );
}