import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { NotificationsView } from "@/components/notifications/NotificationsView";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Simulated account notifications for your demo profile.",
};

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Simulated alerts about your demo account activity."
      />
      <NotificationsView />
    </div>
  );
}