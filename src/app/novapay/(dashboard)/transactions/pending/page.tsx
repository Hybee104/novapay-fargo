import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { TransactionsView } from "@/components/transactions/TransactionsView";

export const metadata: Metadata = {
  title: "Pending Transactions",
  description: "Transactions that are awaiting confirmation.",
};

export default function PendingTransactionsPage() {
  return (
    <div>
      <PageHeader
        title="Pending Transactions"
        description="Transfers awaiting confirmation."
      />
      <TransactionsView initialStatus="PENDING" />
    </div>
  );
}