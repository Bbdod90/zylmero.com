import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchInboxThreads } from "@/lib/queries/inbox";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { InboxWorkspace } from "@/components/inbox/inbox-workspace";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";
import { getDemoInboxThreads, getDemoSla } from "@/lib/demo/dashboard-data";
import { isDemoMode } from "@/lib/env";
import { analyzeSla } from "@/lib/queries/sla";
import { listReplyTemplates } from "@/actions/reply-templates";

export default async function InboxPage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  const supabase = await createClient();
  const threads = demo
    ? getDemoInboxThreads()
    : await fetchInboxThreads(supabase, auth.company.id);
  const sla = demo ? getDemoSla() : await analyzeSla(supabase, auth.company.id);
  const templates = demo ? [] : await listReplyTemplates();

  return (
    <PageFrame
      title="Berichten"
      subtitle="Gesprekken die converteren — antwoord sneller dan de concurrent."
    >
      <DashboardWorkSurface>
        {threads.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Nog geen gesprekken"
            description="Je AI staat klaar om nieuwe klanten op te vangen. Zodra leads binnenkomen, verschijnen ze hier. Koppel je kanalen of voeg handmatig een lead toe."
          />
        ) : (
          <InboxWorkspace
            threads={threads}
            staleReplyLeadIds={Array.from(sla.staleReplyLeadIds)}
            demoMode={demo}
            replyTemplates={templates}
          />
        )}
      </DashboardWorkSurface>
    </PageFrame>
  );
}
