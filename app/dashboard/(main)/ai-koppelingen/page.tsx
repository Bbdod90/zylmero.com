import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { isDemoCompanyId } from "@/lib/billing/trial";
import { hasEffectiveProductAccess } from "@/lib/platform/host-access";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import {
  AiKoppelcentrumView,
  type AiKoppelcentrumProps,
} from "@/components/dashboard/ai-koppelcentrum-view";
import { buildCustomerReadiness } from "@/lib/dashboard/readiness";

export default async function AiKoppelcentrumPage() {
  const auth = await getAuth();
  if (!auth.company) return null;

  const demoMode = isDemoMode() || isDemoCompanyId(auth.company.id);
  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();

  const mapped = mapCompanySettingsRow(settingsRow as Record<string, unknown>);
  const web = mapped?.ai_knowledge_website?.trim() ?? "";
  const doc = mapped?.ai_knowledge_document?.trim() ?? "";

  let knowledgeStatus: AiKoppelcentrumProps["knowledgeStatus"] = "todo";
  if (demoMode) {
    knowledgeStatus = "demo";
  } else if (web && doc) {
    knowledgeStatus = "ok";
  } else if (web || doc) {
    knowledgeStatus = "partial";
  }

  const knowledgeSummary = demoMode
    ? "In de demo zie je voorbeelden. Met je eigen account vul je hier je aanbod in."
    : web && doc
      ? "Je kennis staat goed — je kunt dit altijd bijwerken."
      : web
        ? "Vul nog praktische tekst in (uren, tarieven, aanbod) voor betere antwoorden."
        : doc
          ? "Voeg ook de link naar je website toe voor consistente antwoorden."
          : "Vertel wat je doet, waarin je uitblinkt en hoe klanten je bereiken.";

  const needsAiSetup =
    !isDemoCompanyId(auth.company.id) && !settingsRow?.ai_setup_completed_at;

  const websiteLive =
    hasEffectiveProductAccess(auth.company, auth.user?.id) &&
    Boolean(auth.company.widget_embed_token);

  const readiness = buildCustomerReadiness({
    demoMode,
    needsAiSetup: !demoMode && !settingsRow?.ai_setup_completed_at,
    knowledgeFilled: demoMode || Boolean(web && doc),
    websiteLive: demoMode || websiteLive,
    whatsappConnected: Boolean(mapped?.whatsapp_channel?.connected),
    whatsappAutoReply: Boolean(mapped?.auto_reply_enabled),
    emailInboundEnabled: Boolean(mapped?.email_inbound_enabled),
    hasContactEmail: Boolean(auth.company.contact_email?.trim()),
  });

  return (
    <PageFrame
      title="Kanalen"
      subtitle="Kies waar jouw klanten je het liefst spreken. Alles komt netjes samen bij je berichten."
    >
      <DashboardWorkSurface>
        <AiKoppelcentrumView
          demoMode={demoMode}
          onboarding={readiness.onboarding}
          needsAiSetup={needsAiSetup}
          knowledgeStatus={knowledgeStatus}
          knowledgeSummary={knowledgeSummary}
          whatsappConnected={Boolean(mapped?.whatsapp_channel?.connected)}
          whatsappAutoReply={Boolean(mapped?.auto_reply_enabled)}
          hasWidgetToken={Boolean(auth.company.widget_embed_token)}
          websiteWidgetActive={hasEffectiveProductAccess(auth.company, auth.user?.id)}
          hasContactEmail={Boolean(auth.company.contact_email?.trim())}
          emailInboundEnabled={Boolean(mapped?.email_inbound_enabled)}
        />
      </DashboardWorkSurface>
    </PageFrame>
  );
}
