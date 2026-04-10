import type { Lead, LeadStatus, LeadProgressionResult, Message } from "@/lib/types";
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

export async function leadProgressionHint(input: {
  lead: Pick<Lead, "status" | "summary" | "intent">;
  messages: Pick<Message, "role" | "content">[];
}): Promise<LeadProgressionResult> {
  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'JSON: { "next_stage": one of new|active|quote_sent|appointment_booked|won|lost, "urgency": low|medium|high, "confidence": 0-100 }',
      },
      {
        role: "user",
        content: `Huidige status: ${input.lead.status}\nIntent: ${input.lead.intent || ""}\nSummary: ${input.lead.summary || ""}\nLaatste berichten:\n${input.messages
          .slice(-8)
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n")}`,
      },
    ],
  });

  const text = res.choices[0]?.message?.content;
  if (!text) throw new Error("Lege AI-respons");

  const p = extractJsonObject<{
    next_stage: string;
    urgency: "low" | "medium" | "high";
    confidence: number;
  }>(text);

  const next = ALLOWED.includes(p.next_stage as LeadStatus)
    ? (p.next_stage as LeadStatus)
    : input.lead.status;

  return {
    next_stage: next,
    urgency: p.urgency,
    confidence: Math.min(100, Math.max(0, Math.round(p.confidence))),
  };
}
