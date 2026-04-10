import type { CompanySettings, Message } from "@/lib/types";
import { businessContextBlock } from "@/lib/openai/prompts";
import { getNicheConfig } from "@/lib/niches";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai/client";

export async function suggestReply(input: {
  messages: Pick<Message, "role" | "content" | "created_at">[];
  companyName: string;
  settings: CompanySettings | null;
  leadFirstName: string;
  nicheId?: string | null;
}): Promise<string> {
  const transcript = input.messages
    .slice(-28)
    .map((m) => `[${m.role.toUpperCase()} ${m.created_at}]\n${m.content}`)
    .join("\n\n");

  const niche = getNicheConfig(input.nicheId);
  const ctx = businessContextBlock(
    input.companyName,
    input.settings,
    input.nicheId,
  );

  const prompt = `Schrijf ÉÉN kort antwoord namens het bedrijf — geen chatbot-floskel.

${ctx}

Doel: commerciële close-assistent — kwalificeer kort, stel maximaal één gerichte vraag, en stuur subtiel richting afspraak, offerte of duidelijke volgende stap (passend bij de branche).
Geen druk-taal; wel duidelijkheid en voorstel om te sluiten.
Wees kort, zelfverzekerd, behulpzaam.
Taal: ${input.settings?.language || "nl"}
Voornaam spaarzaam: ${input.leadFirstName}

Transcript:
${transcript}

Alleen de berichttekst, geen onderwerp.`;

  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.45,
    messages: [
      {
        role: "system",
        content: niche.ai.replySystemPersona,
      },
      { role: "user", content: prompt },
    ],
  });

  const text = res.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Lege AI-respons");
  return text;
}
