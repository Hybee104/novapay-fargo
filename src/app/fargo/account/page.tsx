import type { Metadata } from "next";
import { FargoAccountView } from "@/components/fargo/FargoAccountView";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Fargo checking account details.",
};

export default function FargoAccountPage() {
  return (
    <div className="space-y-5">
      <FargoAccountView />
    </div>
  );
}