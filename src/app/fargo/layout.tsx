import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { FargoShell } from "@/components/fargo/FargoShell";
import { DemoNotice } from "@/components/ui/DemoNotice";

export const metadata: Metadata = {
  title: "Fargo (Demo)",
  description: "Demo Fargo checking area. Fictional project — not a real bank.",
};

export const dynamic = "force-dynamic";

export default async function FargoLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <DemoNotice variant="banner" bankName="Fargo" />
      <FargoShell userName={`${user.firstName} ${user.lastName}`} userEmail={user.email}>
        {children}
      </FargoShell>
    </>
  );
}