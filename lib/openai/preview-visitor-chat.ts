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
  const ctx = businessContextBlock(
    input.companyName,
    input.settings,
    input.nicheId,
  );
  const lang = input.settings?.language || "nl";
  const prompt = `Hieronder staat alle context die de chatbot mag gebruiken.

${ctx}

---
De bezoeker stelt deze vraag (in ${lang}):
${input.visitorMessage}

Schrijf ÉÉN antwoord als de chatbot op de website: vriendelijk, duidelijk, hooguit 6 korte zinnen.
Gebruik alleen informatie die in de context staat. Staat het antwoord er niet (genoeg) in, zeg dat eerlijk en nodig uit om contact op te nemen (zonder een specifiek telefoonnummer te verzinnen als dat niet in de context staat).`;

  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.4,
    max_tokens: 450,
    messages: [
      {
        role: "system",
        content:
          "Je bent een behulpzame chatwidget op de bedrijfswebsite. Je helpt bezoekers; je bent geen verkoper die dringt.",
      },
      { role: "user", content: prompt },
    ],
  });

  const text = res.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Lege AI-respons");
  return text;
}
