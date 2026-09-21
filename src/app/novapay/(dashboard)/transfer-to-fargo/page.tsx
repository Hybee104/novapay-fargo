import type { Metadata } from "next";
import { NovaTransferToFargoView } from "@/components/transfers/NovaTransferToFargoView";

export const metadata: Metadata = {
  title: "Transfer to Fargo",
  description: "Move funds from NovaPAY into Fargo.",
};

export default function TransferToFargoPage() {
  return <NovaTransferToFargoView />;
}