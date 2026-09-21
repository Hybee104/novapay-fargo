import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { AccountView } from "@/components/account/AccountView";

export const metadata: Metadata = {
  title: "Account",
  description: "View and edit your account details.",
};

export default function AccountPage() {
  return (
    <div>
      <PageHeader
        title="Account"
        description="Your profile and account details."
      />
      <AccountView />
    </div>
  );
}