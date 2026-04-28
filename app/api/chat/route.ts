import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai/client";
import { createAdminClient } from "@/lib/supabase/admin";

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

const MAX_CRAWLED_KNOWLEDGE_CHARS = 9000;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: CORS_HEADERS });
}

function safeString(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === "object" ? (input as Record<string, unknown>) : {};
}

function normalizeAnswerLength(settings: Record<string, unknown>): "kort" | "normaal" | "uitgebreid" {
  const raw = safeString(settings.antwoord_lengte).toLowerCase();
  if (raw === "normaal" || raw === "uitgebreid") return raw;
  return "kort";
}

function lengthInstruction(kind: "kort" | "normaal" | "uitgebreid"): string {
  if (kind === "uitgebreid") return "Maximaal 6 zinnen, compact en scanbaar.";
  if (kind === "normaal") return "Maximaal 4 korte zinnen.";
  return "Maximaal 2 korte zinnen.";
}

function truncateKnowledge(raw: string): string {
  if (!raw) return "";
  if (raw.length <= MAX_CRAWLED_KNOWLEDGE_CHARS) return raw;
  return `${raw.slice(0, MAX_CRAWLED_KNOWLEDGE_CHARS)}\n\n[Ingekort om binnen context te passen]`;
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
  const doelen = (data.settings?.doelen as Record<string, unknown> | undefined) || {};
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
  const crawledKnowledge = truncateKnowledge(safeString(prefs.ai_knowledge_crawled_document));
  const digestNl = safeString(prefs.ai_knowledge_digest_nl);
  const knowledgeWebsite = safeString(prefs.ai_knowledge_website);
  const answerLen = normalizeAnswerLength(data.settings);
  const doelRegels = [
    doelen.vragen_beantwoorden === false ? null : "- Vragen beantwoorden met directe, bruikbare info",
    doelen.klanten_helpen === false ? null : "- Klanten helpen met korte, concrete vervolgstappen",
    doelen.contactaanvragen_verwerken === false ? null : "- Contactvraag opvangen als klant dat expliciet wil",
  ]
    .filter(Boolean)
    .join("\n");

  const historyBlock = data.history
    .slice(-10)
    .map((m) => `${m.role === "assistant" ? "BOT" : "KLANT"}: ${m.content}`)
    .join("\n");

  const systemBase = `Je bent de website-chatbot van dit specifieke bedrijf.

REGELS:
- Antwoord altijd vriendelijk, duidelijk en to-the-point
- Geef eerst het directe antwoord op de vraag van de klant
- ${lengthInstruction(answerLen)}
- Stel alleen een vervolgvraag als die echt nodig is om verder te helpen
- Nooit generieke branche-tekst: pas antwoord aan op dit bedrijf en deze context

BELANGRIJK:
- Gebruik ALLEEN feiten die in de context hieronder staan (website, extra info, FAQ, snippets)
- Noem NOOIT prijzen, openingstijden, voorraad, garanties of productdetails die niet expliciet in de context staan
- Als info ontbreekt: zeg dat eerlijk in 1 zin en stel max 1 gerichte vraag
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
  const chatbotCompanyId = safeString(chatbot.company_id);
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
  const openingszin = safeString(preview.openingszin) || safeString(chatbot.openingszin);
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

  const openai = getOpenAI();
  const streamMode = body.stream !== false;

  if (!streamMode) {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });
    const content = completion.choices[0]?.message?.content?.trim() || "Sorry, ik kon nu geen antwoord maken.";
    await supabase.from("berichten").insert({
      gesprek_id: gesprekId,
      rol: "bot",
      inhoud: content,
    });
    return NextResponse.json(
      { reply: content, gesprek_id: gesprekId },
      {
        headers: CORS_HEADERS,
      },
    );
  }

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.2,
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
