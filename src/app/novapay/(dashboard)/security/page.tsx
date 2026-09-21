import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { SecurityView } from "@/components/security/SecurityView";

export const metadata: Metadata = {
  title: "Security",
  description: "Manage the security settings of your account.",
};

export default function SecurityPage() {
  return (
    <div>
      <PageHeader
        title="Security"
        description="Security settings, password and sign-in activity."
      />
      <SecurityView />
    </div>
  );
}