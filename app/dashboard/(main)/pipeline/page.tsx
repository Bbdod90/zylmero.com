import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageFrame } from "@/components/layout/page-frame";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { fetchLeadRow } from "@/lib/queries/mappers";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import type { Lead } from "@/lib/types";

export default async function PipelinePage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  let leads: Lead[] = [];
  if (demo) {
    leads = getDemoDashboardBundle().leads;
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("company_id", auth.company.id)
      .order("updated_at", { ascending: false });
    leads = (data || []).map((r) =>
      fetchLeadRow(r as Record<string, unknown>),
    );
  }

  return (
    <PageFrame
      title="Pipeline"
      subtitle="Sleep leads tussen fases — visueel overzicht, direct gekoppeld aan inbox, offertes en rapportage."
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-b from-card/60 to-transparent p-4 dark:border-white/[0.09] dark:from-white/[0.03] sm:p-6 lg:p-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          aria-hidden
        />
        <PipelineBoard
          initialLeads={leads}
          companyId={auth.company.id}
          demoMode={demo}
        />
      </div>
    </PageFrame>
  );
}
