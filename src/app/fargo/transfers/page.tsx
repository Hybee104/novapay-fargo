import type { Metadata } from "next";
import { FargoTransfersView } from "@/components/fargo/FargoTransfersView";

export const metadata: Metadata = {
  title: "Transfers",
  description: "Internal transfers into your Fargo account.",
};

export default function FargoTransfersPage() {
  return <FargoTransfersView />;
}