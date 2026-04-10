import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: Request) {
  let body: { message?: string; context?: { branche?: string; prijsrange?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }
  const message = String(body.message || "").trim();
  if (!message) {
    return NextResponse.json({ error: "Bericht ontbreekt" }, { status: 400 });
  }
  const branche = body.context?.branche || "service";
  const prijsrange = body.context?.prijsrange || "€100–€500";

  if (!openai) {
    return NextResponse.json(
      { reply: "", resultTitle: "", valueLine: "", error: "Geen AI" },
      { status: 503 },
    );
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.45,
    max_tokens: 280,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Je antwoordt namens een Nederlands ${branche}-bedrijf. Schrijf zoals een ondernemer: kort, duidelijk, geen moeilijke woorden, geen marketingtaal.
Stel hooguit twee vragen. Werk toe naar een concrete afspraak of volgende stap.
Zeg nooit dat je een AI of assistent bent. Prijsindicatie voor context: ${prijsrange}.
Antwoord alleen met een JSON-object met keys: reply, resultTitle, valueLine.`,
      },
      { role: "user", content: message },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "";
  try {
    const parsed = JSON.parse(raw) as {
      reply?: string;
      resultTitle?: string;
      valueLine?: string;
    };
    if (parsed.reply) {
      return NextResponse.json({
        reply: parsed.reply,
        resultTitle: parsed.resultTitle || "Afspraak voorgesteld",
        valueLine: parsed.valueLine || prijsrange,
      });
    }
  } catch {
    /* parse text fallback */
  }

  return NextResponse.json({
    reply: raw || "Dank je — wanneer komt het uit om langs te komen?",
    resultTitle: "Afspraak voorgesteld",
    valueLine: prijsrange,
  });
}
