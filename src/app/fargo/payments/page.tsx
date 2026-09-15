import type { Metadata } from "next";
import { FargoPaymentsView } from "@/components/fargo/FargoPaymentsView";

export const metadata: Metadata = {
  title: "Payments",
  description: "Simulated Fargo payments.",
};

export default function FargoPaymentsPage() {
  return <FargoPaymentsView />;
}