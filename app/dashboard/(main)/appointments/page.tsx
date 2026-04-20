import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardBundle } from "@/lib/queries/dashboard";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { Button } from "@/components/ui/button";
import { AppointmentsPageClient } from "@/components/appointments/appointments-page-client";
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

  const agendaRevision = appointments
    .map((a) => `${a.id}:${a.updated_at}:${a.starts_at}`)
    .sort()
    .join("|");

  const canUseAgenda = leads.length > 0 || appointments.length > 0;

  return (
    <PageFrame
      title="Afspraken"
      subtitle="Week, maand of drie maanden — overzicht dat meegroeit met je zaak."
    >
      <DashboardWorkSurface>
        {!canUseAgenda ? (
          <div className="cf-dashboard-panel flex flex-col items-center border-dashed border-border/55 px-8 py-16 text-center dark:border-white/[0.12]">
            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <CalendarDays className="size-7" />
            </div>
            <p className="text-lg font-semibold tracking-tight text-foreground">
              Eerst een klant in je pipeline
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Voeg een klant toe of importeer leads — daarna kun je hier afspraken
              inplannen en volgen.
            </p>
            <Button asChild className="mt-8 rounded-lg">
              <Link href="/dashboard/leads">Naar klanten</Link>
            </Button>
          </div>
        ) : (
          <AppointmentsPageClient
            agendaItems={agendaItems}
            agendaRevision={agendaRevision}
            demoMode={demo}
            leads={leads}
            defaultLeadId={defaultLeadId}
            initialOpen={Boolean(defaultLeadId)}
          />
        )}
      </DashboardWorkSurface>
    </PageFrame>
  );
}
