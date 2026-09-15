import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Visual focus accent. Defaults to "brand" (NovaPAY), use "fargo" for the Fargo shell. */
  tone?: "brand" | "fargo";
}

const focusTone: Record<"brand" | "fargo", string> = {
  brand: "focus:border-brand-600 focus:ring-brand-200 dark:focus:ring-brand-900/40",
  fargo: "focus:border-fargo-600 focus:ring-fargo-200 dark:focus:ring-fargo-900/40",
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, tone = "brand", className, id, rows = 4, ...props },
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
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn(
          "block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors",
          "placeholder:text-slate-400",
          "focus:outline-none focus:ring-2",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500/70 dark:focus:ring-red-900/40"
            : cn(
                "border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                focusTone[tone],
              ),
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      />
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