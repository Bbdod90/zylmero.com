import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarClock } from "lucide-react";
import { ProDashboardCard } from "@/components/dashboard/pro-dashboard-card";
import { Button } from "@/components/ui/button";
import { appointmentStatusNl } from "@/lib/i18n/nl-labels";

export type AgendaPeekRow = {
  id: string;
  starts_at: string;
  leadName: string | null;
  status: string;
  notes: string | null;
};

export function DashboardAgendaPeek({ items }: { items: AgendaPeekRow[] }) {
  return (
    <ProDashboardCard
      eyebrow="Planning"
      title="Aankomende afspraken"
      action={
        <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-2xs" asChild>
          <Link href="/dashboard/appointments">Agenda</Link>
        </Button>
      }
    >
      {items.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Geen geplande afspraken vooruit. Plan er een via een lead of de agenda.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => {
            const d = new Date(a.starts_at);
            return (
              <li key={a.id}>
                <Link
                  href="/dashboard/appointments"
                  className="flex gap-3 rounded-2xl border border-border/50 bg-background/30 p-3 transition-colors hover:border-primary/25 hover:bg-primary/[0.04] dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CalendarClock className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">
                      {format(d, "EEE d MMM · HH:mm", { locale: nl })}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                      {a.leadName ?? "Zonder klant"}
                    </p>
                    <p className="mt-1 line-clamp-1 text-2xs text-muted-foreground">
                      {appointmentStatusNl(a.status)}
                      {a.notes ? ` · ${a.notes}` : ""}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </ProDashboardCard>
  );
}
