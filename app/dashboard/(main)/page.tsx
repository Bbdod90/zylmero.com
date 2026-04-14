import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardBundle } from "@/lib/queries/dashboard";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { PageFrame } from "@/components/layout/page-frame";
import { formatCurrency } from "@/lib/utils";
import { DashboardRevenueHero } from "@/components/dashboard/dashboard-revenue-hero";
import { DashboardTopLeadsTable } from "@/components/dashboard/dashboard-top-leads-table";
import { DashboardKpiRail } from "@/components/dashboard/dashboard-kpi-rail";
import { DashboardPipelineSnapshot } from "@/components/dashboard/dashboard-pipeline-snapshot";
import { DashboardInboxPanel } from "@/components/dashboard/dashboard-inbox-panel";
import {
  DashboardAgendaPeek,
  type AgendaPeekRow,
} from "@/components/dashboard/dashboard-agenda-peek";
import { DashboardQuotesPeek } from "@/components/dashboard/dashboard-quotes-peek";
import { LEAD_STATUSES } from "@/components/leads/status-badge";
import type { LeadStatus } from "@/lib/types";

const PIPELINE_OPEN: LeadStatus[] = [
  "new",
  "active",
  "quote_sent",
  "appointment_booked",
];

export default async function DashboardPage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  const supabase = await createClient();
  const bundle = demo
    ? getDemoDashboardBundle()
    : await fetchDashboardBundle(supabase, auth.company.id);

  const revenuePotential = bundle.leads.reduce(
    (a, l) => a + (l.estimated_value != null ? Number(l.estimated_value) : 0),
    0,
  );

  const topThree = [...bundle.leads]
    .sort((a, b) => {
      const va = a.estimated_value != null ? Number(a.estimated_value) : -1;
      const vb = b.estimated_value != null ? Number(b.estimated_value) : -1;
      return vb - va;
    })
    .slice(0, 3);

  const now = Date.now();
  const leadById = new Map(bundle.leads.map((l) => [l.id, l]));

  const statusCounts = LEAD_STATUSES.reduce(
    (acc, s) => {
      acc[s] = bundle.leads.filter((l) => l.status === s).length;
      return acc;
    },
    {} as Record<LeadStatus, number>,
  );

  const pipelineActive = bundle.leads.filter((l) =>
    PIPELINE_OPEN.includes(l.status),
  ).length;

  const openQuotes = bundle.quotes.filter(
    (q) => q.status === "draft" || q.status === "sent",
  ).length;

  const upcomingAll = bundle.appointments.filter(
    (a) => new Date(a.starts_at).getTime() >= now,
  );
  const upcomingSorted = [...upcomingAll].sort(
    (a, b) =>
      new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );

  const agendaPeek: AgendaPeekRow[] = upcomingSorted.slice(0, 5).map((a) => ({
    id: a.id,
    starts_at: a.starts_at,
    leadName: a.lead_id ? leadById.get(a.lead_id)?.full_name ?? null : null,
    status: a.status,
    notes: a.notes,
  }));

  const inboxMessages = bundle.recentMessages.slice(0, 6).map((m) => ({
    id: m.id,
    content: m.content,
    lead_name: m.lead_name ?? null,
    created_at: m.created_at,
  }));

  const recentQuotes = bundle.quotes.slice(0, 4);

  const chipItems = [
    { label: "Leads", value: String(bundle.leads.length) },
    { label: "In pipeline", value: String(pipelineActive) },
    { label: "Gesprekken", value: String(bundle.conversations.length) },
    { label: "Offertes open", value: String(openQuotes) },
  ];

  return (
    <PageFrame
      title="Dashboard"
      subtitle={
        demo
          ? "Demo — volledig overzicht: waarde, pipeline, inbox en planning."
          : "Waardevolle eerste indruk: omzetpotentie, verdeling en laatste activiteit."
      }
    >
      <div className="space-y-8 lg:space-y-10">
        {/* Hero + KPI-rail */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="space-y-6 lg:col-span-8">
            <DashboardRevenueHero
              amountLabel={formatCurrency(revenuePotential)}
              chipItems={chipItems}
            />
            <DashboardPipelineSnapshot counts={statusCounts} />
          </div>
          <div className="lg:col-span-4">
            <DashboardKpiRail
              totalLeads={bundle.leads.length}
              pipelineActive={pipelineActive}
              conversationCount={bundle.conversations.length}
              upcomingAppointmentCount={upcomingAll.length}
            />
          </div>
        </div>

        {/* Top leads + inbox */}
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-7">
            <DashboardTopLeadsTable leads={topThree} demoMode={demo} />
          </div>
          <div className="min-w-0 lg:col-span-5">
            <DashboardInboxPanel messages={inboxMessages} />
          </div>
        </div>

        {/* Agenda + offertes */}
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-6">
            <DashboardAgendaPeek items={agendaPeek} />
          </div>
          <div className="min-w-0 lg:col-span-6">
            <DashboardQuotesPeek quotes={recentQuotes} />
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
