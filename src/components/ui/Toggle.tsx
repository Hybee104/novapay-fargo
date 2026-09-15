"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Accent color. Defaults to "brand" (NovaPAY), use "fargo" for the Fargo shell. */
  tone?: "brand" | "fargo";
}

export function Toggle({ checked, onCheckedChange, label, description, disabled, loading, tone = "brand" }: ToggleProps) {
  const id = useId();

  const focusRing =
    tone === "fargo"
      ? "focus-visible:ring-fargo-500"
      : "focus-visible:ring-brand-500";

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {label}
        </label>
        {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled || loading}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
          focusRing,
          disabled && "cursor-not-allowed opacity-50",
          checked
            ? tone === "fargo"
              ? "bg-fargo-700"
              : "bg-brand-800"
            : "bg-slate-300 dark:bg-slate-700",
        )}
      >
        <span
          className={cn(
            "inline-block size-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}