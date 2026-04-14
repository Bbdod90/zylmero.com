import Link from "next/link";
import {
  Calendar,
  Kanban,
  MessageSquare,
  Users,
} from "lucide-react";
import { ProDashboardCard } from "@/components/dashboard/pro-dashboard-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function KpiTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-background/40 p-4 transition-colors",
        "dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.08] text-primary dark:border-primary/25 dark:bg-primary/[0.12]">
          <Icon className="size-[1.15rem]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          {hint ? (
            <p className="mt-0.5 text-2xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function DashboardKpiRail({
  totalLeads,
  pipelineActive,
  conversationCount,
  upcomingAppointmentCount,
}: {
  totalLeads: number;
  pipelineActive: number;
  conversationCount: number;
  upcomingAppointmentCount: number;
}) {
  return (
    <ProDashboardCard
      eyebrow="Vandaag"
      title="Snel overzicht"
      action={
        <Button variant="ghost" size="sm" className="h-8 rounded-full px-2 text-2xs" asChild>
          <Link href="/dashboard/sales">Meer statistieken</Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <KpiTile icon={Users} label="Leads" value={totalLeads} />
        <KpiTile
          icon={Kanban}
          label="In pipeline"
          value={pipelineActive}
          hint="Niet gewonnen/verloren"
        />
        <KpiTile
          icon={MessageSquare}
          label="Gesprekken"
          value={conversationCount}
        />
        <KpiTile
          icon={Calendar}
          label="Komende afspraken"
          value={upcomingAppointmentCount}
          hint="Vanaf nu"
        />
      </div>
      <div className="mt-4 flex flex-col gap-2 border-t border-border/40 pt-4 dark:border-white/[0.06]">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Snel naar
        </p>
        <div className="flex flex-col gap-1.5">
          {[
            { href: "/dashboard/inbox", label: "Inbox openen" },
            { href: "/dashboard/pipeline", label: "Pipeline bekijken" },
            { href: "/dashboard/appointments", label: "Agenda" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/[0.07] hover:text-primary"
            >
              {l.label}
              <span className="text-muted-foreground" aria-hidden>
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </ProDashboardCard>
  );
}
