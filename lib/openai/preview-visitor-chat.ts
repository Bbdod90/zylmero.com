import type { CompanySettings } from "@/lib/types";
import {
  lengthInstructionNl,
  maxTokensForAnswerKind,
  relevanceAndCapabilityRulesNl,
  resolveAnswerLengthKind,
} from "@/lib/chatbot/answer-style";
import { businessContextBlock } from "@/lib/openai/prompts";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai/client";

const OPENAI_CHATBOT_MODEL =
  process.env.OPENAI_CHATBOT_MODEL?.trim() ||
  process.env.OPENAI_MODEL_CHATBOT?.trim() ||
  process.env.OPENAI_MODEL_PREVIEW?.trim() ||
  OPENAI_MODEL;

/** Eén testantwoord voor de chatbot-setup (zelfde kennis als productie-context). */
export async function previewVisitorChatReply(input: {
  companyName: string;
  settings: CompanySettings | null;
  nicheId: string | null;
  visitorMessage: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
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
  const vragenTerugStellen = prefs.chatbot_vragen_terug_stellen === true;

  const kind = resolveAnswerLengthKind({
    widgetSettings: {},
    automationPrefs: prefs,
  });

  let lengthInstruction = lengthInstructionNl(kind);
  if (vragenTerugStellen) {
    lengthInstruction =
      kind === "kort"
        ? "Met vervolgvragen aan: maximaal 2 korte zinnen; stel alleen een gerichte vraag als dat echt nodig is."
        : "Met vervolgvragen aan: maximaal 4 korte zinnen; stel alleen een gerichte vraag als dat echt nodig is.";
  }

  let maxOutTokens = maxTokensForAnswerKind(kind);
  if (vragenTerugStellen) {
    maxOutTokens = Math.min(maxOutTokens, kind === "kort" ? 260 : 400);
  }

  const capsBlock = relevanceAndCapabilityRulesNl({
    capabilities: prefs.chatbot_capabilities,
  });

  const recentHistory = (input.history || [])
    .slice(-8)
    .map((m) => `${m.role === "assistant" ? "BOT" : "KLANT"}: ${m.content}`)
    .join("\n");

  const antiQuestionBlock = vragenTerugStellen
    ? `- Stel alleen een verduidelijkende vraag als dat echt nodig is om verder te helpen.
- Bij twijfel: zeg eerlijk dat die informatie niet in de kennis staat en vraag max 1 korte verduidelijkende vraag.`
    : `- Stel GEEN vervolgvragen en eindig niet met een vraag naar de klant (geen "welk model?", "heb je een voorkeur?", tenzij de context écht leeg is voor die vraag — dan max. 1 zin).
- Bij vragen over kosten, modellen of assortiment: antwoord eerst volledig uit de context — noem alle modellen/producten die in de kennis staan met bijbehorende prijs als die er staat. Ga niet doorvragen voordat je dit hebt gegeven.
- Als de gevraagde prijs/informatie niet in de context staat: zeg dat kort in één zin, zonder een lange stroom aan extra vragen.`;

  const prompt = `Hieronder staat alle context die de chatbot mag gebruiken.

${ctx}

---
${capsBlock}

---
De bezoeker stelt deze vraag (in ${lang}):
${input.visitorMessage}

Vorige berichten in dit gesprek (indien aanwezig):
${recentHistory || "(geen eerdere berichten)"}

Geef één antwoord als website-chatbot.
Harde regels:
- ${lengthInstruction}
- Geen lange verkooppraat.
- Gebruik alleen informatie uit de context.
- Noem NOOIT een prijs, model, productdetail of openingstijd als die niet letterlijk in de context staat.
${antiQuestionBlock}
- Bevestig NOOIT dat een afspraak/offerte/bestelling definitief is geregeld zonder echte boekingstool.`;

  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: OPENAI_CHATBOT_MODEL,
    temperature: 0.15,
    max_tokens: maxOutTokens,
    messages: [
      {
        role: "system",
        content:
          "Je bent een professionele klantenservice-chatbot. Antwoord feitelijk en vriendelijk. " +
          "Als prijzen, modellen of voorraad in de context staan (ook in samenvatting of gescande tekst), noem ze alleen wanneer dat bij de vraag past. " +
          "Verzin geen prijzen of productdetails die niet in de context staan. " +
          (vragenTerugStellen
            ? "Stel alleen vervolgvragen wanneer nodig en doe geen valse bevestiging van afspraken of offertes."
            : "Je prioriteit is het direct beantwoorden van de klantvraag uit de context; stel geen onnodige vervolgvragen."),
      },
      { role: "user", content: prompt },
    ],
  });

  const text = res.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Lege AI-respons");
  return text;
}
