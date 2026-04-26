import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceHome } from "@/components/dashboard/workspace-home";
import { fetchWorkspaceHomeSnapshot } from "@/lib/queries/workspace-home-snapshot";
import { isDemoMode } from "@/lib/env";
import { isDemoCompanyId } from "@/lib/billing/trial";
import { hasEffectiveProductAccess } from "@/lib/platform/host-access";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import { buildCustomerReadiness } from "@/lib/dashboard/readiness";

export default async function DashboardPage() {
  const auth = await getAuth();
  if (!auth.company) return null;

  const supabase = await createClient();
  const snapshot = await fetchWorkspaceHomeSnapshot(supabase, auth.company.id);

  const demoMode = isDemoMode() || isDemoCompanyId(auth.company.id);
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
    <WorkspaceHome
      companyName={auth.company.name}
      snapshot={snapshot}
      readiness={readiness}
      demoMode={demoMode}
    />
  );
}
