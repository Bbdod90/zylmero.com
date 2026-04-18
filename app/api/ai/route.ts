import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { RdwVehicleSnapshot } from "@/lib/rdw/kenteken";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { formatLandingDemoKnowledgeBlock } from "@/lib/demo/landing-demo-knowledge";
import { getNicheConfig, isNicheId, type NicheId } from "@/lib/niches";

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

/** Lekkage aan huis / sanitair — niet verwarren met banden / auto. */
function plumbingIntent(msg: string): boolean {
  const t = msg.toLowerCase();
  const tireOrCarLeak =
    /\b(lekkage|lek)\b/i.test(t) &&
    /\b(band|wiel|voorband|achterband|motor|olie|koelvloeistof)\b/i.test(t);
  if (tireOrCarLeak) return false;
  if (/\b(douche|badkamer|keuken|loodgieter|riool|sanitair|wasbak|spoelbak|wc\b|toilet|vocht)\b/i.test(t))
    return true;
  if (/\blekkage\b/i.test(t)) return true;
  return false;
}

function automotiveIntent(msg: string): boolean {
  const t = msg.toLowerCase();
  if (plumbingIntent(t)) return false;
  if (/\b(lekkage|lek)\b/i.test(t) && /\b(band|wiel|voorband|achterband)\b/i.test(t)) return true;
  return /\b(band|banden|apk|kenteken|auto|voorband|achterband|voertuig|winterband|zomerband|wiel\b|remmen|motor|achterlicht|koplamp|mistlamp|remlicht|stadslicht|verlichting|ruit|ruiten|glas|lampje|\blamp\b|carrosserie|deuk|bumper|uitlaat|accu|startmotor)\b/i.test(
    t,
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

/** Laadpaal / EV-laadinfrastructuur (elektricien-demo), niet verwarren met automotive banden/APK. */
function electricianEvIntent(msg: string): boolean {
  return /\b(laadpaal|laadpalen|wallbox|opladen|oplaad|thuislader|ev\b|elektrisch\s+auto|elektrische\s+auto|laadstation)\b/i.test(
    msg.toLowerCase(),
  );
}

function confirmationFollowUpIntent(msg: string): boolean {
  const t = msg.toLowerCase();
  return /\b(doen\s+jullie|doen\s+jullie\s+dat|kunnen\s+jullie(\s+dat)?|kan\s+dat|is\s+dat\s+mogelijk|doen\s+jullie\s+ook|maken\s+jullie\s+dat|regelen\s+jullie\s+dat|is\s+dat\s+iets\s+voor\s+jullie)\b/i.test(
    t,
  );
}

export async function POST(req: Request) {
  let body: {
    message?: string;
    landing_demo?: boolean;
    /** Homepage: gekozen demo-rol → persona uit niche-config. */
    demo_niche?: string;
    /** Eerdere beurten (zonder het laatste bericht); het laatste staat in `message`. */
    chat_history?: { role: "user" | "assistant"; content: string }[];
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
  const demoNicheRaw = body.demo_niche;
  const demoNiche: NicheId | null =
    typeof demoNicheRaw === "string" && isNicheId(demoNicheRaw.trim())
      ? (demoNicheRaw.trim() as NicheId)
      : null;

  let prijsrangeResolved = prijsrange;
  let identityIntro = `Je antwoordt namens een Nederlands ${branche}-bedrijf.`;
  let personaBlock = "";

  let demoKnowledgeBlock = "";
  if (landingDemo && demoNiche) {
    const cfg = getNicheConfig(demoNiche);
    prijsrangeResolved = cfg.defaultPricingHints?.slice(0, 320) || prijsrange;
    demoKnowledgeBlock = formatLandingDemoKnowledgeBlock(cfg);
    personaBlock = `
VASTE DEMO-ROL (verplicht volgen — dit ben jij):
- Type zaak: ${cfg.label}
- Profiel: ${cfg.description}
- Werkwijze: ${cfg.ai.contextExtra}
- Toon: ${cfg.defaultTone}
- Antwoordstijl: ${cfg.defaultReplyStyle}
- Intake-vragen (alleen als inspiratie — kies er max. één die past; nooit allemaal in één antwoord achter elkaar): ${cfg.ai.qualifyingQuestions.join(" · ")}
Als de klant iets vraagt dat duidelijk bij een ander vak hoort dan deze rol: wees vriendelijk, geen valse expertise, kort doorverwijzen of algemene afspraak voor intake.

BEDRIJFSKENNIS (enige bron voor feiten over jullie zaak in deze demo — gebruik dit volledig):
${demoKnowledgeBlock}

ANTWOORDREGELS OP BASIS VAN KENNIS:
- Vragen over diensten, prijsindicaties, FAQ, werkwijze of "wat doen jullie": antwoord concreet met bovenstaande info. Mag uitgebreider dan één zin als de vraag dat vraagt.
- Staat iets niet in de bedrijfskennis (bijv. exacte openingstijden, adres, volledige prijslijst): zeg eerlijk dat je dat in dit bericht niet hebt staan en bied bellen, terugbelafspraak of een voorkeursdag/tijdvak — verzin geen fictieve tijden, adressen of tarieven.
- Gebruik prijzen alleen zoals in de kennis (richting/indicatie); waar "…" of placeholder staat: noem dat het definitieve tarief na inspectie of op afspraak is.

VERVOLG & BEVESTIGING (zeer belangrijk):
- Herhaal je vorige antwoord nooit letterlijk of quasi-identiek. Als de klant een korte vervolgvraag stelt ("doen jullie dat?", "kan dat?", "maken jullie dat ook?"): antwoord eerst inhoudelijk ja/nee op basis van de dienstenlijst hierboven, in nieuwe zinnen — niet opnieuw dezelfde alinea met alle intake-vragen.
- Vraagt de klant of jullie iets doen dat expliciet in de dienstenlijst staat (bijv. "Laadpaal"): zeg enthousiast dat jullie dat doen en koppel kort aan die dienst; daarna pas 1–2 relevante vervolgvragen (planning, week, situatie) — geen irrelevante vragen (bijv. geen vonken/stroomuitval tenzij de klant een storing meldt of het om een storing gaat).
- De klant noemde al een onderwerp (bijv. laadpaal): sluit daar inhoudelijk op aan; stel niet opnieuw de volledige generieke intake als je dat net al deed.

CONCRETE KLACHT / ONDERDEEL (zeer belangrijk — geldt altijd):
- Noemt de klant iets specifieks (kapot achterlicht, lekke band, pijn, lekkage, enz.): begin met één korte empathische zin; bevestig dat jullie dit soort werk doen; stel daarna max. 1–2 gerichte vragen die daar logisch op volgen.
- Verboden: een standaardzin als "We doen o.a. …" waarna je meteen de hele diensten-bullets plus alle intake-vragen achter elkaar plakt. Dat is brochuretaal en voelt niet als een echt gesprek.
- Je schrijft als een echte medewerker aan de telefoon / WhatsApp — inhoudelijk zoals ChatGPT: bij een inhoudelijke vraag nuttig uitleggen uit VAKKENNIS en context; bij een korte vraag niet opblazen.

VARIATIE (zeer belangrijk):
- Herhaal nooit dezelfde openingszin of dezelfde paragraafstructuur als in je vorige bericht — andere woorden, andere invalshoek.
- Twee klanten met vergelijkbare vragen krijgen niet hetzelfde bloktekst; pas voorbeelden en volgorde aan.
`;
    identityIntro = `Je bent de receptionist / planner van een ${cfg.label.toLowerCase()}.`;
  }
  const rawHistory = Array.isArray(body.chat_history) ? body.chat_history : [];

  const historySanitized = rawHistory
    .filter(
      (h) =>
        h &&
        (h.role === "user" || h.role === "assistant") &&
        typeof h.content === "string" &&
        h.content.trim().length > 0,
    )
    .slice(-24)
    .map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content.trim().slice(0, 2000),
    }));

  const fullTextForIntent = [
    ...historySanitized.map((h) => h.content),
    message,
  ].join("\n");

  if (!openai) {
    return NextResponse.json(
      {
        reply: "",
        resultTitle: "",
        valueLine: "",
        error: "Geen AI",
        hint: "Zet OPENAI_API_KEY in .env.local (zie .env.example) en herstart de server.",
      },
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

  const autoI = automotiveIntent(fullTextForIntent) || Boolean(vehicle);
  const plumbingI = plumbingIntent(fullTextForIntent);
  const beautyI = beautyIntent(fullTextForIntent);
  const dentalI = dentalIntent(fullTextForIntent);

  const sectorLines: string[] = [];
  if (plumbingI) {
    sectorLines.push(
      "Loodgieter / sanitair: lek of lekkage in huis (douche, badkamer, keuken). Stel geen autovragen. Bied kort een monteur-afspraak aan, vraag naar spoed, postcode/wijk of tijdvak (ochtend/middag). Herhaal niet dezelfde vage intake als de klant al 'lekkage' + locatie (bv. douche) noemde.",
    );
  }
  if (autoI && !plumbingI) {
    sectorLines.push(
      "Automotive / garage: antwoord als receptie van een werkplaats. Eerst begrip bij schade; herhaal het onderdeel dat de klant noemt (bijv. rechts achterlicht). Gebruik RDW-context als die er is (merk/handelsbenaming), zonder te doen alsof je live op internet zocht. Zonder kenteken: vraag er één om het juiste onderdeel te koppelen; werk daarna naar inspectie of montage. Geen irrelevante diensten-opsomming (intake/planning tenzij de klant daarom vraagt).",
    );
  }
  if (
    landingDemo &&
    demoNiche === "general_services" &&
    autoI &&
    !plumbingI
  ) {
    sectorLines.push(
      "Let op: de demo-rol heet \"Dienstverlener\" met algemene planning-diensten in de kennis — maar de klant schrijft nu over een auto/reparatie. Behandel dit als garage/werkplaats. Noem die generieke planning-diensten niet als flap; dat past niet bij een kapot licht.",
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
  if (
    landingDemo &&
    demoNiche === "electrician" &&
    (electricianEvIntent(fullTextForIntent) || confirmationFollowUpIntent(message))
  ) {
    sectorLines.push(
      "Elektricien — laadpaal / wallbox / EV-thuislader: als 'Laadpaal' (of vergelijkbaar) in de bedrijfskennis staat, bevestig eerst dat jullie dat doen en benoem het kort; daarna praktische vervolgstap (inspectie/planning, gewenste week). Herhaal niet je vorige standaardintake als de klant alleen bevestigt. Geen autobanden/APK-vragen.",
    );
  }
  const sectorBlock =
    landingDemo && sectorLines.length > 0
      ? `\nSector (alleen wat past bij het gesprek):\n${sectorLines.map((s) => `- ${s}`).join("\n")}\n`
      : "";

  const lastAssistant =
    landingDemo && historySanitized.length > 0
      ? [...historySanitized].reverse().find((h) => h.role === "assistant")
      : undefined;

  const antiRepeatBlock =
    landingDemo && demoNiche && lastAssistant?.content
      ? `
Laatste bericht van jou aan deze klant (NIET herhalen; de klant heeft dit al gezien — antwoord met nieuwe woorden en focus op wat de nieuwe vraag vraagt):
"""
${lastAssistant.content.trim().slice(0, 1200)}
"""
`
      : "";

  const historyNote =
    landingDemo && historySanitized.length > 0
      ? `
Er is eerdere chatgeschiedenis — lees die mee. Herhaal geen identieke of bijna-identieke tekst als je vorige antwoord.
Als de klant specifieker wordt of een bevestiging vraagt: reageer op dat nieuwe detail (bijv. eerst laadpaal, daarna "doen jullie dat?" → eerst ja + kort waarom, dan planning).
`
      : "";

  const landingRules = landingDemo
    ? demoNiche
      ? `
Homepage-demo: natuurlijke zinnen in het Nederlands — kort bij een simpele intake, iets uitgebreider als de klant een inhoudelijke vraag stelt (prijs, diensten, werkwijze).
Blijf in de gekozen demo-rol; antwoord alsof je daar werkt. Als sector-hint (bijv. automotive) duidelijk afwijkt van de niche-labeltekst, volg de sector-hint voor toon en inhoud — zonder hard te zeggen dat je van rol wisselt.
Waarde: snelle duidelijkheid — concrete afspraak, tijdvak of duidelijke volgende stap; op informerende vragen gewoon inhoudelijk antwoord binnen de bedrijfskennis.
${antiRepeatBlock}${historyNote}
${rdwBlock}${sectorBlock}
`
      : `
Homepage-demo: korte, natuurlijke zinnen in het Nederlands (meestal 2–5 zinnen).
Je vertegenwoordigt een lokaal bedrijf met afspraken — dat kan overal op lijken: kapper, praktijk, garage, monteur, schoonmaak, ambacht. Herken wat de klant vraagt en blijf daarbij; geen vakjargon uit een andere sector "pushen".
Waarde voor de klant: snelle duidelijkheid — ook als de agenda vol zit, bied een eerlijk alternatief (andere dag, korte callback, wachtlijst).
${historyNote}
${rdwBlock}${sectorBlock}
Als geen sector-hint past: blijf een warme, efficiënte lokale dienstverlener; één duidelijke volgende stap.
`
    : "";

  const extraServicesRule =
    landingDemo && demoNiche
      ? `Diensten noemen: alleen uit de bedrijfskennis hierboven of wat de klant zelf noemt. Mag je wél alle diensten uit de kennis uitleggen als de klant daarom vraagt. Geen diensten uit andere branches verzinnen. Logisch doorvragen binnen dezelfde aanvraag blijft oké (tijd, spoed, locatie).`
      : landingDemo
        ? `Voeg geen random extra diensten toe die de klant niet noemt. Wel mag je logisch doorvragen binnen dezelfde aanvraag (bijv. tijd bij kapper, spoed bij pijn).`
        : `Noem geen banden, APK, remmen of andere diensten die de klant niet genoemd heeft.`;

  const userFacingMessages: ChatCompletionMessageParam[] = [];
  for (const h of historySanitized) {
    userFacingMessages.push({
      role: h.role,
      content: h.content,
    });
  }
  userFacingMessages.push({ role: "user", content: message });

  const completion = await openai.chat.completions.create({
    model,
    temperature: landingDemo && demoNiche ? 0.72 : 0.35,
    max_tokens: landingDemo && demoNiche ? 900 : 380,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `${
          landingDemo && demoNiche
            ? `${identityIntro} Antwoord natuurlijk en inhoudelijk sterk in het Nederlands — vergelijkbaar met ChatGPT in dit vak: bij een inhoudelijke vraag mag je gerust meerdere zinnen en nuttige nuance gebruiken (opties, veiligheid, planning); bij alleen "hoi" of een minimale begroeting blijf je kort. Geen marketingtaal. Varieer telkens formulering en structuur — geen vast sjabloon per bericht.`
            : `${identityIntro} Schrijf zoals een ondernemer: kort, duidelijk, geen moeilijke woorden, geen marketingtaal.`
        }${personaBlock}${landingRules}
Als het laatste bericht alleen een begroeting is (bijv. "hoi", "hallo", "hey") zonder concrete vraag én er is geen eerdere context: groet vriendelijk en vraag één zin wat ze nodig hebben. Geen afspraaktijden, geen "morgen om …", geen prijs in reply. Zet resultTitle op "Intake" en valueLine op "—".
Als wél een concrete vraag of klacht genoemd wordt: bij een inhoudelijke vervolgvraag eerst antwoord geven (ja/nee/uitleg), niet opnieuw hetzelfde intake-blok. Anders: hooguit één gerichte vervolgvraag als iets echt ontbreekt; zo niet, werk naar afspraak of tijdvoorstel. Herhaal nooit je vorige antwoord letterlijk.
${extraServicesRule}
Zeg nooit dat je een AI of assistent bent. Typische prijsrange voor valueLine (alleen als het past bij de vraag): ${prijsrangeResolved}.
Antwoord alleen met JSON met keys: reply (string), resultTitle (string), valueLine (string).`,
      },
      ...userFacingMessages,
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
        valueLine: parsed.valueLine || prijsrangeResolved,
      });
    }
  } catch {
    /* parse text fallback */
  }

  return NextResponse.json({
    reply: raw || "Dank je — wanneer komt het uit om langs te komen?",
    resultTitle: "Afspraak voorgesteld",
    valueLine: prijsrangeResolved,
  });
}
