import { WIDGET_STARTER_WELCOME_DEFAULT, WIDGET_STARTERS } from "./widget-starters";

/** Standaard accent (luxury gold) als er geen merkkleur is gezet. */
export const WIDGET_DEFAULT_PRIMARY = "#c9a227";

/** Standaard widget-kop (donker). */
export const WIDGET_DEFAULT_HEADER = "#161618";

/** Standaard bot-antwoordbubbel. */
export const WIDGET_DEFAULT_BOT_BUBBLE = "#2a2a2e";

export type PublicWidgetStarter = { label: string; prompt: string };

/** Bellen + WhatsApp voor de widget-footer (publiek veilig). */
export type PublicWidgetContactJson = {
  tel_href: string | null;
  whatsapp_href: string | null;
  phone_display: string | null;
};

export type PublicWidgetConfigJson = {
  opening_line: string;
  widget_title: string;
  primary_color: string;
  /** Kop van de widget (donker); gradient-onderkleur wordt afgeleid. */
  header_color: string | null;
  /** Achtergrond bot-antwoordbubbels; gradient-onderkleur wordt afgeleid. */
  bot_bubble_color: string | null;
  logo_url: string | null;
  show_starters: boolean;
  starters: PublicWidgetStarter[];
  contact: PublicWidgetContactJson;
};

export function defaultPublicWidgetConfig(): PublicWidgetConfigJson {
  return {
    opening_line: WIDGET_STARTER_WELCOME_DEFAULT,
    widget_title: "Chat",
    primary_color: WIDGET_DEFAULT_PRIMARY,
    header_color: null,
    bot_bubble_color: null,
    logo_url: null,
    show_starters: true,
    starters: WIDGET_STARTERS.map(({ label, prompt }) => ({ label, prompt })),
    contact: { tel_href: null, whatsapp_href: null, phone_display: null },
  };
}

export function normalizeStartersFromPrefs(raw: unknown): PublicWidgetStarter[] {
  const fallback = WIDGET_STARTERS.map(({ label, prompt }) => ({ label, prompt }));
  if (!Array.isArray(raw)) return fallback;
  const out: PublicWidgetStarter[] = [];
  for (const item of raw.slice(0, 5)) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const label = String(rec.label ?? "").trim().slice(0, 120);
    const prompt = String(rec.prompt ?? "").trim().slice(0, 2000);
    if (label && prompt) out.push({ label, prompt });
  }
  return out.length > 0 ? out : fallback;
}

export function buildPublicWidgetConfig(params: {
  automationPreferences: Record<string, unknown>;
  chatbotOpeningszin: string | null;
  whiteLabelPrimary: string | null;
  whiteLabelLogoUrl: string | null;
}): PublicWidgetConfigJson {
  const prefs = params.automationPreferences;
  const opening =
    (typeof prefs.chatbot_opening_line === "string" && prefs.chatbot_opening_line.trim()
      ? prefs.chatbot_opening_line.trim()
      : null) ||
    params.chatbotOpeningszin?.trim() ||
    WIDGET_STARTER_WELCOME_DEFAULT;

  const primaryRaw =
    (typeof prefs.chatbot_widget_primary === "string" && prefs.chatbot_widget_primary.trim()
      ? prefs.chatbot_widget_primary.trim()
      : null) ||
    params.whiteLabelPrimary?.trim() ||
    WIDGET_DEFAULT_PRIMARY;

  const primary_color = /^#[0-9A-Fa-f]{6}$/.test(primaryRaw) ? primaryRaw : WIDGET_DEFAULT_PRIMARY;

  const logo_url =
    (typeof prefs.chatbot_widget_logo_url === "string" && prefs.chatbot_widget_logo_url.trim()
      ? prefs.chatbot_widget_logo_url.trim()
      : null) ||
    params.whiteLabelLogoUrl?.trim() ||
    null;

  const widget_title =
    (typeof prefs.chatbot_widget_title === "string" && prefs.chatbot_widget_title.trim()
      ? prefs.chatbot_widget_title.trim().slice(0, 48)
      : null) || "Chat";

  const headerRaw =
    typeof prefs.chatbot_widget_header_color === "string" ? prefs.chatbot_widget_header_color.trim() : "";
  const header_color = /^#[0-9A-Fa-f]{6}$/.test(headerRaw) ? headerRaw : null;

  const botRaw =
    typeof prefs.chatbot_widget_bot_color === "string" ? prefs.chatbot_widget_bot_color.trim() : "";
  const bot_bubble_color = /^#[0-9A-Fa-f]{6}$/.test(botRaw) ? botRaw : null;

  const show_starters = prefs.chatbot_widget_show_starters !== false;

  const starters = normalizeStartersFromPrefs(prefs.chatbot_widget_starters);

  return {
    opening_line: opening.slice(0, 600),
    widget_title,
    primary_color,
    header_color,
    bot_bubble_color,
    logo_url,
    show_starters,
    starters,
    contact: { tel_href: null, whatsapp_href: null, phone_display: null },
  };
}
