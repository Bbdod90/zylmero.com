import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { isDemoCompanyId } from "@/lib/billing/trial";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import { resolveSiteUrl } from "@/lib/site-url";
import { PageFrame } from "@/components/layout/page-frame";
import {
  AiKoppelcentrumView,
  type AiKoppelcentrumProps,
} from "@/components/dashboard/ai-koppelcentrum-view";

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
    ? "In de demo zie je voorbeelden. Met een echt account vul je hier je eigen site en teksten in."
    : web && doc
      ? "Je website-URL en aanvullende tekst staan erin. Je kunt dit altijd bijwerken voor betere antwoorden."
      : web
        ? "Je hebt een website-URL. Vul nog tekst in (uren, tarieven, aanbod) voor rijkere AI-antwoorden."
        : doc
          ? "Je hebt tekst toegevoegd. Vul ook je website-URL in voor consistente verwijzingen."
          : "Voeg de URL van je publieke site toe en plak praktische info: openingstijden, tarieven, aanbod — wat bij jouw branche past.";

  const needsAiSetup =
    !isDemoCompanyId(auth.company.id) && !settingsRow?.ai_setup_completed_at;

  const ch = mapped?.whatsapp_channel;
  const whatsappProvider = ch?.provider ?? "mock";

  return (
    <PageFrame
      title="AI & koppelingen"
      subtitle="Train je AI, sluit WhatsApp en je website-widget aan, en zorg dat e-mail en aanvragen op één plek landen — overzichtelijk en in de juiste volgorde."
    >
      <AiKoppelcentrumView
        demoMode={demoMode}
        siteOrigin={resolveSiteUrl()}
        needsAiSetup={needsAiSetup}
        knowledgeStatus={knowledgeStatus}
        knowledgeSummary={knowledgeSummary}
        whatsappConnected={Boolean(ch?.connected)}
        whatsappAutoReply={Boolean(mapped?.auto_reply_enabled)}
        whatsappProvider={whatsappProvider}
        hasWidgetToken={Boolean(auth.company.widget_embed_token)}
        hasContactEmail={Boolean(auth.company.contact_email?.trim())}
      />
    </PageFrame>
  );
}
