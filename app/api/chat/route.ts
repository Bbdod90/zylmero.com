import { NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { mapCompanyRow } from "@/lib/auth/map-company";
import { hasSubscriptionAccess } from "@/lib/billing/trial";
import type { EmbeddedChatTone } from "@/lib/embedded-chat/types";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai/client";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

function toneDirective(tone: string): string {
  const t = tone as EmbeddedChatTone;
  switch (t) {
    case "kort":
      return "Houd antwoorden zeer kort (maximaal 2 à 3 zinnen), tenzij de klant expliciet meer detail vraagt.";
    case "vriendelijk":
      return "Toon: warm en menselijk — geen corporate jargon.";
    case "zakelijk":
    default:
      return "Toon: professioneel, rustig en helder — direct en zonder opsmuk.";
  }
}

function buildSystemPrompt(opts: {
  botName: string;
  tone: string;
  instructions: string;
  knowledgeLines: string[];
}): string {
  const knowledge =
    opts.knowledgeLines.length > 0
      ? `\n\nKennis van dit bedrijf (gebruik dit waar het klopt; verzin geen prijzen of garanties die hier niet staan):\n${opts.knowledgeLines.join("\n\n")}`
      : "";

  return `Je bent de websitechat van "${opts.botName}" — een klein bedrijf in Nederland.

Doel: snel reageren, duidelijk blijven, vertrouwen geven, en helpen richting afspraak, contactmoment of de volgende logische stap.
${toneDirective(opts.tone)}

Aanvullende instructies van de ondernemer:
${opts.instructions || "Beantwoord kort, bied een vervolgstap (bijv. moment kiezen, telefoonnummer, of korte vraag)."}${knowledge}

Regels:
- Antwoord in het Nederlands.
- Geen lange lappen tekst. Actiegericht: wat kan de klant nu doen?
- Als iets onduidelijk is, stel maximaal 1 of 2 gerichte vragen.
- Geen medische, juridische of gegarandeerde uitspraken — wel duidelijk maken wat jullie wél kunnen.
- Sluit, als het logisch is, af met een concrete vervolgstap.`;
}

export async function POST(request: Request) {
  let body: { chatbotId?: string; sessionId?: string | null; message?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ongeldig JSON-verzoek" }, { status: 400, headers: cors });
  }

  const chatbotId = String(body.chatbotId || "").trim();
  const rawMessage = String(body.message || "").trim();
  let sessionId = body.sessionId ? String(body.sessionId).trim() : "";

  if (!chatbotId || !rawMessage) {
    return NextResponse.json({ error: "chatbotId en message zijn verplicht" }, { status: 400, headers: cors });
  }

  if (rawMessage.length > 8000) {
    return NextResponse.json({ error: "Bericht is te lang" }, { status: 400, headers: cors });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Server niet geconfigureerd voor database" },
      { status: 503, headers: cors },
    );
  }

  const { data: bot, error: botErr } = await admin
    .from("embedded_chatbots")
    .select("id, name, tone, instructions, company_id")
    .eq("id", chatbotId)
    .maybeSingle();

  if (botErr || !bot?.company_id) {
    return NextResponse.json({ error: "Chatbot niet gevonden" }, { status: 404, headers: cors });
  }

  const { data: companyRow, error: cErr } = await admin
    .from("companies")
    .select("*")
    .eq("id", bot.company_id)
    .maybeSingle();

  if (cErr || !companyRow) {
    return NextResponse.json({ error: "Bedrijf niet gevonden" }, { status: 404, headers: cors });
  }

  const company = mapCompanyRow(companyRow as Record<string, unknown>);
  if (!hasSubscriptionAccess(company)) {
    return NextResponse.json(
      {
        error:
          "Deze chat is tijdelijk niet beschikbaar. Het abonnement van dit bedrijf is niet actief — neem rechtstreeks contact op.",
      },
      { status: 403, headers: cors },
    );
  }

  const { data: sources } = await admin
    .from("embedded_chatbot_sources")
    .select("type, content")
    .eq("chatbot_id", chatbotId);

  const knowledgeLines =
    sources?.map((s) => {
      if (s.type === "url") {
        return `Website-URL (context): ${s.content}`;
      }
      return `Tekstkennis:\n${s.content}`;
    }) ?? [];

  if (sessionId) {
    const { data: sess } = await admin
      .from("embedded_chat_sessions")
      .select("id, chatbot_id")
      .eq("id", sessionId)
      .maybeSingle();
    if (!sess || sess.chatbot_id !== chatbotId) {
      sessionId = "";
    }
  }

  if (!sessionId) {
    const { data: created, error: sErr } = await admin
      .from("embedded_chat_sessions")
      .insert({ chatbot_id: chatbotId })
      .select("id")
      .single();
    if (sErr || !created?.id) {
      return NextResponse.json({ error: "Sessie starten mislukt" }, { status: 500, headers: cors });
    }
    sessionId = created.id;
  }

  const { error: uErr } = await admin.from("embedded_chat_messages").insert({
    session_id: sessionId,
    role: "user",
    content: rawMessage,
  });
  if (uErr) {
    return NextResponse.json({ error: "Bericht opslaan mislukt" }, { status: 500, headers: cors });
  }

  const { data: prior } = await admin
    .from("embedded_chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(40);

  const system = buildSystemPrompt({
    botName: bot.name || "Assistent",
    tone: bot.tone || "zakelijk",
    instructions: bot.instructions || "",
    knowledgeLines,
  });

  const chatMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: system },
    ...(prior ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  let replyText: string;
  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.45,
      max_tokens: 420,
      messages: chatMessages,
    });
    replyText = completion.choices[0]?.message?.content?.trim() || "";
  } catch {
    return NextResponse.json(
      { error: "AI-antwoord niet beschikbaar. Probeer het zo opnieuw." },
      { status: 503, headers: cors },
    );
  }

  if (!replyText) {
    replyText =
      "Ik kan je zo even niet goed helpen — wil je een kort bericht achterlaten met je vraag en telefoonnummer? Dan neemt het team contact op.";
  }

  const { error: aErr } = await admin.from("embedded_chat_messages").insert({
    session_id: sessionId,
    role: "assistant",
    content: replyText,
  });
  if (aErr) {
    return NextResponse.json(
      { error: "Antwoord opslaan mislukt", sessionId },
      { status: 500, headers: cors },
    );
  }

  return NextResponse.json({ reply: replyText, sessionId }, { headers: cors });
}
