import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardBundle } from "@/lib/queries/dashboard";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { PageFrame } from "@/components/layout/page-frame";
import { NewAppointmentDialog } from "@/components/appointments/new-appointment-dialog";
import { AppointmentsWeekAgenda } from "@/components/appointments/appointments-week-agenda";
import { CalendarDays } from "lucide-react";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams?: { lead?: string };
}) {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  const supabase = await createClient();
  const bundle = demo
    ? getDemoDashboardBundle()
    : await fetchDashboardBundle(supabase, auth.company.id);
  const { appointments, leads } = bundle;
  const leadParam = searchParams?.lead?.trim();
  const defaultLeadId =
    leadParam && leads.some((l) => l.id === leadParam) ? leadParam : null;
  const leadById = new Map(leads.map((l) => [l.id, l]));
  const agendaItems = appointments.map((a) => ({
    ...a,
    lead_name: a.lead_id ? leadById.get(a.lead_id)?.full_name ?? null : null,
  }));

  return (
    <PageFrame
      title="Afspraken"
      subtitle="Geplande tijd die omzet wordt — overzicht per dag."
    >
      <div className="mb-8 flex flex-wrap items-center justify-end gap-3">
        <NewAppointmentDialog
          leads={leads}
          disabled={demo}
          defaultLeadId={defaultLeadId}
          initialOpen={Boolean(defaultLeadId)}
        />
      </div>
      {appointments.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border/70 bg-muted/10 px-8 py-20 text-center dark:border-white/[0.1]">
          <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner-soft">
            <CalendarDays className="size-8" />
          </div>
          <p className="text-lg font-semibold tracking-tight text-foreground">
            Nog geen afspraken
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Plan een afspraak vanuit een lead: gebruik de snelle actie
            &quot;Omzetten naar afspraak&quot; of werk de status bij.
          </p>
          <Link
            href="/dashboard/leads"
            className="mt-8 text-sm font-semibold text-primary hover:underline"
          >
            Naar leads →
          </Link>
        </div>
      ) : (
        <div className="cf-dashboard-panel p-4 sm:p-6">
          <AppointmentsWeekAgenda items={agendaItems} demoMode={demo} />
        </div>
      )}
    </PageFrame>
  );
}
