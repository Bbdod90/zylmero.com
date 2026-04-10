import type { CompanySettings, Lead, Message } from "@/lib/types";
import type { QuoteJson } from "@/lib/openai/types";
import { businessContextBlock } from "@/lib/openai/prompts";
import { getNicheConfig } from "@/lib/niches";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai/client";
import { extractJsonObject } from "@/lib/openai/json";

export async function generateQuoteDraft(input: {
  lead: Pick<
    Lead,
    "full_name" | "intent" | "summary" | "estimated_value"
  >;
  messages: Pick<Message, "role" | "content" | "created_at">[];
  companyName: string;
  settings: CompanySettings | null;
  nicheId?: string | null;
}): Promise<QuoteJson> {
  const niche = getNicheConfig(input.nicheId);
  const transcript = input.messages
    .slice(-32)
    .map((m) => `[${m.role.toUpperCase()} ${m.created_at}]\n${m.content}`)
    .join("\n\n");

  const ctx = businessContextBlock(
    input.companyName,
    input.settings,
    input.nicheId,
  );

  const prompt = `Maak een offerte-concept (EUR, excl. tenzij anders vermeld).

${ctx}

Branche-specifieke structuur: ${niche.quote.lineItemGuidance}
${niche.ai.quoteInstructions}

Klant: ${input.lead.full_name}
Intent: ${input.lead.intent || "—"}
Samenvatting: ${input.lead.summary || "—"}
Waardehint: ${input.lead.estimated_value ?? "—"}

Transcript:
${transcript}

JSON keys:
title, description, items[{description, quantity, unit_price, line_total}], subtotal, vat (btw-bedrag), total, notes (intern)`;

  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Je output alleen JSON met title, description, items, subtotal, vat, total, notes. Regels moeten aansluiten bij de branche-instructie.",
      },
      { role: "user", content: prompt },
    ],
  });

  const text = res.choices[0]?.message?.content;
  if (!text) throw new Error("Lege AI-respons");

  const parsed = extractJsonObject<QuoteJson>(text);
  if (!parsed.items?.length) throw new Error("Offerte zonder regels");

  return parsed;
}
