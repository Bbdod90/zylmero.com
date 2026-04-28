import type { CompanySettings } from "@/lib/types";
import { businessContextBlock } from "@/lib/openai/prompts";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai/client";

/** Eén testantwoord voor de chatbot-setup (zelfde kennis als productie-context). */
export async function previewVisitorChatReply(input: {
  companyName: string;
  settings: CompanySettings | null;
  nicheId: string | null;
  visitorMessage: string;
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
  const prompt = `Hieronder staat alle context die de chatbot mag gebruiken.

${ctx}

---
De bezoeker stelt deze vraag (in ${lang}):
${input.visitorMessage}

Geef één kort antwoord als website-chatbot.
Harde regels:
- ${lengthInstruction}
- Geen lange uitleg of verkooppraat.
- Gebruik alleen informatie uit de context.
- Noem NOOIT een prijs, model, productdetail of openingstijd als die niet letterlijk in de context staat.
- Bij twijfel: zeg eerlijk dat die informatie niet in de kennis staat en vraag 1 korte verduidelijkende vraag.`;

  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.1,
    max_tokens: answerLength === "short" ? 120 : 220,
    messages: [
      {
        role: "system",
        content:
          "Je bent een professionele klantenservice-chatbot. Antwoord kort, feitelijk en vriendelijk. " +
          "Je verzint nooit prijzen of feiten. Als iets niet in de context staat, zeg dat expliciet.",
      },
      { role: "user", content: prompt },
    ],
  });

  const text = res.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Lege AI-respons");
  return text;
}
