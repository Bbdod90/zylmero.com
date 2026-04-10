import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeamPerformanceSnapshot } from "@/lib/queries/team-performance";
import { Users } from "lucide-react";

export function TeamPerformanceWidget({
  data,
}: {
  data: TeamPerformanceSnapshot;
}) {
  return (
    <Card className="rounded-2xl border-border/50 bg-gradient-to-b from-card to-card/95 dark:border-white/[0.07]">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <Users className="size-4 text-primary" />
        <CardTitle className="text-base font-semibold tracking-tight">
          Team prestaties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-2xs uppercase tracking-wider text-muted-foreground">
          {data.periodLabel}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-2xs text-muted-foreground">Reactiesnelheid</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {data.avgResponseMinutes != null
                ? `${data.avgResponseMinutes} min gem.`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-2xs text-muted-foreground">Leads behandeld</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {data.leadsHandled}
            </p>
          </div>
          <div>
            <p className="text-2xs text-muted-foreground">Deals gesloten</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {data.dealsClosed}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
