import type { ConversionInsight } from "@/lib/sales/insights";
import { cn } from "@/lib/utils";

export function ConversionInsightPanel({
  insight,
  compact = false,
}: {
  insight: ConversionInsight;
  /** Strakkere padding en tekst — o.a. lead-werkruimte */
  compact?: boolean;
}) {
  const u =
    insight.urgency === "high"
      ? "Hoge urgentie"
      : insight.urgency === "medium"
        ? "Gemiddelde urgentie"
        : "Lage urgentie";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-gradient-to-br from-card to-secondary/10",
        compact ? "space-y-2.5 p-3.5" : "space-y-4 p-5",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={cn(
            "font-semibold tracking-tight",
            compact ? "text-xs" : "text-sm",
          )}
        >
          Conversie-inzichten
        </p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            insight.urgency === "high" &&
              "bg-destructive/15 text-destructive",
            insight.urgency === "medium" &&
              "bg-amber-500/15 text-amber-900 dark:text-amber-100",
            insight.urgency === "low" && "bg-muted text-muted-foreground",
          )}
        >
          {u}
        </span>
      </div>
      <div
        className={cn(
          compact ? "space-y-2 text-xs" : "space-y-3 text-sm",
        )}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Waarom deze lead waardevol is
          </p>
          <p
            className={cn(
              "mt-0.5 leading-snug text-foreground",
              compact && "text-xs",
            )}
          >
            {insight.why}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Wat ontbreekt
          </p>
          <p
            className={cn(
              "mt-0.5 leading-snug text-muted-foreground",
              compact && "text-xs",
            )}
          >
            {insight.missing}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Volgende stap
          </p>
          <p
            className={cn(
              "mt-0.5 font-medium leading-snug text-foreground",
              compact && "text-xs",
            )}
          >
            {insight.next}
          </p>
        </div>
      </div>
    </div>
  );
}
