import type { CompanySettings } from "@/lib/types";
import { businessContextBlock } from "@/lib/openai/prompts";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai/client";

const OPENAI_CHATBOT_MODEL =
  process.env.OPENAI_CHATBOT_MODEL?.trim() ||
  process.env.OPENAI_MODEL_CHATBOT?.trim() ||
  process.env.OPENAI_MODEL_PREVIEW?.trim() ||
  OPENAI_MODEL;

/** Eén testantwoord voor de chatbot-setup (zelfde kennis als productie-context). */
export async function previewVisitorChatReply(input: {
  companyName: string;
  settings: CompanySettings | null;
  nicheId: string | null;
  visitorMessage: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<string> {
  const rawCtx = businessContextBlock(
    input.companyName,
    input.settings,
    input.nicheId,
  );
  const ctx =
    input.settings?.pricing_hints && input.settings.pricing_hints.trim()
      ? rawCtx
      : rawCtx.replace(/^Prijsrichting \(intern\):.*\n?/m, "");
  const lang = input.settings?.language || "nl";
  const prefs = (input.settings?.automation_preferences as Record<string, unknown> | undefined) || {};
  const answerLength =
    typeof prefs.chatbot_answer_length === "string" && prefs.chatbot_answer_length === "normal"
      ? "normal"
      : "short";
  const lengthInstruction =
    answerLength === "short"
      ? "Maximaal 2 korte zinnen."
      : "Maximaal 4 korte zinnen.";
  const recentHistory = (input.history || [])
    .slice(-8)
    .map((m) => `${m.role === "assistant" ? "BOT" : "KLANT"}: ${m.content}`)
    .join("\n");
  const prompt = `Hieronder staat alle context die de chatbot mag gebruiken.

${ctx}

---
De bezoeker stelt deze vraag (in ${lang}):
${input.visitorMessage}

Vorige berichten in dit gesprek (indien aanwezig):
${recentHistory || "(geen eerdere berichten)"}

Geef één kort antwoord als website-chatbot.
Harde regels:
- ${lengthInstruction}
- Geen lange uitleg of verkooppraat.
- Gebruik alleen informatie uit de context.
- Noem NOOIT een prijs, model, productdetail of openingstijd als die niet letterlijk in de context staat.
- Stel alleen een verduidelijkende vraag als dat echt nodig is om verder te helpen.
- Bevestig NOOIT dat een afspraak/offerte/bestelling definitief is geregeld zonder echte boekingstool.
- Bij twijfel: zeg eerlijk dat die informatie niet in de kennis staat en vraag max 1 korte verduidelijkende vraag.`;

  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: OPENAI_CHATBOT_MODEL,
    temperature: 0.1,
    max_tokens: answerLength === "short" ? 120 : 220,
    messages: [
      {
        role: "system",
        content:
          "Je bent een professionele klantenservice-chatbot. Antwoord kort, feitelijk en vriendelijk. " +
          "Je verzint nooit prijzen of feiten. Als iets niet in de context staat, zeg dat expliciet. " +
          "Stel alleen vervolgvragen wanneer nodig en doe geen valse bevestiging van afspraken of offertes.",
      },
      { role: "user", content: prompt },
    ],
  });

  const text = res.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Lege AI-respons");
  return text;
}
