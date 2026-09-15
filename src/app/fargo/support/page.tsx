import type { Metadata } from "next";
import { FargoSupportView } from "@/components/fargo/FargoSupportView";

export const metadata: Metadata = {
  title: "Support",
  description: "Simulated Fargo support.",
};

export default function FargoSupportPage() {
  return <FargoSupportView />;
}