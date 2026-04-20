import { NextResponse } from "next/server";
import { APIError, RateLimitError } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { mapCompanyRow } from "@/lib/auth/map-company";
import { hasSubscriptionAccess } from "@/lib/billing/trial";
import type { EmbeddedChatTone } from "@/lib/embedded-chat/types";
import { fetchUrlPlainTextForChatKnowledge } from "@/lib/embedded-chat/url-page-context";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai/client";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Ruimte voor system + geschiedenis; voorkomt context_length-fouten bij grote Shopify-pagina’s */
const MAX_KNOWLEDGE_CHARS = 14_000;
const MAX_SYSTEM_CHARS_RETRY = 10_000;
const CHAT_HISTORY_LIMIT = 24;

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

function capKnowledgeLines(lines: string[]): string[] {
  const joined = lines.join("\n\n");
  if (joined.length <= MAX_KNOWLEDGE_CHARS) return lines;
  return [
    `${joined.slice(0, MAX_KNOWLEDGE_CHARS - 160)}\n\n[… Kennis ingekort wegens maximale lengte — gebruik kortere tekst of minder URL-bronnen.]`,
  ];
}

function openaiErrMeta(err: unknown): { msg: string; lower: string; status?: number; bodyLower: string } {
  const msg = err instanceof Error ? err.message : String(err);
  let status: number | undefined;
  let bodyLower = "";
  if (err instanceof APIError) {
    status = err.status;
    try {
      bodyLower =
        typeof err.error === "object" && err.error !== null
          ? JSON.stringify(err.error).toLowerCase()
          : "";
    } catch {
      bodyLower = "";
    }
  }
  const lower = msg.toLowerCase();
  return { msg, lower, status, bodyLower };
}

function isContextLengthFailure(err: unknown, bodyLower: string, lower: string): boolean {
  if (bodyLower.includes("context_length_exceeded")) return true;
  return (
    lower.includes("context_length") ||
    lower.includes("maximum context") ||
    lower.includes("too many tokens") ||
    lower.includes("this model's maximum context")
  );
}

function isBillingOrQuotaFailure(lower: string, bodyLower: string): boolean {
  return (
    bodyLower.includes("insufficient_quota") ||
    lower.includes("insufficient_quota") ||
    bodyLower.includes("billing_hard_limit") ||
    lower.includes("billing_hard_limit") ||
    lower.includes("exceeded your current quota")
  );
}

async function runChatCompletion(
  openai: ReturnType<typeof getOpenAI>,
  messages: ChatCompletionMessageParam[],
  maxTokens: number,
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.45,
    max_tokens: maxTokens,
    messages,
  });
  return completion.choices[0]?.message?.content?.trim() || "";
}

function buildSystemPrompt(opts: {
  botName: string;
  tone: string;
  instructions: string;
  knowledgeLines: string[];
}): string {
  const knowledge =
    opts.knowledgeLines.length > 0
      ? `\n\nKennis van dit bedrijf (inclusief tekst van gekoppelde pagina’s waar aanwezig). Gebruik dit als feitenbron: noem alleen producten, prijzen en details die hier letterlijk of duidelijk in staan. Staat iets er niet (bijv. een specifiek model), zeg dat eerlijk en bied contact of de site aan — verzin niets.\n${opts.knowledgeLines.join("\n\n")}`
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

  const knowledgeLinesRaw: string[] = sources?.length
    ? await Promise.all(
        sources.map(async (s) => {
          if (s.type === "url") {
            const url = String(s.content || "").trim();
            const fetched = await fetchUrlPlainTextForChatKnowledge(url);
            if (fetched) {
              return `Website “${url}” — platte tekst van de pagina (kan onvolledig zijn door lay-out; gebruik dit voor producten/voorraad):\n${fetched}`;
            }
            return `Website-URL (inhoud kon niet worden ingelezen; gebruik de link alleen als hint, geen productlijst verzinnen): ${url}`;
          }
          return `Tekstkennis:\n${s.content}`;
        }),
      )
    : [];
  const knowledgeLines = capKnowledgeLines(knowledgeLinesRaw);

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
    .limit(CHAT_HISTORY_LIMIT);

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

  let replyText = "";
  try {
    const openai = getOpenAI();
    try {
      replyText = await runChatCompletion(openai, chatMessages, 720);
    } catch (firstErr) {
      const meta = openaiErrMeta(firstErr);
      if (isContextLengthFailure(firstErr, meta.bodyLower, meta.lower)) {
        const sys = chatMessages[0];
        if (sys?.role === "system" && typeof sys.content === "string" && sys.content.length > MAX_SYSTEM_CHARS_RETRY) {
          const shortened =
            sys.content.slice(0, MAX_SYSTEM_CHARS_RETRY - 140) +
            "\n\n[…] Kennis automatisch ingekort — opnieuw proberen.";
          const retryMessages: ChatCompletionMessageParam[] = [
            { role: "system", content: shortened },
            ...chatMessages.slice(1),
          ];
          replyText = await runChatCompletion(openai, retryMessages, 640);
        } else {
          throw firstErr;
        }
      } else {
        throw firstErr;
      }
    }
  } catch (err) {
    const { lower, status, bodyLower } = openaiErrMeta(err);
    const missingKey =
      lower.includes("openai_api_key") ||
      lower.includes("api key") ||
      lower.includes("incorrect api key") ||
      lower.includes("invalid api key");
    if (missingKey) {
      return NextResponse.json(
        {
          error:
            "AI is op deze omgeving nog niet gekoppeld (OPENAI_API_KEY). Voeg de sleutel toe bij je hosting — daarna werkt Live test en de widget.",
        },
        { status: 503, headers: cors },
      );
    }
    if (isBillingOrQuotaFailure(lower, bodyLower)) {
      return NextResponse.json(
        {
          error:
            "OpenAI-account: geen saldo of quota meer — ga naar platform.openai.com, open Billing, voeg tegoed toe of verhoog je limiet. Daarna werkt Live test weer.",
        },
        { status: 503, headers: cors },
      );
    }
    const rateHit =
      err instanceof RateLimitError ||
      (status === 429 && !isBillingOrQuotaFailure(lower, bodyLower)) ||
      lower.includes("rate_limit_exceeded") ||
      (lower.includes("too many requests") && status === 429);
    if (rateHit) {
      return NextResponse.json(
        {
          error:
            "Even geduld — OpenAI geeft een tijdelijke rate limit. Wacht een minuut en probeer opnieuw.",
        },
        { status: 503, headers: cors },
      );
    }
    if (isContextLengthFailure(err, bodyLower, lower)) {
      return NextResponse.json(
        {
          error:
            "Er past te veel kennis en gesprek in één verzoek. Verwijder een bron, plak kortere tekst, of gebruik een compacte pagina-URL (bijv. alleen je shop-home).",
        },
        { status: 503, headers: cors },
      );
    }
    return NextResponse.json(
      { error: "AI-antwoord tijdelijk niet beschikbaar. Probeer het zo opnieuw." },
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
