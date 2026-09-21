import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { NotificationsView } from "@/components/notifications/NotificationsView";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Account notifications for your profile.",
};

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Alerts about your account activity."
      />
      <NotificationsView />
    </div>
  );
}