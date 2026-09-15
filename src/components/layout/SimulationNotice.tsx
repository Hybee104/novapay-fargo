import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { SIMULATION_NOTICE, SIMULATION_COPY } from "@/lib/constants";

export function SimulationNotice({ className }: { className?: string }) {
  return (
    <p role="note" className={cn("flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500", className)}>
      <Info className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="font-medium">{SIMULATION_NOTICE}.</span>
      <span>{SIMULATION_COPY}</span>
    </p>
  );
}