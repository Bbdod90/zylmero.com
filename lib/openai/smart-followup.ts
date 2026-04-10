import type { CompanySettings, Lead, Message } from "@/lib/types";
import { businessContextBlock } from "@/lib/openai/prompts";
import { getNicheConfig } from "@/lib/niches";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai/client";

export async function smartFollowUpMessage(input: {
  lead: Lead;
  messages: Pick<Message, "role" | "content" | "created_at">[];
  companyName: string;
  settings: CompanySettings | null;
  situation: string;
  nicheId?: string | null;
}): Promise<string> {
  const niche = getNicheConfig(input.nicheId);
  const transcript = input.messages
    .slice(-24)
    .map((m) => `[${m.role.toUpperCase()} ${m.created_at}]\n${m.content}`)
    .join("\n\n");

  const ctx = businessContextBlock(
    input.companyName,
    input.settings,
    input.nicheId,
  );

  const prompt = `Schrijf ÉÉN kort opvolgbericht (WhatsApp/e-mailstijl) namens het bedrijf.

${ctx}

Situatie: ${input.situation}

Lead: ${input.lead.full_name}
Fase: ${input.lead.status}
Intent: ${input.lead.intent || "—"}

Transcript:
${transcript}

Regels:
- Zelfverzekerd, kort, behulpzaam — geen chatbot-taal.
- Stuur richting boeking, of geaccepteerde offerte, of een kort call-moment — passend bij de branche.
- Taal: ${input.settings?.language || "nl"}
- Geen valse kortingen of garanties.

Alleen de berichttekst, geen onderwerp.`;

  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: niche.ai.followUpSystemPersona,
      },
      { role: "user", content: prompt },
    ],
  });

  const text = res.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Lege AI-respons");
  return text;
}
