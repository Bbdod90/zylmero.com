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
import { tryChatAppointmentBooking } from "@/lib/chatbot/appointment-booking";
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

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: CORS_HEADERS });
}

function safeString(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === "object" ? (input as Record<string, unknown>) : {};
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

  const appointmentFlowReply = await tryChatAppointmentBooking({
    supabase,
    companyId: chatbotCompanyId || null,
    companyName: safeString((chatbot as Record<string, unknown>).company_name) || null,
    conversationId: gesprekId,
    history,
    message,
    companySettings: companySettingsRow,
    source: "chatbot_web",
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
