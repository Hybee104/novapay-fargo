import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { FargoShell } from "@/components/fargo/FargoShell";

export const metadata: Metadata = {
  title: "Fargo",
  description: "Your Fargo digital checking account.",
};

export const dynamic = "force-dynamic";

export default async function FargoLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <FargoShell userName={`${user.firstName} ${user.lastName}`} userEmail={user.email}>
      {children}
    </FargoShell>
  );
}