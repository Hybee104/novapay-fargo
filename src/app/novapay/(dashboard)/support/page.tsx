import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { SupportHub } from "@/components/support/SupportHub";

export const metadata: Metadata = {
  title: "Support",
  description: "Chat with the simulated support agent or open a demo ticket.",
};

export default function SupportPage() {
  return (
    <div>
      <PageHeader
        title="Support Center"
        description="Talk to the simulated agent, open a ticket, or browse the FAQ."
      />
      <SupportHub />
    </div>
  );
}