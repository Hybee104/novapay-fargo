import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DemoNotice } from "@/components/ui/DemoNotice";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Demo NovaPAY dashboard. Fictional project — not a real bank.",
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <DemoNotice variant="banner" />
      <DashboardShell userName={`${user.firstName} ${user.lastName}`} userEmail={user.email}>
        {children}
      </DashboardShell>
    </>
  );
}