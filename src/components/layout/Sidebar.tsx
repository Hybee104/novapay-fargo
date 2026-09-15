"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { NAV_GROUPS } from "@/components/layout/nav";
import { cn, initials } from "@/lib/utils";

interface SidebarProps {
  onNavigate?: () => void;
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ onNavigate, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-slate-950">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-5 dark:border-slate-800">
        <Logo />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Main navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = item.match(pathname);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                        active
                          ? "bg-brand-900 text-white dark:bg-brand-900"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white",
                      )}
                    >
                      <Icon className="size-4.5" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-slate-200 p-3 dark:border-slate-800">
        {userName && (
          <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white">
              {initials(userName.split(" ")[0] ?? "", userName.split(" ")[1] ?? "")}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{userName}</p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">{userEmail}</p>
            </div>
          </div>
        )}
        <a
          href="/api/auth/logout"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogOut className="size-4.5" aria-hidden="true" />
          Logout
        </a>
      </div>
    </div>
  );
}