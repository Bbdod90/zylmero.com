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
      title="Leads"
      subtitle="Strak pipeline-overzicht met focus op prioriteit, snelheid en omzetkans."
    >
      <DashboardWorkSurface>
        <section className="cf-dashboard-panel border-primary/20 bg-gradient-to-br from-primary/[0.1] via-background to-background px-6 py-5 dark:border-primary/30 dark:from-primary/[0.16] sm:px-7">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Pipeline cockpit
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Beheer je leads met snelheid en overzicht
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Importeer nieuwe contacten, filter op status en bron, en werk direct op de leads met
            de hoogste omzetkans.
          </p>
        </section>
        {!demo ? (
          <div className="w-full max-w-4xl">
            <LeadImport disabled={false} />
          </div>
        ) : null}
        <LeadsExplorer
          leads={bundle.leads}
          staleReplyLeadIds={Array.from(sla.staleReplyLeadIds)}
          demoMode={demo}
          demoSampleLeadId={bundle.leads[0]?.id ?? null}
        />
      </DashboardWorkSurface>
    </PageFrame>
  );
}
