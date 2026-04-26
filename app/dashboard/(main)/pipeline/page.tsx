import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
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
      subtitle="Sleep klanten tussen fases. Per kolom zie je meteen hoeveel kansen er liggen en wat het geschat samen waard is."
    >
      <DashboardWorkSurface>
        <div className="cf-dashboard-panel relative p-4 sm:p-6 lg:p-8">
          <PipelineBoard
            initialLeads={leads}
            companyId={auth.company.id}
            demoMode={demo}
          />
        </div>
      </DashboardWorkSurface>
    </PageFrame>
  );
}
