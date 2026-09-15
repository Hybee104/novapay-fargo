import type { Metadata } from "next";
import { FargoTransactionDetailView } from "@/components/fargo/FargoTransactionDetailView";

export const metadata: Metadata = {
  title: "Transaction Details",
  description: "A single simulated Fargo ledger entry.",
};

export const dynamic = "force-dynamic";

export default async function FargoTransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FargoTransactionDetailView id={id} />;
}