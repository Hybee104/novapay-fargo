import type { Metadata } from "next";
import { FargoNotificationsView } from "@/components/fargo/FargoNotificationsView";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Simulated alerts for your Fargo account.",
};

export default function FargoNotificationsPage() {
  return <FargoNotificationsView />;
}