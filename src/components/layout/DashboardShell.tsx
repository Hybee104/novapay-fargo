"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SimulationNotice } from "@/components/layout/SimulationNotice";

interface DashboardShellProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

export function DashboardShell({ children, userName, userEmail }: DashboardShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <div className="lg:pl-64">
        {/* Desktop sidebar */}
        <div className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 dark:border-slate-800 lg:block">
          <Sidebar userName={userName} userEmail={userEmail} />
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
              tabIndex={-1}
            />
            <div className="absolute inset-y-0 left-0 shadow-2xl">
              <Sidebar userName={userName} userEmail={userEmail} onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        )}

        <Topbar onOpenMenu={() => setMenuOpen(true)} userName={userName} />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8" id="main">
          {children}
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <SimulationNotice />
          </div>
        </footer>
      </div>
    </div>
  );
}