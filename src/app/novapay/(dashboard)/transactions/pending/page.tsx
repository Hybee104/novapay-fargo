import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { TransactionsView } from "@/components/transactions/TransactionsView";

export const metadata: Metadata = {
  title: "Pending Transactions",
  description: "Simulated transactions that are awaiting confirmation.",
};

export default function PendingTransactionsPage() {
  return (
    <div>
      <PageHeader
        title="Pending Transactions"
        description="Simulated transfers awaiting confirmation. Nothing leaves this application."
      />
      <TransactionsView initialStatus="PENDING" />
    </div>
  );
}