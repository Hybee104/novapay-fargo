import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { BANK_NAME } from "@/lib/constants";

interface LogoProps {
  compact?: boolean;
  dark?: boolean;
  className?: string;
}

export function Logo({ compact = false, dark = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-9 items-center justify-center rounded-xl bg-brand-900 text-brand-100 shadow-sm">
        <Landmark className="size-5" aria-hidden="true" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className={cn("text-base font-bold tracking-tight", dark ? "text-white" : "text-slate-900 dark:text-white")}>
            {BANK_NAME.split(" ")[0]}
            <span className="ml-1 font-normal text-brand-600">Bank</span>
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            Demo Banking
          </p>
        </div>
      )}
    </div>
  );
}