import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { TransactionsView } from "@/components/transactions/TransactionsView";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Browse your simulated transaction history.",
};

export default function TransactionsPage() {
  return (
    <div>
      <PageHeader
        title="Transactions"
        description="A complete ledger of simulated deposits, transfers, payments and refunds."
      />
      <TransactionsView />
    </div>
  );
}