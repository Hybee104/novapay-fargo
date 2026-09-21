import type { Metadata } from "next";
import { FargoNotificationsView } from "@/components/fargo/FargoNotificationsView";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Alerts for your Fargo account.",
};

export default function FargoNotificationsPage() {
  return <FargoNotificationsView />;
}