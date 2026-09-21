import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { TransferForm } from "@/components/transfers/TransferForm";

export const metadata: Metadata = {
  title: "Transfer",
  description: "Create a money transfer.",
};

export default function TransferPage() {
  return (
    <div>
      <PageHeader
        title="Send Money"
        description="Create a transfer to any recipient."
      />
      <TransferForm />
    </div>
  );
}