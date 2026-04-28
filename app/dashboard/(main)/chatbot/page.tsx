import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import type { AiKnowledgePage } from "@/lib/types";
import { siteUrl } from "@/lib/stripe/server";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { ChatbotBuilder } from "@/components/chatbot/chatbot-builder";
import { AiKnowledgeForm } from "@/components/settings/ai-knowledge-form";

export default async function ChatbotPage() {
  const auth = await getAuth();
  if (!auth.user) return null;

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("chatbots")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let chatbot = existing;
  if (!chatbot) {
    const { data: created } = await supabase
      .from("chatbots")
      .insert({
        user_id: auth.user.id,
        bedrijfs_omschrijving: "",
        website_url: null,
        extra_info: null,
        openingszin: "Hallo! Waarmee kan ik je helpen?",
        settings: {
          doelen: {
            vragen_beantwoorden: true,
            klanten_helpen: true,
            contactaanvragen_verwerken: true,
          },
          communicatiestijl: "zakelijk",
          antwoord_lengte: "kort",
          automation_regels: [],
        },
        is_active: false,
      })
      .select("*")
      .single();
    chatbot = created;
  }

  if (!chatbot) {
    const { data: s } = await supabase
      .from("company_settings")
      .select("*")
      .eq("company_id", auth.company?.id || "")
      .maybeSingle();
    const mapped = mapCompanySettingsRow((s ?? {}) as Record<string, unknown>);
    const prefs = (s?.automation_preferences as Record<string, unknown> | null) || {};
    const scannedPages = Array.isArray(prefs.ai_knowledge_pages)
      ? (prefs.ai_knowledge_pages as AiKnowledgePage[]).filter(
          (p) => p && typeof p.url === "string" && typeof p.title === "string",
        )
      : [];
    const lastScannedAt =
      typeof prefs.ai_knowledge_last_scanned_at === "string"
        ? prefs.ai_knowledge_last_scanned_at
        : null;
    const crawlCapped = Boolean(prefs.ai_knowledge_crawl_capped);
    const digestNl =
      typeof prefs.ai_knowledge_digest_nl === "string" && prefs.ai_knowledge_digest_nl.trim()
        ? prefs.ai_knowledge_digest_nl.trim()
        : null;
    const hint =
      existingError?.message ||
      "Nieuwe chatbot-tabellen zijn nog niet beschikbaar; tijdelijke fallback wordt getoond.";
    return (
      <PageFrame
        title="Je chatbot"
        subtitle={`Fallback actief: ${hint}`}
      >
        <DashboardWorkSurface wide>
          <AiKnowledgeForm
            demoMode={isDemoMode()}
            initialWebsite={mapped?.ai_knowledge_website ?? ""}
            initialDocument={mapped?.ai_knowledge_document ?? ""}
            scannedPages={scannedPages}
            lastScannedAt={lastScannedAt}
            crawlCapped={crawlCapped}
            compactHero
            digestNl={digestNl}
            siteOrigin={siteUrl()}
            embedToken={auth.company?.widget_embed_token ?? null}
          />
        </DashboardWorkSurface>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="Je chatbot"
      subtitle="Invullen, direct live testen en daarna meteen koppelen aan je kanalen."
    >
      <DashboardWorkSurface wide>
        <ChatbotBuilder chatbot={chatbot} />
      </DashboardWorkSurface>
    </PageFrame>
  );
}
