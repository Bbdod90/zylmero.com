import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
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
      title="Leads"
      subtitle="Prioriteit, status en waarde — werk eerst aan wat het meest oplevert."
    >
      {!demo ? (
        <div className="mb-10 max-w-2xl">
          <LeadImport disabled={false} />
        </div>
      ) : null}
      <LeadsExplorer
        leads={bundle.leads}
        staleReplyLeadIds={Array.from(sla.staleReplyLeadIds)}
        demoMode={demo}
      />
    </PageFrame>
  );
}
