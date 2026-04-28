import type { AiKnowledgePage } from "@/lib/types";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai/client";

/**
 * Korte NL-samenvatting voor de dashboard-UI: wat de bot ongeveer uit site + extra tekst haalt.
 * Faalt stil (null) bij ontbrekende key of API-fout — opslaan van kennis blijft gewoon werken.
 */
export async function generateSiteKnowledgeDigestNl(input: {
  companyName: string;
  website: string | null;
  extraDocument: string | null;
  pages: AiKnowledgePage[];
  crawledDocument: string;
}): Promise<string | null> {
  const doc = input.extraDocument?.trim() || "";
  if (!input.pages.length && !doc) return null;
  if (!process.env.OPENAI_API_KEY) return null;

  const titleSample = input.pages
    .slice(0, 90)
    .map((p) => `- ${p.title || p.url}`)
    .join("\n");
  const crawlSample = input.crawledDocument.slice(0, 14_000);
  const docSample = doc.slice(0, 4_000);

  const user = [
    `Bedrijfsnaam: ${input.companyName}`,
    input.website ? `Website: ${input.website}` : "",
    input.pages.length ? `Aantal gescande pagina's: ${input.pages.length}` : "",
    titleSample ? `Voorbeeld van paginatitels:\n${titleSample}` : "",
    crawlSample
      ? `Fragmenten uit gescande pagina's (samenvattingen):\n${crawlSample}`
      : "",
    docSample ? `Extra tekst van de gebruiker:\n${docSample}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const openai = getOpenAI();
    const res = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.35,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "Je schrijft korte, begrijpelijke Nederlandse tekst voor ondernemers zonder technische kennis. " +
            "Geen jargon. Alleen redelijke conclusies uit de brontekst — niets verzinnen dat er niet staat.",
        },
        {
          role: "user",
          content:
            "Maak een korte samenvatting (4 tot 8 bullets) voor de eigenaar: wat heeft de website-chatbot ongeveer geleerd? " +
            "Begin elke bullet met \"• \". Maximaal 900 tekens totaal. " +
            "Als openingstijden of contact niet duidelijk in de tekst staan, zeg dat kort (bijv. \"openingstijden niet expliciet gevonden\").\n\n" +
            user,
        },
      ],
    });
    const text = res.choices[0]?.message?.content?.trim();
    if (!text) return null;
    return text.slice(0, 1_200);
  } catch {
    return null;
  }
}
