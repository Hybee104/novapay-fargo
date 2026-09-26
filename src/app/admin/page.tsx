import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminUsersView } from "@/components/admin/AdminUsersView";

export const metadata: Metadata = {
  title: "Account management",
  description: "Admin tools for managing customer account status.",
};

export default async function AdminPage() {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Account management
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Activate or deactivate customer accounts. Data is always preserved.
            </p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Signed in as <span className="font-medium text-slate-700 dark:text-slate-200">{admin.email}</span>
          </p>
        </header>

        <AdminUsersView currentUserId={admin.id} />
      </div>
    </div>
  );
}
