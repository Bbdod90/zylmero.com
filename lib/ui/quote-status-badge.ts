import type { QuoteStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Leesbare badges in lichte én donkere modus (geen wit op lichtoranje). */
export function quoteStatusBadgeClass(status: QuoteStatus) {
  return cn(
    "rounded-full border px-3 py-1 text-2xs font-semibold uppercase tracking-wide",
    status === "draft" &&
      "border-border bg-muted/70 text-foreground shadow-sm dark:border-white/[0.12] dark:bg-white/[0.06]",
    status === "sent" &&
      "border-amber-800/30 bg-amber-100 text-amber-950 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-50",
    status === "accepted" &&
      "border-emerald-700/30 bg-emerald-50 text-emerald-950 shadow-sm dark:border-primary/35 dark:bg-primary/12 dark:text-primary",
    status === "declined" &&
      "border-border bg-muted/80 text-muted-foreground dark:border-white/[0.1] dark:bg-muted/30",
  );
}
