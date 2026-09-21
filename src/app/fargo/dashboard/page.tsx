import type { Metadata } from "next";
import { FargoDashboardView } from "@/components/fargo/FargoDashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Fargo account overview.",
};

export default function FargoDashboardPage() {
  return <FargoDashboardView />;
}