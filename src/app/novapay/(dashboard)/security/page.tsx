import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { SecurityView } from "@/components/security/SecurityView";

export const metadata: Metadata = {
  title: "Security",
  description: "Manage the security settings of your demo account.",
};

export default function SecurityPage() {
  return (
    <div>
      <PageHeader
        title="Security"
        description="Simulated security settings, password and sign-in activity."
      />
      <SecurityView />
    </div>
  );
}