import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FARGO_BANK_NAME } from "@/lib/constants";

interface FargoLogoProps {
  compact?: boolean;
  dark?: boolean;
  className?: string;
}

export function FargoLogo({ compact = false, dark = false, className }: FargoLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-9 items-center justify-center rounded-xl bg-fargo-700 text-fargo-100 shadow-sm">
        <Building2 className="size-5" aria-hidden="true" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className={cn("text-base font-bold tracking-tight", dark ? "text-white" : "text-slate-900 dark:text-white")}>
            {FARGO_BANK_NAME}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            Digital Banking
          </p>
        </div>
      )}
    </div>
  );
}
