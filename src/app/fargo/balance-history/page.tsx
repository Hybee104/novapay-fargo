import type { Metadata } from "next";
import { FargoBalanceHistoryView } from "@/components/fargo/FargoBalanceHistoryView";

export const metadata: Metadata = {
  title: "Balance History",
  description: "Simulated balance history for your Fargo account.",
};

export default function FargoBalanceHistoryPage() {
  return <FargoBalanceHistoryView />;
}