import OpenAI from "openai";
import type { Message } from "@/lib/types";

const ALLOWED = [
  "spoed",
  "hoge_waarde",
  "prijsvraag",
  "klacht",
] as const;

export async function classifyLeadTags(input: {
  leadName: string;
  summary: string | null;
  intent: string | null;
  messages: Message[];
}): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return [];
  }

  const client = new OpenAI({ apiKey });
  const transcript = input.messages
    .slice(-40)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const sys = `Je classificeert een sales-lead. Antwoord met JSON: {"tags": [...]} waarbij tags 0 tot 4 strings zijn uit: ${ALLOWED.join(", ")}. Geen andere sleutels.
Betekenis:
- spoed: haast, vandaag/morgen, direct nodig
- hoge_waarde: duidelijk hoge orderwaarde of omvangrijke opdracht
- prijsvraag: focus op prijs/tarief/kosten
- klacht: ontevredenheid, probleem, conflict`;

  const user = `Naam: ${input.leadName}
Samenvatting: ${input.summary || "—"}
Intent: ${input.intent || "—"}
Transcript (recent):
${transcript || "(geen berichten)"}`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
  });

  const raw = res.choices[0]?.message?.content?.trim() || "{}";
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  let arr: unknown[] = [];
  if (
    parsed &&
    typeof parsed === "object" &&
    "tags" in parsed &&
    Array.isArray((parsed as { tags: unknown }).tags)
  ) {
    arr = (parsed as { tags: unknown[] }).tags;
  }

  const set = new Set<string>();
  for (const x of arr) {
    if (typeof x !== "string") continue;
    const t = x.trim().toLowerCase().replace(/\s+/g, "_");
    if ((ALLOWED as readonly string[]).includes(t)) {
      set.add(t);
    }
  }
  return Array.from(set);
}
