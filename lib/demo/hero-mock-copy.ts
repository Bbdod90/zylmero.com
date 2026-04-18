import { LANDING_DEMO_ROLES } from "@/lib/demo/landing-demo-roles";
import type { NicheDefinition, NicheId } from "@/lib/niches";
import { getNicheConfig } from "@/lib/niches";

export type HeroThread = {
  name: string;
  preview: string;
  value: string;
  hot: boolean;
};

export type HeroConversation = {
  threads: HeroThread[];
  customerMsg: string;
  replyMsg: string;
  autoLabel: string;
};

function fallbackConversation(cfg: NicheDefinition): HeroConversation {
  return {
    threads: [
      { name: `Klant · ${cfg.label}`, preview: "Afspraak of offerte — deze week?", value: "€150", hot: true },
      { name: "Aanvraag · spoed", preview: "Hoe snel kunnen jullie reageren?", value: "€95", hot: true },
      { name: "Offerte", preview: "Richtprijs voor mijn klus?", value: "€420", hot: false },
    ],
    customerMsg: `Hi — ik heb een vraag over jullie ${cfg.label.toLowerCase()}. Kunnen jullie me bellen of een moment voorstellen?`,
    replyMsg:
      "Hi — dank je voor je bericht. Mag ik kort weten wat je precies nodig hebt en wanneer het uitkomt? Dan plan ik een terugbelmoment of stuur ik opties.",
    autoLabel: "Jij (automatisch)",
  };
}

export function getHeroMockConversation(role: NicheId): HeroConversation {
  const cfg = getNicheConfig(role);

  switch (role) {
    case "general_services":
      return {
        threads: [
          { name: "Sophie · aanvraag", preview: "Kan ik volgende week langskomen?", value: "€185", hot: true },
          { name: "Daan · spoed", preview: "Hoe snel kunnen jullie?", value: "€95", hot: true },
          { name: "Yasmine · offerte", preview: "Kunnen jullie een richtprijs geven?", value: "€420", hot: false },
        ],
        customerMsg:
          "Hi — ik wil graag een afspraak maar het lukt niet online te boeken. Kunnen jullie vandaag nog tussen 14:00–16:00?",
        replyMsg:
          "Hi — dank je voor je bericht. Mag ik kort horen wat je nodig hebt en of je bij ons vaker komt? Dan zoek ik direct een plek tussen 14:00–16:00 of bel ik je zo terug.",
        autoLabel: "Jij (automatisch)",
      };
    case "hair_salon":
      return {
        threads: [
          { name: "Sophie · kleur", preview: "Balayage + knippen — donderdag of zaterdag?", value: "€185", hot: true },
          { name: "Noah · heren", preview: "Fade + baard — vrijdagmiddag?", value: "€62", hot: true },
          { name: "Eva · highlights", preview: "Highlights op donker haar — volgende week?", value: "€210", hot: false },
        ],
        customerMsg:
          "Hi — ik wil volgende week knippen met kleur. Hebben jullie donderdag rond 16:00 nog iets vrij?",
        replyMsg:
          "Hi — leuk dat je langskomt. Welke kleurbehandeling had je in gedachten en hoe lang is je haar ongeveer? Dan pas ik de tijd aan en stuur ik opties voor donderdag rond 16:00.",
        autoLabel: "Salon (automatisch)",
      };
    case "dentist":
      return {
        threads: [
          { name: "Daan · spoed", preview: "Pijn linksonder — dit weekend iemand vrij?", value: "€95", hot: true },
          { name: "Lisa · controle", preview: "Half jaarlijks — voorkeur dinsdagochtend", value: "€85", hot: false },
          { name: "Tom · cosmetisch", preview: "Bleken — eerst intake?", value: "€220", hot: false },
        ],
        customerMsg:
          "Hi — ik heb pijn aan een kies en het lukt niet om online te boeken. Kunnen jullie vandaag nog tussen 14:00–16:00?",
        replyMsg:
          "Hi — dat is vervelend. Mag ik je geboortedatum en of je bij ons patiënt bent? Dan zoek ik direct een plek tussen 14:00–16:00 of bel ik je zo terug.",
        autoLabel: "Praktijk (automatisch)",
      };
    case "garage":
      return {
        threads: [
          { name: "Yasmine · banden", preview: "Winterbanden + uitlijnen — kenteken bekend", value: "€420", hot: true },
          { name: "Rick · APK", preview: "APK volgende week — leenauto nodig?", value: "€89", hot: true },
          { name: "Mila · remmen", preview: "Piepend geluid voor — inspectie?", value: "€240", hot: false },
        ],
        customerMsg:
          "Hi — ik hoor een tik bij het remmen en wil volgende week langs. Kunnen jullie inspectie inplannen en is er leenvervoer?",
        replyMsg:
          "Hi — helder. Mag ik je kenteken en kilometerstand? Dan plannen we inspectie en kijken we naar leenvervoer als dat vrij is.",
        autoLabel: "Garage (automatisch)",
      };
    case "plumber":
      return {
        threads: [
          { name: "Sam · lekkage", preview: "Douche lekt — vandaag nog monteur?", value: "€180", hot: true },
          { name: "Iris · CV", preview: "Ketel storing code E1 — spoed?", value: "€220", hot: true },
          { name: "Bas · keuken", preview: "Nieuwe kraan laten plaatsen — offerte?", value: "€340", hot: false },
        ],
        customerMsg:
          "Hi — er lekt water onder de douchebak. Kunnen jullie vandaag of morgenochtend iemand sturen? Ik zit in 3511.",
        replyMsg:
          "Hi — dat pakken we graag op. Is het nu actief lekwater en is de hoofdkraan dicht? Dan plan ik spoed of morgenochtend en geef ik een tijdvak door.",
        autoLabel: "Service (automatisch)",
      };
    case "cleaning":
      return {
        threads: [
          { name: "Kantoor Zuid", preview: "Wekelijks schoonmaak — startdatum?", value: "€890", hot: true },
          { name: "Fam. De Vries", preview: "Eenmalige dieptereiniging — zaterdag?", value: "€240", hot: false },
          { name: "Studio 12", preview: "Ramen + vloer — offerte per m²?", value: "€180", hot: false },
        ],
        customerMsg:
          "Hi — we zoeken iemand voor wekelijkse schoonmaak op kantoor (ca. 120 m²). Kunnen jullie volgende week langs kijken voor een offerte?",
        replyMsg:
          "Hi — prima. Welke dagen en dagdelen komen uit en is er parkeergelegenheid? Dan plan ik een korte rondleiding en stuur ik een voorstel.",
        autoLabel: "Planning (automatisch)",
      };
    case "electrician":
      return {
        threads: [
          { name: "Jeroen · laadpaal", preview: "11 kW thuis — inspectie groepenkast?", value: "€1.850", hot: true },
          { name: "Anne · storing", preview: "Groep eruit — geen stroom keuken", value: "€120", hot: true },
          { name: "CV · renovatie", preview: "Nieuwe groepen bij keuken", value: "€640", hot: false },
        ],
        customerMsg:
          "Hi — in de keuken valt steeds een groep uit als de oven en kookplaat tegelijk aan staan. Kunnen jullie dat nakijken?",
        replyMsg:
          "Hi — dat wil je laten uitmeten. Mag ik weten of het om een bestaande meterkast gaat en wanneer je thuis bent? Dan plan ik een monteur.",
        autoLabel: "Elektra (automatisch)",
      };
    case "coach":
      return {
        threads: [
          { name: "Julia · intake", preview: "Loopbaan coaching — kennismaking?", value: "€120", hot: true },
          { name: "Mark · team", preview: "Workshop leiderschap — Q3?", value: "€2.400", hot: false },
          { name: "Sanne · traject", preview: "6 sessies vitaliteit — pakket?", value: "€890", hot: false },
        ],
        customerMsg:
          "Hi — ik wil graag een kennismakingsgesprek voor coaching rondom stress op werk. Wanneer hebben jullie ruimte?",
        replyMsg:
          "Hi — leuk dat je contact zoekt. Wat is je belangrijkste doel voor de komende 3 maanden? Dan stuur ik beschikbare momenten voor een korte intake.",
        autoLabel: "Planning (automatisch)",
      };
    default:
      return fallbackConversation(cfg);
  }
}

export function heroSubtitleForRole(role: NicheId, brandName: string): string {
  const cfg = getNicheConfig(role);
  return `${cfg.description} ${brandName} antwoordt direct, kwalificeert kort en helpt afspraken plannen — jij blijft op de klus.`;
}

export function getLandingChatHints(role: NicheId): {
  sectionTitle: string;
  sectionSub: string;
  emptyExamples: string;
  inputPlaceholder: string;
  quickPrompts: string[];
} {
  const cfg = getNicheConfig(role);
  const short =
    LANDING_DEMO_ROLES.find((r) => r.id === role)?.label ??
    cfg.label.replace(/\s*\/.*$/, "").trim();

  const EXAMPLES: Partial<Record<NicheId, string>> = {
    general_services:
      "Typ een kort bericht zoals je klant zou doen — tijd, spoed, of een vraag.",
    hair_salon:
      "Zet erin wat je wilt laten doen en wanneer het ongeveer past — kleur, knippen, baard, of alleen een vraag over beschikbaarheid.",
    dentist:
      "Noem wat er speelt: spoed en pijn, een controle, of cosmetisch — hoe concreter, hoe strakker het antwoord.",
    garage:
      "Combineer gerust klacht of onderhoud met je kenteken of een gewenste dag — APK, banden, geluid: noem wat van toepassing is.",
    plumber:
      "Beschrijf kort waar het lekt of wat er misgaat en of het haast heeft — adres of wijk helpt om een monteur te plannen.",
    cleaning:
      "Vertel wat voor ruimte het is en hoe vaak je schoonmaak zoekt — kantoor, eenmalig, of een vraag over tarief.",
    electrician:
      "Schrijf wat er uitvalt of wat je wilt laten doen — groepenkast, laadpaal, of iets dat niet veilig voelt.",
    coach:
      "Noem je doel in één zin en of je een kennismaking zoekt — traject, losse sessies, of alleen even sparren.",
    consultancy:
      "Schrijf wat je wilt bespreken — traject, second opinion, of een korte sparring — en welke termijn je voor ogen hebt.",
    trade_contractor:
      "Noem je klus, locatie en of je spoed of alleen een offerte wilt — hoe concreter, hoe beter de planning.",
    realtor:
      "Noem wat je zoekt — bezichtiging, waardebepaling, verkoop — en je voorkeur voor moment of wijk.",
    other:
      "Typ wat een klant zou typen: afspraak, prijs, spoed, of een korte vraag over beschikbaarheid.",
  };

  const PLACEHOLDERS: Partial<Record<NicheId, string>> = {
    general_services: "Stel je vraag of vraag een afspraak…",
    hair_salon: "Bijv. knippen, kleur, baard, tijd…",
    dentist: "Bijv. pijn, controle, bleken…",
    garage: "Bijv. APK, banden, geluid, kenteken…",
    plumber: "Bijv. lekkage, CV, sanitair…",
    cleaning: "Bijv. kantoor, eenmalig, frequentie…",
    electrician: "Bijv. storing, laadpaal, groepenkast…",
    coach: "Bijv. intake, doel, beschikbaarheid…",
    consultancy: "Bijv. traject, second opinion, termijn…",
    trade_contractor: "Bijv. offerte, startdatum, spoed…",
    realtor: "Bijv. bezichtiging, waardebepaling, verkoop…",
    other: "Bijv. afspraak, prijs, beschikbaarheid…",
  };

  const QUICK_PROMPTS: Partial<Record<NicheId, readonly string[]>> = {
    general_services: [
      "Ik wil volgende week een afspraak — wat past?",
      "Wat kost een kleine klus ongeveer?",
      "Kan iemand vandaag nog langskomen?",
    ],
    garage: [
      "APK volgende week — is er leenvervoer?",
      "Ik hoor tikken bij het remmen — inspectie graag.",
      "Winterbanden monteren — kenteken staat klaar.",
    ],
    hair_salon: [
      "Knippen + kleur donderdag rond 16:00 — lukt dat?",
      "Fade en baard vrijdagmiddag nog een plekje?",
      "Highlights — hoe lang moet ik rekenen?",
    ],
    dentist: [
      "Pijn linksonder — kan het vandaag nog?",
      "Half jaarlijkse controle — liever dinsdagochtend.",
      "Bleken — eerst intake of kan het direct?",
    ],
    plumber: [
      "Lekkage onder de douche — vandaag nog monteur?",
      "CV geeft een storingscode — spoed?",
      "Nieuwe kraan in de keuken — offerte graag.",
    ],
    electrician: [
      "Groep valt uit als oven + kookplaat aan staan.",
      "Laadpaal 11 kW thuis — inspectie meterkast nodig?",
      "Meterkast uitbreiden bij keukenrenovatie.",
    ],
    cleaning: [
      "Wekelijks kantoor ca. 120 m² — start volgende week?",
      "Eenmalige dieptereiniging zaterdag — lukt dat?",
      "Offerte ramen + vloer op m² graag.",
    ],
    coach: [
      "Kennismaking rond stress op werk — wanneer ruimte?",
      "Workshop leiderschap voor een klein team — indicatie?",
      "6 sessies vitaliteit — hoe ziet zo’n traject eruit?",
    ],
    consultancy: [
      "Kort adviesgesprek deze maand — wat kost dat?",
      "Second opinion op ons IT-plan — kunnen jullie dat?",
      "Offerte voor een traject van 8 weken.",
    ],
    trade_contractor: [
      "Offerte badkamer compleet renoveren — wanneer start?",
      "Lekkage plat dak — spoedinspectie deze week?",
      "Kunnen jullie montage volgende maand inplannen?",
    ],
    realtor: [
      "Bezichtiging dit weekend — nog een slot vrij?",
      "Waardebepaling voor verkoop — hoe werkt dat?",
      "Wat vragen jullie aan courtage bij verkoop?",
    ],
    other: [
      "Ik wil een afspraak — wat hebben jullie vrij?",
      "Wat zijn jullie tarieven voor een standaardklus?",
      "Ik heb spoed — kan ik vandaag nog terecht?",
    ],
  };

  const quickFallback = [
    "Ik wil een afspraak — wat past deze week?",
    "Korte vraag over prijs en beschikbaarheid.",
    "Hoe snel kan iemand reageren?",
  ] as const;

  return {
    sectionTitle: "Proef het zelf: zo voelt snelle opvolging",
    sectionSub: `Kies je branche (${short}), tik een voorbeeld aan of typ zelf — je ziet meteen een eerste antwoord en wat de aanvraag ongeveer waard kan zijn.`,
    emptyExamples: EXAMPLES[role] ?? EXAMPLES_FALLBACK,
    inputPlaceholder: PLACEHOLDERS[role] ?? "Typ je vraag of afspraak…",
    quickPrompts: [...(QUICK_PROMPTS[role] ?? quickFallback)],
  };
}

const EXAMPLES_FALLBACK =
  "Eén kort bericht volstaat — denk aan planning, prijs of spoed, zoals een echte klant zou typen.";
