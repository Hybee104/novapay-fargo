"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Menu, Moon, Sun, ShieldCheck } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onOpenMenu: () => void;
  userName?: string;
}

export function Topbar({ onOpenMenu, userName }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [unread, setUnread] = useState(0);
  const [loadingUnread, setLoadingUnread] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadUnread() {
      try {
        const res = await fetch("/api/notifications/unread", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { count: number };
          if (!cancelled) setUnread(data.count);
        }
      } catch {
        // network errors ignored — badge just stays zero
      } finally {
        if (!cancelled) setLoadingUnread(false);
      }
    }
    loadUnread();
    const interval = window.setInterval(loadUnread, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <button
        type="button"
        onClick={onOpenMenu}
        className="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        <span className="text-xs font-semibold">Active Session</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>

        <Link
          href="/novapay/notifications"
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span
              className={cn(
                "absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white",
                loadingUnread && "opacity-60",
              )}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        <div className="ml-1 hidden h-9 w-9 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white sm:flex" aria-hidden="true">
          {userName?.[0]?.toUpperCase() ?? "M"}
        </div>
      </div>
    </header>
  );
}