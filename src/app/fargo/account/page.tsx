import type { Metadata } from "next";
import { FargoAccountView } from "@/components/fargo/FargoAccountView";
import { DemoNotice } from "@/components/ui/DemoNotice";

export const metadata: Metadata = {
  title: "Account",
  description: "Your demo Fargo checking account details. Fictional project — not a real bank.",
};

export default function FargoAccountPage() {
  return (
    <div className="space-y-5">
      <DemoNotice variant="inline" />
      <FargoAccountView />
    </div>
  );
}