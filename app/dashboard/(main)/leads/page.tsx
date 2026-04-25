import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { LeadsExplorer } from "@/components/leads/leads-explorer";
import { LeadImport } from "@/components/leads/lead-import";
import { fetchDashboardBundle } from "@/lib/queries/dashboard";
import { analyzeSla } from "@/lib/queries/sla";
import { getDemoDashboardBundle, getDemoSla } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";

export default async function LeadsPage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  const supabase = await createClient();
  const bundle = demo
    ? getDemoDashboardBundle()
    : await fetchDashboardBundle(supabase, auth.company.id);
  const sla = demo ? getDemoSla() : await analyzeSla(supabase, auth.company.id);

  return (
    <PageFrame
      title="Klanten"
      subtitle="Overzicht, filters en import — de lijst staat direct voor je."
    >
      <DashboardWorkSurface>
        <LeadsExplorer
          leads={bundle.leads}
          staleReplyLeadIds={Array.from(sla.staleReplyLeadIds)}
          demoMode={demo}
          demoSampleLeadId={bundle.leads[0]?.id ?? null}
        />
        {!demo ? (
          <div className="mt-3 w-full max-w-4xl">
            <LeadImport disabled={false} />
          </div>
        ) : null}
      </DashboardWorkSurface>
    </PageFrame>
  );
}
