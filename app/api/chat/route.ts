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

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: CORS_HEADERS });
}

function safeString(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function buildSystemPrompt(data: {
  bedrijfsOmschrijving: string;
  websiteUrl: string | null;
  extraInfo: string | null;
  openingszin: string | null;
  settings: Record<string, unknown>;
}) {
  const doelen = (data.settings?.doelen as Record<string, unknown> | undefined) || {};
  const doelRegels = [
    doelen.vragen_beantwoorden === false ? null : "- Vragen beantwoorden",
    doelen.klanten_helpen === false ? null : "- Klanten helpen",
    doelen.contactaanvragen_verwerken === false ? null : "- Contact aanvragen verwerken",
  ]
    .filter(Boolean)
    .join("\n");

  const systemBase = `Je bent een professionele klantenservice medewerker.

REGELS:
- Antwoord altijd vriendelijk en zakelijk
- Geef eerst een direct antwoord op de vraag
- Houd antwoorden kort en duidelijk
- Stel daarna een logische vervolgvraag
- Wees behulpzaam, niet opdringerig

BELANGRIJK:
- Bied GEEN offerte, afspraak of actie aan tenzij de gebruiker daar expliciet om vraagt
- Als iemand alleen informatie wil -> geef alleen informatie
- Als iemand vraagt om contact / offerte / hulp -> dan pas actie ondernemen

VOORBEELD:
Vraag: Wat kost een fatbike?
Antwoord: Onze fatbikes kosten vanaf EUR999. Naar welk model ben je op zoek?`;

  const context = [
    `Bedrijfsomschrijving:\n${data.bedrijfsOmschrijving || "Niet ingevuld."}`,
    data.websiteUrl ? `Website:\n${data.websiteUrl}` : "",
    data.extraInfo ? `Extra info:\n${data.extraInfo}` : "",
    data.openingszin ? `Voorkeurs-openingszin:\n${data.openingszin}` : "",
    doelRegels ? `Doelen van deze chatbot:\n${doelRegels}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return `${systemBase}\n\nCONTEXT BEDRIJF:\n${context}`;
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

  const systemPrompt = buildSystemPrompt({
    bedrijfsOmschrijving,
    websiteUrl: websiteUrl || null,
    extraInfo: extraInfo || null,
    openingszin: openingszin || null,
    settings,
  });

  const gesprekId = await resolveGesprekId({
    supabase,
    chatbotId,
    gesprekId: body.gesprek_id || null,
    kanaal,
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
      temperature: 0.45,
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
    temperature: 0.45,
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
