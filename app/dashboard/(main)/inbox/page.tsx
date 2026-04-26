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
import { isDemoCompanyId } from "@/lib/billing/trial";
import { hasEffectiveProductAccess } from "@/lib/platform/host-access";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import { buildCustomerReadiness } from "@/lib/dashboard/readiness";

export default async function InboxPage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();
  const supabase = await createClient();
  const threads = demo
    ? getDemoInboxThreads()
    : await fetchInboxThreads(supabase, auth.company.id);
  const sla = demo ? getDemoSla() : await analyzeSla(supabase, auth.company.id);

  const demoCompany = isDemoCompanyId(auth.company.id);
  const demoMode = demo || demoCompany;

  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();
  const mapped = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const web = mapped?.ai_knowledge_website?.trim() ?? "";
  const doc = mapped?.ai_knowledge_document?.trim() ?? "";
  const knowledgeFilled = Boolean(web && doc);
  const websiteLive =
    hasEffectiveProductAccess(auth.company, auth.user?.id) &&
    Boolean(auth.company.widget_embed_token);

  const readiness = buildCustomerReadiness({
    demoMode,
    needsAiSetup: !demoMode && !settingsRow?.ai_setup_completed_at,
    knowledgeFilled: demoMode || knowledgeFilled,
    websiteLive: demoMode || websiteLive,
    whatsappConnected: Boolean(mapped?.whatsapp_channel?.connected),
    whatsappAutoReply: Boolean(mapped?.auto_reply_enabled),
    emailInboundEnabled: Boolean(mapped?.email_inbound_enabled),
    hasContactEmail: Boolean(auth.company.contact_email?.trim()),
  });

  return (
    <PageFrame
      title="Berichten"
      subtitle="Hier komen nieuwe klanten binnen — alles op één plek."
    >
      <DashboardWorkSurface>
        {threads.length === 0 ? (
          <InboxEmptyConversion onboarding={readiness.onboarding} />
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
