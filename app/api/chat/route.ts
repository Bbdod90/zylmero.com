import { NextRequest, NextResponse } from "next/server";
import {
  allowedLinkHosts,
  hostsFromKnowledgeText,
  parseShopLinksFromPrefs,
  sanitizeChatActions,
} from "@/lib/chatbot/chat-actions";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai/client";
import { extractJsonObject } from "@/lib/openai/json";
import { createAdminClient } from "@/lib/supabase/admin";
import { insertNotificationIfNew } from "@/lib/notifications/create";
import {
  fetchGoogleBusyRanges,
  refreshGoogleAccessToken,
  type GoogleTokenPayload,
} from "@/lib/oauth/google-calendar";
import { sealSocialToken, unsealSocialToken } from "@/lib/crypto/social-token";
import { fetchAppleCalendarBusyRanges } from "@/lib/integrations/apple-calendar";
import { truncateCrawledDocForPrompt } from "@/lib/ai/knowledge-document";
import {
  dutchLanguageQualityNl,
  lengthInstructionNl,
  maxTokensForAnswerKind,
  pricingAndStockAccuracyNl,
  relevanceAndCapabilityRulesNl,
  resolveAnswerLengthKind,
  type AnswerLengthKind,
} from "@/lib/chatbot/answer-style";
import { serviceMindsetRulesNl } from "@/lib/chatbot/service-mindset-nl";

const CHAT_JSON_MODEL =
  process.env.OPENAI_CHATBOT_MODEL?.trim() ||
  process.env.OPENAI_MODEL_CHATBOT?.trim() ||
  OPENAI_MODEL;

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

type ChatPayload = {
  message?: string;
  chatbot_id?: string;
  gesprek_id?: string | null;
  kanaal?: "web" | "whatsapp" | "email";
  stream?: boolean;
  preview_context?: {
    bedrijfs_omschrijving?: string | null;
    website_url?: string | null;
    extra_info?: string | null;
    openingszin?: string | null;
    settings?: Record<string, unknown>;
  };
};

type Role = "user" | "assistant";
type AppointmentIntent = {
  wantsAppointment: boolean;
  requestedStart: Date | null;
  rawTimeText: string | null;
};

const APPOINTMENT_DEFAULT_MINUTES = 60;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: CORS_HEADERS });
}

function safeString(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === "object" ? (input as Record<string, unknown>) : {};
}

function parseRequestedDateTime(raw: string): Date | null {
  const text = raw.toLowerCase();
  const now = new Date();
  const base = new Date(now);
  base.setSeconds(0, 0);

  const timeMatch = text.match(/(\d{1,2})(?::|\.| uur)?(\d{2})?/);
  const hour = timeMatch ? Number(timeMatch[1]) : 10;
  const minute = timeMatch && timeMatch[2] ? Number(timeMatch[2]) : 0;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  const dayMap: Record<string, number> = {
    zondag: 0,
    maandag: 1,
    dinsdag: 2,
    woensdag: 3,
    donderdag: 4,
    vrijdag: 5,
    zaterdag: 6,
  };
  if (text.includes("vandaag")) {
    const d = new Date(base);
    d.setHours(hour, minute, 0, 0);
    return d;
  }
  if (text.includes("morgen")) {
    const d = new Date(base);
    d.setDate(d.getDate() + 1);
    d.setHours(hour, minute, 0, 0);
    return d;
  }
  for (const [name, dayIdx] of Object.entries(dayMap)) {
    if (!text.includes(name)) continue;
    const d = new Date(base);
    const diff = (dayIdx - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  const explicit = text.match(/(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?/);
  if (explicit) {
    const day = Number(explicit[1]);
    const month = Number(explicit[2]) - 1;
    const yearRaw = explicit[3] ? Number(explicit[3]) : now.getFullYear();
    const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
    const d = new Date(year, month, day, hour, minute, 0, 0);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function extractRepairTags(text: string): string[] {
  const t = text.toLowerCase();
  const defs: [RegExp, string][] = [
    [/rem|brems/, "Remmen"],
    [/accu|batterij/, "Accu"],
    [/band/, "Band(en)"],
    [/ketting/, "Ketting"],
    [/motor/, "Motor"],
    [/display|scherm/, "Display"],
    [/licht|verlichting|lamp/, "Verlichting"],
    [/software|update|firmware/, "Software/update"],
    [/lader|oplad/, "Laden"],
    [/stuurbekrachtiging|besturing/, "Besturing"],
  ];
  const out: string[] = [];
  for (const [re, label] of defs) {
    if (re.test(t) && !out.includes(label)) out.push(label);
  }
  return out.slice(0, 8);
}

function detectAppointmentIntent(message: string): AppointmentIntent {
  const text = message.toLowerCase();
  const wantsAppointment =
    /(afspraak|inplannen|plan|boeken|boek|vrijdag|morgen|vandaag|reparatie|werkplaats|service|storing|kapot|defect|onderhoud)/.test(
      text,
    );
  const requestedStart = parseRequestedDateTime(text);
  return {
    wantsAppointment,
    requestedStart,
    rawTimeText: requestedStart ? message.trim() : null,
  };
}

function formatNlDateTime(date: Date): string {
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function intersects(
  aStart: Date,
  aEnd: Date,
  bStartIso: string | null | undefined,
  bEndIso: string | null | undefined,
): boolean {
  if (!bStartIso) return false;
  const bStart = new Date(bStartIso);
  const bEnd = bEndIso ? new Date(bEndIso) : new Date(bStart.getTime() + APPOINTMENT_DEFAULT_MINUTES * 60_000);
  if (Number.isNaN(bStart.getTime()) || Number.isNaN(bEnd.getTime())) return false;
  return aStart < bEnd && bStart < aEnd;
}

function isTokenExpired(payload: GoogleTokenPayload): boolean {
  if (typeof payload.expiry_date !== "number") return false;
  return Date.now() + 30_000 >= payload.expiry_date;
}

async function fetchGoogleBusyRangesForCompany(input: {
  supabase: ReturnType<typeof createAdminClient>;
  companyId: string;
  timeMinIso: string;
  timeMaxIso: string;
}): Promise<Array<{ start: string; end: string }>> {
  const { data: row } = await input.supabase
    .from("company_social_connections")
    .select("id, encrypted_token, metadata")
    .eq("company_id", input.companyId)
    .eq("provider", "google_calendar")
    .eq("status", "connected")
    .maybeSingle();
  if (!row?.encrypted_token || typeof row.encrypted_token !== "string") return [];

  const raw = unsealSocialToken(row.encrypted_token);
  if (!raw) return [];
  let token: GoogleTokenPayload;
  try {
    token = JSON.parse(raw) as GoogleTokenPayload;
  } catch {
    return [];
  }
  if (!token.access_token) return [];

  if (isTokenExpired(token) && token.refresh_token) {
    try {
      const refreshed = await refreshGoogleAccessToken(token.refresh_token);
      token = refreshed;
      await input.supabase
        .from("company_social_connections")
        .update({
          encrypted_token: sealSocialToken(JSON.stringify(refreshed)),
          token_expires_at:
            typeof refreshed.expiry_date === "number"
              ? new Date(refreshed.expiry_date).toISOString()
              : null,
          updated_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", row.id);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "google_refresh_failed";
      await input.supabase
        .from("company_social_connections")
        .update({
          status: "error",
          last_error: errMsg.slice(0, 400),
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      return [];
    }
  }

  const metadata = asRecord(row.metadata);
  const calendarId = safeString(metadata.calendar_id) || "primary";
  try {
    return await fetchGoogleBusyRanges({
      accessToken: token.access_token,
      timeMinIso: input.timeMinIso,
      timeMaxIso: input.timeMaxIso,
      calendarId,
    });
  } catch {
    return [];
  }
}

async function fetchAppleBusyRangesForCompany(input: {
  supabase: ReturnType<typeof createAdminClient>;
  companyId: string;
  timeMinIso: string;
  timeMaxIso: string;
}): Promise<Array<{ start: string; end: string }>> {
  const { data: row } = await input.supabase
    .from("company_social_connections")
    .select("metadata")
    .eq("company_id", input.companyId)
    .eq("provider", "apple_calendar")
    .eq("status", "connected")
    .maybeSingle();
  const metadata = asRecord(row?.metadata);
  const icsUrl = safeString(metadata.ics_url);
  if (!icsUrl) return [];
  try {
    return await fetchAppleCalendarBusyRanges({
      icsUrl,
      windowStartIso: input.timeMinIso,
      windowEndIso: input.timeMaxIso,
    });
  } catch {
    return [];
  }
}

async function tryHandleAppointmentRequest(input: {
  supabase: ReturnType<typeof createAdminClient>;
  chatbot: Record<string, unknown>;
  companyId: string | null;
  companyName: string | null;
  conversationId: string;
  message: string;
  companySettings: Record<string, unknown> | null;
}): Promise<string | null> {
  if (!input.companyId) return null;
  const intent = detectAppointmentIntent(input.message);
  if (!intent.wantsAppointment) return null;
  if (!intent.requestedStart) {
    const repairish = /reparatie|werkplaats|kapot|defect|storing|onderhoud/.test(input.message.toLowerCase());
    if (repairish) {
      return [
        "Ik help je graag met een werkplaats-/reparatieafspraak.",
        "Stuur in één bericht:",
        "• Kort wat er aan de hand is (je mag ook trefwoorden gebruiken, zoals remmen of accu)",
        "• Welke dag en tijd je wilt (bijv. vrijdag 10:00)",
        "",
        "Het bedrijf ziet je aanvraag in de agenda en bevestigt de tijd daarna handmatig.",
      ].join("\n");
    }
    return "Top, ik help je graag met een afspraak. Welke dag en tijd wil je precies (bijv. vrijdag 10:00)?";
  }

  const requestedStart = intent.requestedStart;
  if (requestedStart.getTime() < Date.now() - 60_000) {
    return "Dat tijdstip ligt in het verleden. Kun je een nieuwe dag en tijd sturen?";
  }
  const requestedEnd = new Date(requestedStart.getTime() + APPOINTMENT_DEFAULT_MINUTES * 60_000);

  const [zylmeroRows, companyOwner] = await Promise.all([
    input.supabase
      .from("appointments")
      .select("starts_at, ends_at, status")
      .eq("company_id", input.companyId)
      .in("status", ["scheduled", "planned", "confirmed"])
      .gte("starts_at", new Date(requestedStart.getTime() - 24 * 60 * 60_000).toISOString())
      .lte("starts_at", new Date(requestedStart.getTime() + 24 * 60 * 60_000).toISOString()),
    input.supabase
      .from("companies")
      .select("id, name, contact_email")
      .eq("id", input.companyId)
      .maybeSingle(),
  ]);

  const zylmeroBusy = (zylmeroRows.data || []).some((row) =>
    intersects(requestedStart, requestedEnd, row.starts_at as string | null, row.ends_at as string | null),
  );

  const prefs = asRecord(input.companySettings?.automation_preferences);
  const googleBusy = await fetchGoogleBusyRangesForCompany({
    supabase: input.supabase,
    companyId: input.companyId,
    timeMinIso: new Date(requestedStart.getTime() - 24 * 60 * 60_000).toISOString(),
    timeMaxIso: new Date(requestedStart.getTime() + 24 * 60 * 60_000).toISOString(),
  });
  const googleBusyHit = googleBusy.some((row) =>
    intersects(requestedStart, requestedEnd, row.start, row.end),
  );
  const appleBusy = await fetchAppleBusyRangesForCompany({
    supabase: input.supabase,
    companyId: input.companyId,
    timeMinIso: new Date(requestedStart.getTime() - 24 * 60 * 60_000).toISOString(),
    timeMaxIso: new Date(requestedStart.getTime() + 24 * 60 * 60_000).toISOString(),
  });
  const appleBusyHit = appleBusy.some((row) =>
    intersects(requestedStart, requestedEnd, row.start, row.end),
  );
  const externalBusy = Array.isArray(prefs.calendar_busy_ranges)
    ? prefs.calendar_busy_ranges.some((row) => {
        const r = asRecord(row);
        return intersects(
          requestedStart,
          requestedEnd,
          safeString(r.start) || null,
          safeString(r.end) || null,
        );
      })
    : false;

  if (zylmeroBusy || externalBusy || googleBusyHit || appleBusyHit) {
    const alternatives: string[] = [];
    for (let i = 1; i <= 4 && alternatives.length < 3; i++) {
      const candidateStart = new Date(requestedStart.getTime() + i * 2 * 60 * 60_000);
      const candidateEnd = new Date(candidateStart.getTime() + APPOINTMENT_DEFAULT_MINUTES * 60_000);
      const collision = (zylmeroRows.data || []).some((row) =>
        intersects(candidateStart, candidateEnd, row.starts_at as string | null, row.ends_at as string | null),
      );
      if (!collision) alternatives.push(formatNlDateTime(candidateStart));
    }
    const altText = alternatives.length
      ? `Beschikbare alternatieven: ${alternatives.join(" / ")}.`
      : "Kun je een andere dag of tijd sturen?";
    return `Dit tijdstip lijkt al bezet in de agenda. ${altText}`;
  }

  const tags = extractRepairTags(input.message);
  const tagPart = tags.length ? ` Tags: ${tags.join(", ")}.` : "";
  const notes = `Chatbot afspraakverzoek (${input.conversationId}).${tagPart} Klant: "${intent.rawTimeText || input.message}"`;
  const { error: createErr } = await input.supabase.from("appointments").insert({
    company_id: input.companyId,
    starts_at: requestedStart.toISOString(),
    ends_at: requestedEnd.toISOString(),
    status: "planned",
    notes,
  });
  if (createErr) return null;

  const companyTitle = safeString(companyOwner.data?.name) || safeString(input.companyName) || "het bedrijf";
  await insertNotificationIfNew(input.supabase, {
    company_id: input.companyId,
    type: "new_lead",
    title: "Nieuwe afspraak-aanvraag te bevestigen",
    body: `Klant wil ${formatNlDateTime(requestedStart)}. Bevestig of stel alternatief voor.`,
    dedupe_key: `chatbot-appointment-request:${input.conversationId}:${requestedStart.toISOString()}`,
    metadata: {
      kind: "appointment_request",
      requested_start: requestedStart.toISOString(),
      requested_end: requestedEnd.toISOString(),
      source: "chatbot_web",
    },
  });

  return `Top, ik heb je afspraakverzoek voor ${formatNlDateTime(requestedStart)} doorgestuurd naar ${companyTitle}. Je krijgt na bevestiging meteen reactie.`;
}

function buildSystemPrompt(data: {
  bedrijfsOmschrijving: string;
  websiteUrl: string | null;
  extraInfo: string | null;
  openingszin: string | null;
  settings: Record<string, unknown>;
  companySettings?: Record<string, unknown> | null;
  history: Array<{ role: Role; content: string }>;
  kanaal: "web" | "whatsapp" | "email";
  currentMessage: string;
}) {
  const widgetDoelen = (data.settings?.doelen as Record<string, unknown> | undefined) || {};
  const companySettings = asRecord(data.companySettings);
  const companyFaq = Array.isArray(companySettings.faq)
    ? companySettings.faq
        .map((row) => asRecord(row))
        .map((row) => {
          const q = safeString(row.q);
          const a = safeString(row.a);
          return q && a ? `Q: ${q}\nA: ${a}` : "";
        })
        .filter(Boolean)
        .join("\n")
    : "";
  const companySnippets = Array.isArray(companySettings.knowledge_snippets)
    ? companySettings.knowledge_snippets
        .map((row) => asRecord(row))
        .map((row) => {
          const title = safeString(row.title);
          const body = safeString(row.body);
          return title && body ? `${title}: ${body}` : "";
        })
        .filter(Boolean)
        .join("\n")
    : "";
  const companyServices = Array.isArray(companySettings.services)
    ? companySettings.services.map((s) => safeString(s)).filter(Boolean).join(", ")
    : "";
  const companyHoursRaw = companySettings.business_hours;
  const companyHours = companyHoursRaw && typeof companyHoursRaw === "object"
    ? JSON.stringify(companyHoursRaw)
    : "";
  const prefs = asRecord(companySettings.automation_preferences);
  const storedGoals = asRecord(prefs.chatbot_goals);
  const vragenTerugStellen = prefs.chatbot_vragen_terug_stellen === true;
  const contactOk =
    storedGoals.contactaanvragen_verwerken === false ||
    widgetDoelen.contactaanvragen_verwerken === false
      ? false
      : true;
  const crawledKnowledge = truncateCrawledDocForPrompt(
    safeString(prefs.ai_knowledge_crawled_document),
  );
  const digestNl = safeString(prefs.ai_knowledge_digest_nl);
  const knowledgeWebsite = safeString(prefs.ai_knowledge_website);
  const answerLen: AnswerLengthKind = resolveAnswerLengthKind({
    widgetSettings: data.settings,
    automationPrefs: prefs,
  });
  const doelRegels = [
    "- Vragen beantwoorden met directe, bruikbare info",
    "- Klanten helpen met korte, concrete vervolgstappen",
    contactOk ? "- Contactvraag opvangen als klant dat expliciet wil" : null,
  ]
    .filter(Boolean)
    .join("\n");

  const klantgerichtBlock = vragenTerugStellen
    ? `- Stel alleen een vervolgvraag als die echt nodig is om verder te helpen`
    : `- Stel GEEN onnodige vervolgvragen en eindig niet met retorische vragen naar de klant
- Bij prijs-, model- of assortimentvragen: geef eerst een volledig antwoord uit de context (alle modellen met prijs als die in de context staan); vraag niet eerst om een specifiek model`;

  const capsBlock = relevanceAndCapabilityRulesNl({
    capabilities: prefs.chatbot_capabilities,
  });

  const historyBlock = data.history
    .slice(-10)
    .map((m) => `${m.role === "assistant" ? "BOT" : "KLANT"}: ${m.content}`)
    .join("\n");

  const systemBase = `Je bent de digitale assistent van dit bedrijf — denk en praat als een menselijke medewerker (balie/telefoon), niet als een generieke FAQ-bot. Pas je aan bij elke branche (werkplaats, zorg, retail, dienstverlening): wat zij professioneel aanbieden, bied jij aan.

REGELS:
- Antwoord altijd vriendelijk, duidelijk en to-the-point
- Geef eerst het directe antwoord op de vraag van de klant
- ${lengthInstructionNl(answerLen)}
${klantgerichtBlock}
${capsBlock}

${pricingAndStockAccuracyNl()}

${dutchLanguageQualityNl()}

${serviceMindsetRulesNl()}

BELANGRIJK:
- Gebruik ALLEEN feiten die in de context hieronder staan (website, extra info, FAQ, snippets)
- Noem NOOIT prijzen, openingstijden, voorraad, garanties of productdetails die niet expliciet in de context staan
${!contactOk ? "- Contactverzoeken doorgeven staat uit: geen actieve push naar formulieren of \"laat je gegevens achter\"; antwoord inhoudelijk uit de context.\n" : ""}
- Als info ontbreekt: zeg dat eerlijk kort${vragenTerugStellen ? " en stel max 1 gerichte vraag" : "; stel geen lange reeks vervolgvragen"}
- Bevestig NOOIT dat een afspraak, offerte of bestelling "geregeld" is zonder echte boekingsactie/tool
- Als klant wil boeken maar je kunt niet boeken in deze chat: verwijs naar contact/boekingslink uit context`;

  const context = [
    `Bedrijfsomschrijving:\n${data.bedrijfsOmschrijving || "Niet ingevuld."}`,
    data.websiteUrl ? `Website:\n${data.websiteUrl}` : "",
    data.extraInfo ? `Extra info:\n${data.extraInfo}` : "",
    data.openingszin ? `Voorkeurs-openingszin:\n${data.openingszin}` : "",
    doelRegels ? `Doelen van deze chatbot:\n${doelRegels}` : "",
    companyServices ? `Diensten (account):\n${companyServices}` : "",
    companyHours ? `Openingstijden (account):\n${companyHours}` : "",
    knowledgeWebsite ? `Kennis-website (account):\n${knowledgeWebsite}` : "",
    digestNl ? `Kennis-samenvatting (account):\n${digestNl}` : "",
    companyFaq ? `FAQ uit account:\n${companyFaq}` : "",
    companySnippets ? `Kennis-snippets uit account:\n${companySnippets}` : "",
    crawledKnowledge ? `Gescrapete websitekennis:\n${crawledKnowledge}` : "",
    historyBlock ? `Recente chatgeschiedenis:\n${historyBlock}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return `${systemBase}

Kanaal: ${data.kanaal}
Huidige klantvraag:
${data.currentMessage}

CONTEXT BEDRIJF:
${context}`;
}

async function resolveGesprekId(input: {
  supabase: ReturnType<typeof createAdminClient>;
  chatbotId: string;
  gesprekId?: string | null;
  kanaal: "web" | "whatsapp" | "email";
}): Promise<string> {
  const s = input.supabase;
  if (input.gesprekId) {
    const { data } = await s
      .from("gesprekken")
      .select("id")
      .eq("id", input.gesprekId)
      .eq("chatbot_id", input.chatbotId)
      .maybeSingle();
    if (data?.id) return data.id;
  }
  const { data: created, error } = await s
    .from("gesprekken")
    .insert({ chatbot_id: input.chatbotId, kanaal: input.kanaal })
    .select("id")
    .single();
  if (error || !created?.id) throw new Error(error?.message || "Kon gesprek niet maken.");
  return created.id;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  let body: ChatPayload;
  try {
    body = (await request.json()) as ChatPayload;
  } catch {
    return jsonError("Ongeldige JSON.");
  }

  const message = safeString(body.message);
  const chatbotId = safeString(body.chatbot_id);
  if (!chatbotId) return jsonError("chatbot_id ontbreekt.");
  if (!message) return jsonError("message ontbreekt.");
  if (message.length > 2000) return jsonError("Bericht is te lang (max 2000 tekens).");

  const kanaal = body.kanaal === "whatsapp" || body.kanaal === "email" ? body.kanaal : "web";
  const supabase = createAdminClient();

  const { data: chatbot, error: chatbotError } = await supabase
    .from("chatbots")
    .select("*")
    .eq("id", chatbotId)
    .maybeSingle();

  if (chatbotError || !chatbot) return jsonError("Chatbot niet gevonden.", 404);
  let chatbotCompanyId = safeString(chatbot.company_id);
  if (!chatbotCompanyId) {
    const ownerId = safeString(chatbot.user_id);
    if (ownerId) {
      const { data: ownerCompany } = await supabase
        .from("companies")
        .select("id, name")
        .eq("owner_user_id", ownerId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      chatbotCompanyId = safeString(ownerCompany?.id);
    }
  }
  let companySettingsRow: Record<string, unknown> | null = null;
  if (chatbotCompanyId) {
    const { data: row } = await supabase
      .from("company_settings")
      .select("*")
      .eq("company_id", chatbotCompanyId)
      .maybeSingle();
    companySettingsRow = row && typeof row === "object" ? (row as Record<string, unknown>) : null;
  }

  const preview = body.preview_context || {};
  const bedrijfsOmschrijving = safeString(preview.bedrijfs_omschrijving) || safeString(chatbot.bedrijfs_omschrijving);
  if (!bedrijfsOmschrijving) return jsonError("Chatbot mist bedrijfsomschrijving.", 422);

  const websiteUrl = safeString(preview.website_url) || safeString(chatbot.website_url);
  const extraInfo = safeString(preview.extra_info) || safeString(chatbot.extra_info);
  const apRaw = companySettingsRow?.automation_preferences;
  const prefsOpening =
    apRaw && typeof apRaw === "object"
      ? safeString((apRaw as Record<string, unknown>).chatbot_opening_line)
      : "";
  const openingszin =
    safeString(preview.openingszin) || prefsOpening || safeString(chatbot.openingszin);
  const settings =
    preview.settings && typeof preview.settings === "object"
      ? preview.settings
      : chatbot.settings && typeof chatbot.settings === "object"
        ? (chatbot.settings as Record<string, unknown>)
        : {};

  const gesprekId = await resolveGesprekId({
    supabase,
    chatbotId,
    gesprekId: body.gesprek_id || null,
    kanaal,
  });

  const { data: recentMessages } = await supabase
    .from("berichten")
    .select("rol, inhoud")
    .eq("gesprek_id", gesprekId)
    .order("created_at", { ascending: false })
    .limit(10);
  const history: Array<{ role: Role; content: string }> = Array.isArray(recentMessages)
    ? recentMessages
        .map(
          (row): { role: Role; content: string } => ({
            role: row?.rol === "bot" ? "assistant" : "user",
            content: safeString(row?.inhoud),
          }),
        )
        .filter((row) => row.content.length > 0)
        .reverse()
    : [];

  const companyPrefs = asRecord(
    companySettingsRow && typeof companySettingsRow === "object"
      ? (companySettingsRow as Record<string, unknown>).automation_preferences
      : {},
  );
  const answerKind = resolveAnswerLengthKind({
    widgetSettings: settings,
    automationPrefs: companyPrefs,
  });
  const maxTok = maxTokensForAnswerKind(answerKind);

  const systemPrompt = buildSystemPrompt({
    bedrijfsOmschrijving,
    websiteUrl: websiteUrl || null,
    extraInfo: extraInfo || null,
    openingszin: openingszin || null,
    settings,
    companySettings: companySettingsRow,
    history,
    kanaal,
    currentMessage: message,
  });

  await supabase.from("berichten").insert({
    gesprek_id: gesprekId,
    rol: "user",
    inhoud: message,
  });

  const appointmentFlowReply = await tryHandleAppointmentRequest({
    supabase,
    chatbot: chatbot as Record<string, unknown>,
    companyId: chatbotCompanyId || null,
    companyName: safeString((chatbot as Record<string, unknown>).company_name) || null,
    conversationId: gesprekId,
    message,
    companySettings: companySettingsRow,
  });
  if (appointmentFlowReply) {
    await supabase.from("berichten").insert({
      gesprek_id: gesprekId,
      rol: "bot",
      inhoud: appointmentFlowReply,
    });
    return NextResponse.json(
      { reply: appointmentFlowReply, gesprek_id: gesprekId },
      {
        headers: CORS_HEADERS,
      },
    );
  }

  const openai = getOpenAI();
  const streamMode = body.stream !== false;

  if (!streamMode) {
    const configuredShopLinks = parseShopLinksFromPrefs(companyPrefs);
    const shopLinksLines =
      configuredShopLinks.length > 0
        ? configuredShopLinks.map((l) => `- "${l.label}" → ${l.url}`).join("\n")
        : "(geen — gebruik alleen https-product-URL's uit de kennis/context)";
    const crawlForHosts = truncateCrawledDocForPrompt(safeString(companyPrefs.ai_knowledge_crawled_document));
    const digestNl = safeString(companyPrefs.ai_knowledge_digest_nl);
    const hostExtractSource = [bedrijfsOmschrijving, crawlForHosts, digestNl].join("\n");

    const jsonAppendix = [
      "",
      "Geconfigureerde shop-/productlinks:",
      shopLinksLines,
      "",
      "ACTIEKNOPPEN (optioneel, max. 2): alleen bij duidelijke koop-/bestelintentie.",
      "Gebruik GEEN verzonnen URL's — alleen links hierboven of exacte https-URL's uit de context.",
      "",
      'OUTPUTFORMAAT — strikt JSON: {"reply":"…","actions":[{"label":"…","url":"https://…"}]}',
      '"actions" mag [] zijn of ontbreken.',
    ].join("\n");

    const completion = await openai.chat.completions.create({
      model: CHAT_JSON_MODEL,
      temperature: 0.2,
      max_tokens: maxTok + 120,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${systemPrompt}${jsonAppendix}\n\nJe antwoord MOET geldig JSON zijn met minimaal het veld "reply" (string).`,
        },
        { role: "user", content: message },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim() || "";
    let reply = raw || "Sorry, ik kon nu geen antwoord maken.";
    let actionsRaw: unknown = [];
    try {
      const parsed = extractJsonObject<{ reply?: string; actions?: unknown }>(raw);
      reply = String(parsed.reply ?? "").trim() || reply;
      actionsRaw = parsed.actions ?? [];
    } catch {
      reply = raw || "Sorry, ik kon nu geen antwoord maken.";
      actionsRaw = [];
    }

    const cs = companySettingsRow && typeof companySettingsRow === "object" ? companySettingsRow : null;
    const allowedHosts = allowedLinkHosts({
      websiteUrl: safeString(cs?.ai_knowledge_website) || websiteUrl || null,
      knowledgeWebsite: safeString(cs?.ai_knowledge_website),
      bookingLink: safeString(cs?.booking_link),
      shopLinks: configuredShopLinks,
    });
    hostsFromKnowledgeText(hostExtractSource).forEach((h) => {
      allowedHosts.add(h);
    });
    const actions = sanitizeChatActions(actionsRaw, allowedHosts);

    await supabase.from("berichten").insert({
      gesprek_id: gesprekId,
      rol: "bot",
      inhoud: reply,
    });
    return NextResponse.json(
      {
        reply,
        ...(actions.length > 0 ? { actions } : {}),
        gesprek_id: gesprekId,
      },
      {
        headers: CORS_HEADERS,
      },
    );
  }

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.2,
    max_tokens: maxTok,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
  });

  const encoder = new TextEncoder();
  let total = "";
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (!delta) continue;
          total += delta;
          controller.enqueue(encoder.encode(delta));
        }
        const finalContent = total.trim() || "Sorry, ik kon nu geen antwoord maken.";
        await supabase.from("berichten").insert({
          gesprek_id: gesprekId,
          rol: "bot",
          inhoud: finalContent,
        });
        controller.close();
      } catch {
        const fallback = total.trim() || "Er ging iets mis tijdens het genereren van dit antwoord.";
        await supabase.from("berichten").insert({
          gesprek_id: gesprekId,
          rol: "bot",
          inhoud: fallback,
        });
        controller.enqueue(encoder.encode(fallback));
        controller.close();
      }
    },
  });

  return new NextResponse(readable, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "x-chat-gesprek-id": gesprekId,
    },
  });
}
