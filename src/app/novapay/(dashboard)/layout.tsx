import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your NovaPAY Bank demo account overview.",
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <DashboardShell userName={`${user.firstName} ${user.lastName}`} userEmail={user.email}>
      {children}
    </DashboardShell>
  );
}