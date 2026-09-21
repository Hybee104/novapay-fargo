import type { Metadata } from "next";
import { FargoSupportView } from "@/components/fargo/FargoSupportView";

export const metadata: Metadata = {
  title: "Support",
  description: "Fargo support.",
};

export default function FargoSupportPage() {
  return <FargoSupportView />;
}