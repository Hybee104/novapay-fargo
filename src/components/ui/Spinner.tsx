import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("size-5 animate-spin text-brand-700 dark:text-brand-300", className)}
      aria-hidden="true"
    />
  );
}

export function FullPageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20" role="status">
      <Spinner className="size-7" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}…</p>
    </div>
  );
}