import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardBundle } from "@/lib/queries/dashboard";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { AppointmentsPageClient } from "@/components/appointments/appointments-page-client";

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

  const agendaRevision = appointments
    .map((a) => `${a.id}:${a.updated_at}:${a.starts_at}`)
    .sort()
    .join("|");

  return (
    <PageFrame
      title="Afspraken"
      subtitle="Week, maand of drie maanden — overzicht dat meegroeit met je zaak."
    >
      <DashboardWorkSurface>
        <AppointmentsPageClient
          agendaItems={agendaItems}
          agendaRevision={agendaRevision}
          demoMode={demo}
          leads={leads}
          defaultLeadId={defaultLeadId}
          initialOpen={Boolean(defaultLeadId)}
        />
      </DashboardWorkSurface>
    </PageFrame>
  );
}
