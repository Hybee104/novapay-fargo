import type { Metadata } from "next";
import { FargoAccountView } from "@/components/fargo/FargoAccountView";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Fargo simulated checking account details.",
};

export default function FargoAccountPage() {
  return <FargoAccountView />;
}