import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { BalanceHistoryView } from "@/components/balance/BalanceHistoryView";

export const metadata: Metadata = {
  title: "Balance History",
  description: "Track your balance over time.",
};

export default function BalanceHistoryPage() {
  return (
    <div>
      <PageHeader
        title="Balance History"
        description="A visual history of the available balance of your account."
      />
      <BalanceHistoryView />
    </div>
  );
}