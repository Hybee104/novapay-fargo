import type { Metadata } from "next";
import { FargoTransactionsView } from "@/components/fargo/FargoTransactionsView";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Every simulated entry in your Fargo ledger.",
};

export default function FargoTransactionsPage() {
  return <FargoTransactionsView />;
}