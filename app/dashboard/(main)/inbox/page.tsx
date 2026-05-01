import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchInboxThreads } from "@/lib/queries/inbox";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { InboxWorkspace } from "@/components/inbox/inbox-workspace";
import { InboxEmptyConversion } from "@/components/inbox/inbox-empty-conversion";
import { getDemoInboxThreads, getDemoSla } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { analyzeSla } from "@/lib/queries/sla";

export default async function InboxPage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  const supabase = await createClient();
  const threads = demo
    ? getDemoInboxThreads()
    : await fetchInboxThreads(supabase, auth.company.id);
  const sla = demo ? getDemoSla() : await analyzeSla(supabase, auth.company.id);

  return (
    <PageFrame title="Berichten" subtitle="Alle gesprekken op één plek.">
      <DashboardWorkSurface>
        {threads.length === 0 ? (
          <InboxEmptyConversion />
        ) : (
          <InboxWorkspace
            threads={threads}
            staleReplyLeadIds={Array.from(sla.staleReplyLeadIds)}
            demoMode={demo}
          />
        )}
      </DashboardWorkSurface>
    </PageFrame>
  );
}
