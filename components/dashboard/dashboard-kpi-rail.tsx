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
        "group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/25 p-3.5 shadow-[0_6px_24px_-14px_rgb(15_23_42/0.12)] transition-all duration-200 sm:p-4",
        "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_14px_40px_-20px_rgb(15_23_42/0.18)]",
        "dark:border-white/[0.08] dark:from-card dark:via-card/90 dark:to-white/[0.02] dark:shadow-[0_12px_40px_-24px_rgb(0_0_0/0.45)] dark:hover:border-primary/30",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--primary) / 0.07) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.12] text-primary shadow-inner-soft dark:border-primary/30 dark:bg-primary/[0.15]">
          <Icon className="size-[1.2rem]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-foreground/80 dark:text-foreground/85">
            {label}
          </p>
          <p className="mt-1.5 text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-2xs leading-snug text-foreground/70 dark:text-foreground/75">
              {hint}
            </p>
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
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
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
            { href: "/dashboard/appointments", label: "Agenda openen" },
            { href: "/dashboard/inbox", label: "Inbox openen" },
            { href: "/dashboard/pipeline", label: "Pipeline bekijken" },
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
