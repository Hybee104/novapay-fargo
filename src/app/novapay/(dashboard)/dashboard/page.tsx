import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your NovaPAY Bank demo account overview.",
};

export default function DashboardPage() {
  return <DashboardView />;
}