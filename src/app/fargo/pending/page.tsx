import type { Metadata } from "next";
import { FargoPendingView } from "@/components/fargo/FargoPendingView";

export const metadata: Metadata = {
  title: "Pending",
  description: "Pending simulated Fargo payments.",
};

export default function FargoPendingPage() {
  return <FargoPendingView />;
}