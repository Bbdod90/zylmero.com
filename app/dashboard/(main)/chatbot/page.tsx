import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { mapCompanySettingsRow } from "@/lib/queries/map-company-settings";
import type { AiKnowledgePage } from "@/lib/types";
import { siteUrl } from "@/lib/stripe/server";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { PageFrame } from "@/components/layout/page-frame";
import { ChatbotStudio } from "@/components/chatbot/chatbot-studio";
import { WIDGET_STARTER_WELCOME_DEFAULT } from "@/lib/chatbot/widget-starters";
import {
  normalizeStartersFromPrefs,
  WIDGET_DEFAULT_PRIMARY,
} from "@/lib/chatbot/widget-public-config";
import { buildWidgetContactLinks } from "@/lib/phone/widget-contact";

function extraGoalsFromCapabilities(caps: unknown): {
  productadvies: boolean;
  faqUitleg: boolean;
  contactEscalatie: boolean;
  afspraakOpVerzoek: boolean;
} {
  if (!Array.isArray(caps)) {
    return {
      productadvies: true,
      faqUitleg: true,
      contactEscalatie: true,
      afspraakOpVerzoek: true,
    };
  }
  if (caps.length === 0) {
    return {
      productadvies: false,
      faqUitleg: false,
      contactEscalatie: false,
      afspraakOpVerzoek: false,
    };
  }
  const lower = caps.map((c) => String(c).toLowerCase());
  return {
    productadvies: lower.some((s) => s.includes("productadvies")),
    faqUitleg: lower.some((s) => s.includes("faq")),
    contactEscalatie: lower.some(
      (s) => s.includes("doorzetten") || s.includes("complexe"),
    ),
    afspraakOpVerzoek: lower.some((s) => s.includes("op verzoek")),
  };
}

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

  const { data: companyContactRow } = await supabase
    .from("companies")
    .select("contact_phone")
    .eq("id", auth.company.id)
    .maybeSingle();

  const contactPreview = buildWidgetContactLinks({
    contactPhoneRaw:
      typeof companyContactRow?.contact_phone === "string"
        ? companyContactRow.contact_phone.trim() || null
        : null,
    whatsappPhoneRaw: mapped?.whatsapp_channel?.phone_number ?? null,
  });
  const prefs = (settingsRow?.automation_preferences as Record<string, unknown> | null) || {};
  const scannedPages = Array.isArray(prefs.ai_knowledge_pages)
    ? (prefs.ai_knowledge_pages as AiKnowledgePage[]).filter((p) => p && typeof p.url === "string")
    : [];
  const initialKnowledgeUrls = scannedPages.map((p) => ({
    url: p.url,
    title: typeof p.title === "string" ? p.title : "",
  }));
  const digestNl =
    typeof prefs.ai_knowledge_digest_nl === "string" && prefs.ai_knowledge_digest_nl.trim()
      ? prefs.ai_knowledge_digest_nl.trim()
      : null;
  const goals = (prefs.chatbot_goals as Record<string, unknown> | null) || {};

  const { data: chatbotRow } = await supabase
    .from("chatbots")
    .select("id")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const embedChatbotId = typeof chatbotRow?.id === "string" ? chatbotRow.id : auth.company.id;

  const widgetPrimaryRaw =
    typeof prefs.chatbot_widget_primary === "string" ? prefs.chatbot_widget_primary.trim() : "";
  const wlPrimary = mapped?.white_label_primary?.trim() ?? "";
  const initialWidgetPrimary =
    /^#[0-9A-Fa-f]{6}$/.test(widgetPrimaryRaw)
      ? widgetPrimaryRaw
      : /^#[0-9A-Fa-f]{6}$/.test(wlPrimary)
        ? wlPrimary
        : WIDGET_DEFAULT_PRIMARY;

  const widgetLogoRaw =
    typeof prefs.chatbot_widget_logo_url === "string" ? prefs.chatbot_widget_logo_url.trim() : "";
  const initialWidgetLogoUrl =
    widgetLogoRaw || mapped?.white_label_logo_url?.trim() || null;

  const initialWidgetTitle =
    typeof prefs.chatbot_widget_title === "string" && prefs.chatbot_widget_title.trim()
      ? prefs.chatbot_widget_title.trim().slice(0, 48)
      : "Chat";

  const initialWidgetShowStarters = prefs.chatbot_widget_show_starters !== false;

  const initialWidgetStarters = normalizeStartersFromPrefs(prefs.chatbot_widget_starters);

  return (
    <PageFrame
      title="Je chatbot"
      subtitle="Studio: kleuren, logo, openingszin en snelle keuzes. Daarna kennis trainen en embed plakken."
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
              : WIDGET_STARTER_WELCOME_DEFAULT
          }
          initialDigest={digestNl}
          initialScannedCount={scannedPages.length}
          initialKnowledgeUrls={initialKnowledgeUrls}
          initialCrawlCapped={prefs.ai_knowledge_crawl_capped === true}
          initialGoals={{
            contactAanvragenVerwerken: goals.contactaanvragen_verwerken !== false,
          }}
          initialVragenTerugStellen={prefs.chatbot_vragen_terug_stellen === true}
          initialAntwoordLengte={
            prefs.chatbot_answer_length === "normal" ? "normal" : "short"
          }
          initialExtraGoals={extraGoalsFromCapabilities(prefs.chatbot_capabilities)}
          embedChatbotId={embedChatbotId}
          initialWidgetPrimary={initialWidgetPrimary}
          initialWidgetLogoUrl={initialWidgetLogoUrl}
          initialWidgetTitle={initialWidgetTitle}
          initialWidgetShowStarters={initialWidgetShowStarters}
          initialWidgetStarters={initialWidgetStarters}
          contactPreview={contactPreview}
          embedSnippet={`<script src=\"${siteUrl().replace(/\/$/, "")}/widget.js\" data-id=\"${embedChatbotId}\"></script>`}
        />
      </DashboardWorkSurface>
    </PageFrame>
  );
}
