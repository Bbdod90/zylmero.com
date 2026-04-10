import type { ConversionInsight } from "@/lib/sales/insights";
import { cn } from "@/lib/utils";

export function ConversionInsightPanel({
  insight,
}: {
  insight: ConversionInsight;
}) {
  const u =
    insight.urgency === "high"
      ? "Hoge urgentie"
      : insight.urgency === "medium"
        ? "Gemiddelde urgentie"
        : "Lage urgentie";

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-gradient-to-br from-card to-secondary/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold tracking-tight">
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
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Waarom deze lead waardevol is
          </p>
          <p className="mt-1 leading-relaxed text-foreground">{insight.why}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Wat ontbreekt
          </p>
          <p className="mt-1 leading-relaxed text-muted-foreground">
            {insight.missing}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Volgende stap
          </p>
          <p className="mt-1 font-medium leading-relaxed text-foreground">
            {insight.next}
          </p>
        </div>
      </div>
    </div>
  );
}
