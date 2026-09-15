import type { Metadata } from "next";
import { FargoNewPaymentView } from "@/components/fargo/FargoNewPaymentView";

export const metadata: Metadata = {
  title: "New Payment",
  description: "Create a simulated Fargo payment.",
};

export default function FargoNewPaymentPage() {
  return <FargoNewPaymentView />;
}