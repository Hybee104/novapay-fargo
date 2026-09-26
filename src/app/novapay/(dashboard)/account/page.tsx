import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { AccountView } from "@/components/account/AccountView";
import { DemoNotice } from "@/components/ui/DemoNotice";

export const metadata: Metadata = {
  title: "Account",
  description: "View and edit your demo account details. Fictional project — not a real bank.",
};

export default function AccountPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Account"
        description="Your profile and account details."
      />
      <DemoNotice variant="inline" />
      <AccountView />
    </div>
  );
}