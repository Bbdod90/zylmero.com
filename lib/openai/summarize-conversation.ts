import type {
  CompanySettings,
  ConversationSummaryResult,
  LeadStatus,
  Message,
} from "@/lib/types";
import { businessContextBlock } from "@/lib/openai/prompts";
import { getNicheConfig } from "@/lib/niches";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai/client";
import { extractJsonObject } from "@/lib/openai/json";

const ALLOWED: LeadStatus[] = [
  "new",
  "active",
  "quote_sent",
  "appointment_booked",
  "won",
  "lost",
];

export async function summarizeConversation(input: {
  messages: Pick<Message, "role" | "content" | "created_at">[];
  companyName: string;
  settings: CompanySettings | null;
  nicheId?: string | null;
}): Promise<ConversationSummaryResult> {
  const niche = getNicheConfig(input.nicheId);
  const transcript = input.messages
    .map((m) => `[${m.role.toUpperCase()} ${m.created_at}]\n${m.content}`)
    .join("\n\n");

  const ctx = businessContextBlock(
    input.companyName,
    input.settings,
    input.nicheId,
  );

  const prompt = `${niche.ai.summarizeAnalystHint}

${ctx}

Transcript:
${transcript}

Geef ALLEEN geldig JSON met keys:
summary (string, NL) — zakelijk, gericht op wat de klant wil betalen of boeken
intent (string)
score (integer 0-100) — hoger bij prijsvraag, spoed, duidelijke afspraakbehoefte
estimated_value (integer EUR) — realistische orderwaarde voor deze branche
suggested_next_action (string, NL) — één concrete verkoopstap (bellen/offerte/boeken)
status_recommendation (string, één van: new, active, quote_sent, appointment_booked, won, lost)`;

  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.25,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Je antwoordt uitsluitend met compact JSON. Geen uitleg buiten JSON.",
      },
      { role: "user", content: prompt },
    ],
  });

  const text = res.choices[0]?.message?.content;
  if (!text) throw new Error("Lege AI-respons");

  const parsed = extractJsonObject<Record<string, unknown>>(text);
  const status = String(parsed.status_recommendation || "") as LeadStatus;
  if (!ALLOWED.includes(status)) {
    throw new Error("Ongeldige status_recommendation");
  }

  return {
    summary: String(parsed.summary || ""),
    intent: String(parsed.intent || ""),
    score: Math.min(100, Math.max(0, Math.round(Number(parsed.score) || 0))),
    estimated_value: Math.max(
      0,
      Math.round(Number(parsed.estimated_value) || 0),
    ),
    suggested_next_action: String(parsed.suggested_next_action || ""),
    status_recommendation: status,
  };
}
