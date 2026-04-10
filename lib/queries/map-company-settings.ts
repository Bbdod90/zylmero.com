import type {
  CompanySettings,
  KnowledgeSnippet,
  WhatsAppChannelSettings,
} from "@/lib/types";

export function mapCompanySettingsRow(
  data: Record<string, unknown> | null,
): CompanySettings | null {
  if (!data) return null;
  const prefs = (data.automation_preferences as Record<string, unknown>) || {};
  const raw = (data.whatsapp_channel as Record<string, unknown>) || {};
  const whatsapp_channel: WhatsAppChannelSettings = {
    provider:
      raw.provider === "twilio" || raw.provider === "meta"
        ? raw.provider
        : "mock",
    connected: Boolean(raw.connected),
    phone_number:
      typeof raw.phone_number === "string" ? raw.phone_number : null,
    external_id:
      typeof raw.external_id === "string" ? raw.external_id : null,
    last_sync_at:
      typeof raw.last_sync_at === "string" ? raw.last_sync_at : null,
  };
  return {
    company_id: data.company_id as string,
    niche: (data.niche as string) ?? null,
    services: (data.services as string[]) || [],
    faq: (data.faq as CompanySettings["faq"]) || [],
    pricing_hints: (data.pricing_hints as string) ?? null,
    business_hours:
      (data.business_hours as CompanySettings["business_hours"]) || {},
    booking_link: (data.booking_link as string) ?? null,
    tone: (data.tone as string) ?? null,
    reply_style: (data.reply_style as string) ?? null,
    language: (data.language as string) || "nl",
    automation_preferences:
      (data.automation_preferences as Record<string, unknown>) || {},
    whatsapp_channel,
    auto_reply_enabled: Boolean(data.auto_reply_enabled),
    auto_reply_delay_seconds:
      typeof data.auto_reply_delay_seconds === "number"
        ? data.auto_reply_delay_seconds
        : 30,
    ai_usage_count:
      typeof data.ai_usage_count === "number" ? data.ai_usage_count : 0,
    ai_setup_completed_at:
      (data.ai_setup_completed_at as string) ?? null,
    niche_intake:
      (data.niche_intake as Record<string, string> | undefined) &&
      typeof data.niche_intake === "object" &&
      data.niche_intake !== null &&
      !Array.isArray(data.niche_intake)
        ? (data.niche_intake as Record<string, string>)
        : {},
    knowledge_snippets: Array.isArray(data.knowledge_snippets)
      ? (data.knowledge_snippets as KnowledgeSnippet[]).filter(
          (x) => x && typeof x.title === "string" && typeof x.body === "string",
        )
      : [],
    ai_knowledge_website:
      typeof prefs.ai_knowledge_website === "string" &&
      prefs.ai_knowledge_website.trim()
        ? prefs.ai_knowledge_website.trim()
        : null,
    ai_knowledge_document:
      typeof prefs.ai_knowledge_document === "string" &&
      prefs.ai_knowledge_document.trim()
        ? prefs.ai_knowledge_document.trim()
        : null,
    white_label_logo_url: (data.white_label_logo_url as string) ?? null,
    white_label_primary: (data.white_label_primary as string) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}
