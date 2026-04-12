import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { RdwVehicleSnapshot } from "@/lib/rdw/kenteken";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function fmtApk(ymd?: string): string | null {
  if (!ymd || ymd.length < 8) return null;
  return `${ymd.slice(6, 8)}-${ymd.slice(4, 6)}-${ymd.slice(0, 4)}`;
}

function vehiclePromptBlock(v: RdwVehicleSnapshot): string {
  const lines = [
    `Kenteken: ${v.kenteken}`,
    `Voertuig (RDW): ${v.merk} ${v.handelsbenaming} (${v.voertuigsoort})`,
  ];
  if (v.eerste_kleur) lines.push(`Kleur: ${v.eerste_kleur}`);
  const apk = fmtApk(v.vervaldatum_apk);
  if (apk) lines.push(`APK tot: ${apk}`);
  lines.push(
    "Bandenmaat staat niet in deze RDW-basisregistratie — check bij binnenkomst, op de band of via montage.",
  );
  return lines.join("\n");
}

function automotiveIntent(msg: string): boolean {
  return /\b(band|banden|apk|kenteken|auto|voorband|achterband|lek|lekkage|garage|wiel|voertuig|montage|winterband|zomerband)\b/i.test(
    msg,
  );
}

function beautyIntent(msg: string): boolean {
  return /\b(knip|knippen|kleur|balayage|kapper|salon|baard|extensions|permanent|fohn|highlights|knipbeurt)\b/i.test(
    msg,
  );
}

function dentalIntent(msg: string): boolean {
  return /\b(tand|tandarts|gebit|kies|controle|bleken|mond|vulling|ortho)\b/i.test(
    msg,
  );
}

export async function POST(req: Request) {
  let body: {
    message?: string;
    landing_demo?: boolean;
    context?: {
      branche?: string;
      prijsrange?: string;
      vehicle?: RdwVehicleSnapshot;
    };
  };
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
  const landingDemo = Boolean(body.landing_demo);
  const vehicle = body.context?.vehicle;

  if (!openai) {
    return NextResponse.json(
      { reply: "", resultTitle: "", valueLine: "", error: "Geen AI" },
      { status: 503 },
    );
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const rdwBlock =
    landingDemo && vehicle
      ? `
RDW-gegevens (betrouwbaar — gebruik ze, verzin niets bij):
${vehiclePromptBlock(vehicle)}
`
      : "";

  const autoI = automotiveIntent(message) || Boolean(vehicle);
  const beautyI = beautyIntent(message);
  const dentalI = dentalIntent(message);

  const sectorLines: string[] = [];
  if (autoI) {
    sectorLines.push(
      "Automotive / garage: antwoord als receptie van een werkplaats. Herhaal de klacht kort, gebruik RDW als die er is, en werk naar inspectie of montage-afspraak. Kenteken vragen als RDW ontbreekt maar wel nodig is.",
    );
  }
  if (beautyI) {
    sectorLines.push(
      "Kapper / salon: vriendelijk en concreet; vraag naar gewenste behandeling en tijd; geen medische claims.",
    );
  }
  if (dentalI) {
    sectorLines.push(
      "Tandarts / mond: empathisch bij pijn of spoed; vraag kort naar beschikbaarheid; geen diagnose geven — wel afspraak of terugbelafspraak.",
    );
  }
  const sectorBlock =
    landingDemo && sectorLines.length > 0
      ? `\nSector (alleen wat past bij het bericht):\n${sectorLines.map((s) => `- ${s}`).join("\n")}\n`
      : "";

  const landingRules = landingDemo
    ? `
Homepage-demo: korte, natuurlijke zinnen in het Nederlands (meestal 2–5 zinnen).
Je vertegenwoordigt een lokaal bedrijf met afspraken — dat kan overal op lijken: kapper, praktijk, garage, monteur, schoonmaak, ambacht. Herken wat de klant vraagt en blijf daarbij; geen vakjargon uit een andere sector "pushen".
Waarde voor de klant: snelle duidelijkheid, geen gemiste kans — ook als de agenda vol zit, bied een eerlijk alternatief (andere dag, korte callback, wachtlijst).
${rdwBlock}${sectorBlock}
Als geen van de sector-hints past: blijf een warme, efficiënte lokale dienstverlener; één duidelijke volgende stap.
`
    : "";

  const extraServicesRule = landingDemo
    ? `Voeg geen random extra diensten toe die de klant niet noemt. Wel mag je logisch doorvragen binnen dezelfde aanvraag (bijv. tijd bij kapper, spoed bij pijn).`
    : `Noem geen banden, APK, remmen of andere diensten die de klant niet genoemd heeft.`;

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.35,
    max_tokens: 340,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Je antwoordt namens een Nederlands ${branche}-bedrijf. Schrijf zoals een ondernemer: kort, duidelijk, geen moeilijke woorden, geen marketingtaal.${landingRules}
Als het bericht alleen een begroeting is (bijv. "hoi", "hallo", "hey") zonder concrete vraag: groet vriendelijk en vraag één zin wat ze nodig hebben. Geen afspraaktijden, geen "morgen om …", geen prijs in reply. Zet resultTitle op "Intake" en valueLine op "—".
Als wél een concrete vraag of dienst genoemd wordt: stel hooguit twee gerichte vragen en werk toe naar een afspraak of duidelijke volgende stap.
${extraServicesRule}
Zeg nooit dat je een AI of assistent bent. Typische prijsrange voor valueLine (alleen als het past bij de vraag): ${prijsrange}.
Antwoord alleen met JSON met keys: reply (string), resultTitle (string), valueLine (string).`,
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
