import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  /** Visual focus accent. Defaults to "brand" (NovaPAY), use "fargo" for the Fargo shell. */
  tone?: "brand" | "fargo";
}

const focusTone: Record<"brand" | "fargo", string> = {
  brand: "focus:border-brand-600 focus:ring-brand-200 dark:focus:ring-brand-900/40",
  fargo: "focus:border-fargo-600 focus:ring-fargo-200 dark:focus:ring-fargo-900/40",
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, placeholder, tone = "brand", className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            "block w-full appearance-none rounded-lg border bg-white pl-3.5 pr-10 text-sm text-slate-900 transition-colors",
            "focus:outline-none focus:ring-2",
error
            ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500/70 dark:focus:ring-red-900/40"
            : cn(
                "border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                focusTone[tone],
              ),
            "h-11 disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 flex items-start gap-1 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
});