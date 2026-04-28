import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import type { AiKnowledgePage } from "@/lib/types";
import { siteUrl } from "@/lib/stripe/server";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { ChatbotStudio } from "@/components/chatbot/chatbot-studio";

export default async function ChatbotPage() {
  const auth = await getAuth();
  if (!auth.user || !auth.company) return null;

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", auth.company.id)
    .maybeSingle();
  const mapped = mapCompanySettingsRow((settingsRow ?? {}) as Record<string, unknown>);
  const prefs = (settingsRow?.automation_preferences as Record<string, unknown> | null) || {};
  const scannedPages = Array.isArray(prefs.ai_knowledge_pages)
    ? (prefs.ai_knowledge_pages as AiKnowledgePage[]).filter((p) => p && typeof p.url === "string")
    : [];
  const digestNl =
    typeof prefs.ai_knowledge_digest_nl === "string" && prefs.ai_knowledge_digest_nl.trim()
      ? prefs.ai_knowledge_digest_nl.trim()
      : null;
  const goals = (prefs.chatbot_goals as Record<string, unknown> | null) || {};

  return (
    <PageFrame
      title="Je chatbot"
      subtitle="Invullen, preview testen, klaar en koppelen — Botpress-achtig maar simpel."
    >
      <DashboardWorkSurface wide>
        <ChatbotStudio
          demoMode={isDemoMode()}
          companyName={auth.company.name}
          initialBedrijfsOmschrijving={
            typeof prefs.chatbot_company_description === "string"
              ? prefs.chatbot_company_description
              : mapped?.niche || ""
          }
          initialWebsiteUrl={mapped?.ai_knowledge_website ?? ""}
          initialExtraInfo={
            typeof prefs.chatbot_extra_info === "string"
              ? prefs.chatbot_extra_info
              : mapped?.ai_knowledge_document ?? ""
          }
          initialOpeningszin={
            typeof prefs.chatbot_opening_line === "string"
              ? prefs.chatbot_opening_line
              : "Hallo! Waarmee kan ik je helpen?"
          }
          initialDigest={digestNl}
          initialScannedCount={scannedPages.length}
          initialGoals={{
            vragenBeantwoorden: goals.vragen_beantwoorden !== false,
            klantenHelpen: goals.klanten_helpen !== false,
            contactAanvragenVerwerken: goals.contactaanvragen_verwerken !== false,
          }}
          initialAntwoordLengte={
            prefs.chatbot_answer_length === "normal" ? "normal" : "short"
          }
          embedSnippet={`<script src=\"${siteUrl().replace(/\/$/, "")}/widget.js\" data-id=\"${auth.company.id}\"></script>`}
        />
      </DashboardWorkSurface>
    </PageFrame>
  );
}
