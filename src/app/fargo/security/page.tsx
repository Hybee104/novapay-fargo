import type { Metadata } from "next";
import { FargoSecurityView } from "@/components/fargo/FargoSecurityView";

export const metadata: Metadata = {
  title: "Security",
  description: "Security preferences for your account.",
};

export default function FargoSecurityPage() {
  return <FargoSecurityView />;
}