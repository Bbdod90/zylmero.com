import type { LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS: Record<LeadStatus, string> = {
  new: "Nieuw",
  active: "Actief",
  quote_sent: "Offerte verstuurd",
  appointment_booked: "Afspraak ingepland",
  won: "Gewonnen",
  lost: "Verloren",
};

export function FunnelStrip({
  funnel,
}: {
  funnel: { stage: LeadStatus; count: number }[];
}) {
  const pipeline = funnel.filter((f) => f.stage !== "lost");
  const max = Math.max(1, ...pipeline.map((f) => f.count));

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">
        Verkoopfunnel
      </p>
      <div className="grid gap-3 sm:grid-cols-5">
        {pipeline.map((step) => {
          const pct = Math.round((step.count / max) * 100);
          return (
            <div key={step.stage} className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {LABELS[step.stage]}
                </span>
                <span className="text-lg font-semibold tabular-nums">
                  {step.count}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full bg-primary/80 transition-all",
                    step.stage === "won" && "bg-primary",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {step.count === 0 ? "Leeg" : "Lopend"}
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Nieuw → actief → offerte → afspraak → gewonnen. Balken vergelijken volume
        per fase (waar je leads nu staan).
      </p>
    </div>
  );
}
