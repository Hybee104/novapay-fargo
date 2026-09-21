import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { SupportHub } from "@/components/support/SupportHub";

export const metadata: Metadata = {
  title: "Support",
  description: "Chat with a support specialist or open a ticket.",
};

export default function SupportPage() {
  return (
    <div>
      <PageHeader
        title="Support Center"
        description="Talk to a support specialist, open a ticket, or browse the FAQ."
      />
      <SupportHub />
    </div>
  );
}