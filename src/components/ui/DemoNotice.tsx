import { FlaskConical, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEMO_DISCLOSURE_LONG,
  SIMULATED_DATA_DISCLOSURE,
} from "@/lib/constants";

type Variant = "banner" | "card" | "inline";

interface DemoNoticeProps {
  /**
   * banner — full-width strip pinned above an authenticated app shell
   * card   — bordered panel for marketing/auth pages
   * inline — quiet single line for dense data views
   */
  variant?: Variant;
  /** Optional bank name so each environment discloses itself explicitly. */
  bankName?: string;
  /** Overrides the body text (used to label generated ledger data). */
  message?: string;
  className?: string;
}

/**
 * Persistent "this is a demo, not a bank" disclosure.
 *
 * Rendered on the homepage, login page, both authenticated dashboards and the
 * account pages so the fictional nature of the app is never ambiguous. Kept
 * deliberately visible and professional rather than hidden behind a link.
 */
export function DemoNotice({
  variant = "card",
  bankName,
  message,
  className,
}: DemoNoticeProps) {
  const bankNote = bankName
    ? ` The ${bankName} area is part of the same fictional demo and is not a real financial institution.`
    : null;
  const body = message ?? (variant === "inline" ? SIMULATED_DATA_DISCLOSURE : DEMO_DISCLOSURE_LONG);

  if (variant === "inline") {
    return (
      <p
        role="note"
        className={cn(
          "flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400",
          className,
        )}
      >
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>{body}</span>
      </p>
    );
  }

  if (variant === "banner") {
    return (
      <div
        role="note"
        className={cn(
          "border-b border-amber-300/70 bg-amber-50 px-4 py-2.5 text-amber-950 sm:px-6 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100",
          className,
        )}
      >
        <div className="mx-auto flex max-w-6xl items-start gap-2.5 text-xs leading-relaxed sm:text-sm">
          <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-bold uppercase tracking-wide">Demo project.</span> {body}
            {bankNote}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="note"
      className={cn(
        "rounded-2xl border border-amber-300/80 bg-amber-50/80 p-4 dark:border-amber-500/40 dark:bg-amber-950/30",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
          <FlaskConical className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Demo project</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-200/85">{body}</p>
          {bankNote ? (
            <p className="mt-1.5 text-xs leading-relaxed text-amber-800 dark:text-amber-200/85">
              {bankNote.trim()}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
