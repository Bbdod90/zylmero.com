import Link from "next/link";
import type { LeadStatus } from "@/lib/types";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
} from "@/components/leads/status-badge";
import { ProDashboardCard } from "@/components/dashboard/pro-dashboard-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const barTone: Record<LeadStatus, string> = {
  new: "bg-muted-foreground/50 dark:bg-white/25",
  active: "bg-primary",
  quote_sent: "bg-amber-500 dark:bg-amber-400/90",
  appointment_booked: "bg-primary/80",
  won: "bg-emerald-500 dark:bg-emerald-400/90",
  lost: "bg-muted-foreground/35 dark:bg-white/15",
};

export function DashboardPipelineSnapshot({
  counts,
}: {
  counts: Record<LeadStatus, number>;
}) {
  const total = LEAD_STATUSES.reduce((a, s) => a + (counts[s] ?? 0), 0);

  return (
    <ProDashboardCard
      eyebrow="Fases"
      title="Verdeling in je pipeline"
      action={
        <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-2xs" asChild>
          <Link href="/dashboard/pipeline">Open pipeline</Link>
        </Button>
      }
    >
      <ul className="space-y-3">
        {LEAD_STATUSES.map((status) => {
          const n = counts[status] ?? 0;
          const pct =
            total === 0 ? 0 : Math.min(100, Math.round((n / total) * 100));
          return (
            <li key={status} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0 truncate font-medium text-foreground">
                  {LEAD_STATUS_LABELS[status]}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {n}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/50 dark:bg-white/[0.06]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    barTone[status],
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </ProDashboardCard>
  );
}
