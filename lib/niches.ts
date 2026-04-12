/**
 * Centrale multi-niche configuratie — één plek om verticale content en AI-gedrag te beheren.
 * Nieuwe branche: voeg id toe aan NicheId, vul NICHE_CATALOG, en kies optie in onboarding.
 */

/** Standaard: universeel (niet alleen garage) — demo en anonieme rondleiding. */
export const DEMO_NICHE_DEFAULT = "general_services" as const;

export const NICHE_COOKIE = "zm_demo_niche";

export const NICHE_OPTION_IDS = [
  "general_services",
  "consultancy",
  "trade_contractor",
  "garage",
  "hair_salon",
  "dentist",
  "plumber",
  "electrician",
  "cleaning",
  "realtor",
  "coach",
  "other",
] as const;

export type NicheId = (typeof NICHE_OPTION_IDS)[number];

export type NicheFieldType = "text" | "textarea";

export interface NicheOnboardingField {
  name: string;
  label: string;
  type: NicheFieldType;
  placeholder?: string;
}

export interface NicheDefinition {
  id: NicheId;
  /** Korte label in UI */
  label: string;
  /** Langere beschrijving */
  description: string;
  /** Voorbeelddiensten (één per regel in textarea) */
  defaultServices: string[];
  defaultPricingHints: string;
  defaultFaqTemplate: string;
  defaultTone: string;
  defaultReplyStyle: string;
  onboardingFields: NicheOnboardingField[];
  ai: {
    /** Extra regels in business-context voor alle prompts */
    contextExtra: string;
    /** Standaardvragen die de AI kan gebruiken om te kwalificeren */
    qualifyingQuestions: string[];
    /** System prompt voor antwoord-suggesties */
    replySystemPersona: string;
    /** User prompt aanvulling voor samenvatten */
    summarizeAnalystHint: string;
    /** Extra instructies bij offerte-JSON */
    quoteInstructions: string;
    /** System voor slimme opvolging */
    followUpSystemPersona: string;
  };
  quote: {
    /** Hoe regels te structureren */
    lineItemGuidance: string;
  };
}

/** Partial merge voor `def()` — geneste `ai` en `quote` mogen gedeeltelijk zijn. */
export type NicheDefinitionPatch = Omit<
  Partial<NicheDefinition>,
  "ai" | "quote" | "id" | "label" | "description"
> & {
  ai?: Partial<NicheDefinition["ai"]>;
  quote?: Partial<NicheDefinition["quote"]>;
};

const BASE_DEFAULT: Omit<NicheDefinition, "id" | "label" | "description"> = {
  defaultServices: ["Algemene dienstverlening"],
  defaultPricingHints: "Vermeld richtprijzen of uurtarieven (intern).",
  defaultFaqTemplate:
    "Hoe snel? || Afhankelijk van drukte, meestal binnen enkele werkdagen.\n\nSpoed? || Bel ons direct.",
  defaultTone: "Professioneel, warm, direct.",
  defaultReplyStyle:
    "Korte alinea's; altijd een concrete volgende stap (bellen, offerte, afspraak).",
  onboardingFields: [
    {
      name: "core_offer",
      label: "Wat bied je vooral aan?",
      type: "textarea",
      placeholder: "Kernaanbod in een paar zinnen.",
    },
  ],
  ai: {
    contextExtra: "",
    qualifyingQuestions: [
      "Wat is je vraag precies?",
      "Wanneer wil je dit laten doen?",
    ],
    replySystemPersona:
      "Je bent een ervaren verkoper bij een lokaal servicebedrijf: menselijk, kort, geen chatbot-taal.",
    summarizeAnalystHint:
      "Je bent een sales analyst: focus op omzet, snelheid en concrete vervolgstappen voor het team.",
    quoteInstructions:
      "Regels logisch groeperen (arbeid / materiaal / pakketten) met duidelijke omschrijvingen.",
    followUpSystemPersona:
      "Je schrijft korte, overtuigende opvolgberichten voor lokale servicebedrijven. Geen markdown.",
  },
  quote: {
    lineItemGuidance: "Per regel: omschrijving, aantal, stukprijs, regeltotaal.",
  },
};

function def(
  id: NicheId,
  label: string,
  description: string,
  patch: NicheDefinitionPatch,
): NicheDefinition {
  return {
    ...BASE_DEFAULT,
    id,
    label,
    description,
    defaultServices: patch.defaultServices ?? BASE_DEFAULT.defaultServices,
    defaultPricingHints: patch.defaultPricingHints ?? BASE_DEFAULT.defaultPricingHints,
    defaultFaqTemplate: patch.defaultFaqTemplate ?? BASE_DEFAULT.defaultFaqTemplate,
    defaultTone: patch.defaultTone ?? BASE_DEFAULT.defaultTone,
    defaultReplyStyle: patch.defaultReplyStyle ?? BASE_DEFAULT.defaultReplyStyle,
    onboardingFields: patch.onboardingFields ?? BASE_DEFAULT.onboardingFields,
    ai: { ...BASE_DEFAULT.ai, ...patch.ai },
    quote: { ...BASE_DEFAULT.quote, ...patch.quote },
  };
}

export const NICHE_CATALOG: Record<NicheId, NicheDefinition> = {
  garage: def("garage", "Garage / autobedrijf", "Voertuigen, APK, onderhoud en reparatie.", {
    defaultServices: ["APK", "Kleine en grote beurt", "Remmen", "Diagnose", "Airco-service"],
    defaultPricingHints: "APK €49–€89. Kleine beurt vanaf €189. Remblokken voor/achter indicatief €180–€320.",
    defaultFaqTemplate:
      "Hoe snel? || Meestal binnen 3–5 werkdagen.\n\nLeenauto? || Ja, mits beschikbaar.",
    onboardingFields: [
      {
        name: "vehicles",
        label: "Welke voertuigen bedien je?",
        type: "textarea",
        placeholder: "Personenauto's, bestelwagens, leasevloot…",
      },
      {
        name: "common_jobs",
        label: "Meest voorkomende klussen",
        type: "textarea",
        placeholder: "APK, remmen, distributie, airco…",
      },
    ],
    ai: {
      contextExtra:
        "Branche: automotive. Vraag waar nodig naar kenteken, kilometerstand en symptomen. Geen vaste prijs zonder inspectie.",
      qualifyingQuestions: [
        "Wat is het kenteken?",
        "Welk geluid of probleem hoor/merk je precies?",
        "Wanneer past een afspraak?",
      ],
      replySystemPersona:
        "Je bent een ervaren verkoper bij een lokale garage: direct, menselijk, korte zinnen. Geen prijsbeloftes zonder inspectie.",
      summarizeAnalystHint:
        "Je bent een sales analyst voor een werkplaats: denk in inspectie, onderdelen, arbeid en geboekte tijd.",
      quoteInstructions:
        "Structureer als automotive: arbeid (uren), onderdelen, kleine materialen, eventueel APK apart. BTW 21%.",
      followUpSystemPersona:
        "Je schrijft follow-ups voor een garage: richting inspectie, offerte of geboekt moment.",
    },
    quote: {
      lineItemGuidance:
        "Splits arbeid (Uren monteur) en onderdelen. Vermeld indien relevant APK als aparte regel.",
    },
  }),

  hair_salon: def(
    "hair_salon",
    "Kapper / salon",
    "Kapsalon, barbershop, beauty.",
    {
      defaultServices: ["Knippen", "Verven", "Föhnen / styling", "Baard", "Highlights"],
      defaultPricingHints: "Knippen dames/heren vanaf €… Kleuren p.p. vanaf €…",
      onboardingFields: [
        {
          name: "treatments",
          label: "Behandelingen die je aanbiedt",
          type: "textarea",
          placeholder: "Knippen, verven, extensions, hoofdhuid…",
        },
        {
          name: "timing",
          label: "Gemiddelde duur / planning",
          type: "textarea",
          placeholder: "Bv. kleur 90 min, knippen 45 min",
        },
      ],
      ai: {
        contextExtra:
          "Branche: kapsalon/salon. Vraag naar gewenste behandeling, haarlengte/kleurwens, en beschikbare datum.",
        qualifyingQuestions: [
          "Wat wil je laten doen met je haar (of baard)?",
          "Heb je kleurwensen of foto ter inspiratie?",
          "Welke dag/tijd past?",
        ],
        replySystemPersona:
          "Je bent een salon-professional in tekst: vriendelijk, stijlvol, kort. Geen medische claims.",
        quoteInstructions:
          "Regels per behandeling (knippen, verven, producten). Gebruik duidelijke salon-termen.",
      },
      quote: {
        lineItemGuidance: "Per behandeling een regel; producten apart vermelden indien nodig.",
      },
    },
  ),

  dentist: def("dentist", "Tandarts / zorg", "Mondzorg en aanverwante zorg.", {
    defaultServices: ["Controle", "Hygiëne", "Vullen", "Spoed", "Implantologie (informatief)"],
    defaultPricingHints: "Controle €… — noem dat prijzen pas na onderzoek definitief zijn.",
    onboardingFields: [
      {
        name: "care_types",
        label: "Soorten zorg / specialismen",
        type: "textarea",
        placeholder: "Algemene mondzorg, cosmetisch, angstbegeleiding…",
      },
    ],
    ai: {
      contextExtra:
        "Branche: zorg. Geen diagnose of behandelbelofte in chat; nodig uit voor onderzoek op de praktijk.",
      qualifyingQuestions: [
        "Waar heb je klachten (ongeveer)?",
        "Is er sprake van pijn of koorts?",
        "Wanneer kun je langskomen?",
      ],
      replySystemPersona:
        "Je bent een praktijkassistent in woord: empathisch, professioneel, voorzichtig met medische details.",
      quoteInstructions:
        "Conceptofferte: beschrijf onderzoek/consult en eventuele globale richting — geen medische garanties.",
    },
    quote: {
      lineItemGuidance: "Consult/onderzoek, hygiëne, eventueel vervolg als indicatie — geen medische claims.",
    },
  }),

  plumber: def(
    "plumber",
    "Loodgieter / installateur",
    "Loodgieterswerk, CV, sanitair.",
    {
      defaultServices: ["Lekkages", "Verstoppingen", "Sanitair vervangen", "CV-onderhoud"],
      defaultPricingHints: "Voorrijden €… uurtarief €… materiaal achteraf volgens bon.",
      onboardingFields: [
        {
          name: "job_types",
          label: "Soorten klussen",
          type: "textarea",
          placeholder: "Verwarming, leidingwerk, badkamer, dak…",
        },
        {
          name: "urgency_policy",
          label: "Spoed / avond/weekend",
          type: "textarea",
          placeholder: "Hoe ga je om met spoed? Toeslagen?",
        },
      ],
      ai: {
        contextExtra:
          "Branche: installatie/loodgieter. Vraag naar type probleem, urgentie, adresregio (niet volledig adres tenzij nodig), foto's.",
        qualifyingQuestions: [
          "Wat voor probleem heb je precies?",
          "Is het spoed (water schade)?",
          "Waar moeten we langskomen (wijk/stad)?",
        ],
        replySystemPersona:
          "Je bent een ervaren monteur in communicatie: helder, rustig, planmatig. Veiligheid eerst.",
        quoteInstructions:
          "Arbeid (uren), voorrijden, materiaal, eventuele onderdelen. Vermeld indicatief vs definitief na inspectie.",
      },
      quote: {
        lineItemGuidance: "Uurloon + voorrijden + materiaal als aparte regels.",
      },
    },
  ),

  electrician: def("electrician", "Elektricien", "Elektra-installaties en storingen.", {
    defaultServices: ["Groepenkast", "Laadpaal", "Storingen", "Renovatie"],
    defaultPricingHints: "Inspectie €… uurtarief €… nacalculatie materiaal.",
    onboardingFields: [
      {
        name: "scope",
        label: "Werkgebied / specialisaties",
        type: "textarea",
        placeholder: "Particulier, zakelijk, nieuwbouw…",
      },
    ],
    ai: {
      contextExtra:
        "Branche: elektrotechniek. Laadpalen/wallbox (thuislaadpaal) horen bij jullie standaardaanbod als 'Laadpaal' in de dienstenlijst staat — bevestig dat enthousiast en plan intake; geen onveilige DIY-adviezen. Bij storingen/vonken wél veiligheid eerst.",
      qualifyingQuestions: [
        "Is het nieuwbouw of een bestaande meterkast — en ongeveer welk vermogen (11/22 kW) denk je?",
        "Wat doet of laat de installatie niet (alleen relevant bij storing/renovatie)?",
        "Is er sprake van vonken of stroomuitval? (alleen als de klant een storing meldt)",
      ],
      quoteInstructions: "Arbeid, materialen (kabels, componenten), keuring indien relevant.",
    },
    quote: {
      lineItemGuidance: "Arbeid + materiaal + eventuele voorrij/inspectie.",
    },
  }),

  cleaning: def("cleaning", "Schoonmaakbedrijf", "Schoonmaak voor particulier en zakelijk.", {
    defaultServices: ["Eindschoonmaak", "Periodiek", "Kantoor", "Ramen"],
    defaultPricingHints: "Uurtarief €… of m²-pakketten.",
    onboardingFields: [
      {
        name: "packages",
        label: "Pakketten / frequentie",
        type: "textarea",
        placeholder: "Wekelijks, eenmalig, opleveren…",
      },
    ],
    ai: {
      contextExtra:
        "Branche: schoonmaak. Vraag naar oppervlakte, type object, frequentie en gewenste dagdeel.",
      qualifyingQuestions: [
        "Om welk type ruimte gaat het?",
        "Hoe vaak wil je schoonmaak?",
        "Waar ongeveer (regio)?",
      ],
      quoteInstructions: "Regels per type werk of pakket; uren × tarief of m² × tarief.",
    },
    quote: {
      lineItemGuidance: "Uren × tarief of vaste pakketregels + eventuele materialen.",
    },
  }),

  realtor: def("realtor", "Makelaar", "Vastgoedbemiddeling.", {
    defaultServices: ["Verkoop", "Aankoop", "Taxatie", "Verhuur"],
    defaultPricingHints: "Courtage % of vast tarief — conform wet- en regelgeving vermelden.",
    onboardingFields: [
      {
        name: "regions",
        label: "Werkgebied",
        type: "textarea",
        placeholder: "Steden/regio's waar je actief bent",
      },
    ],
    ai: {
      contextExtra:
        "Branche: makelaardij. Geen financieel advies; verwijs naar gesprek en documentatie.",
      qualifyingQuestions: [
        "Zoek je verkoop of aankoop?",
        "Welke regio?",
        "Wat is je tijdlijn ongeveer?",
      ],
      quoteInstructions: "Courtage of pakket in duidelijke posten; geen beloftes over verkoopprijs.",
    },
    quote: {
      lineItemGuidance: "Diensten (bemiddeling, fotografie, marketing) als aparte regels.",
    },
  }),

  coach: def("coach", "Coach / trainer", "Coaching en training.", {
    defaultServices: ["Individuele sessies", "Programma's", "Bedrijfstraining"],
    defaultPricingHints: "Sessie €… programma €…",
    onboardingFields: [
      {
        name: "niche_coaching",
        label: "Focus van je coaching",
        type: "textarea",
        placeholder: "Loopbaan, leiderschap, vitaliteit…",
      },
    ],
    ai: {
      contextExtra:
        "Branche: coaching. Geen therapie; verwijs bij acute problematiek. Vraag naar doel en beschikbaarheid.",
      qualifyingQuestions: [
        "Waar wil je aan werken?",
        "Individueel of team?",
        "Welke periode past?",
      ],
      quoteInstructions: "Sessies, trajecten, materialen — helder per regel.",
    },
    quote: {
      lineItemGuidance: "Per sessie of traject als aparte regel.",
    },
  }),

  general_services: def(
    "general_services",
    "Dienstverlener",
    "Voor elke lokale zaak met afspraken: van kapper tot praktijk tot monteur — snelle reactie en geen gemiste klanten.",
    {
      defaultServices: [
        "Intake en planning",
        "Afspraken en herinneringen",
        "Offerte of richtprijs",
        "Spoed of wachtlijst",
      ],
      onboardingFields: [
        {
          name: "service_area",
          label: "Werkgebied",
          type: "textarea",
          placeholder: "Regio's of segmenten",
        },
        {
          name: "differentiators",
          label: "Waarin onderscheid je je?",
          type: "textarea",
          placeholder: "USP's",
        },
      ],
      ai: {
        contextExtra:
          "Branche: lokale dienstverlening met afspraken (kan kapper, zorg, garage, ambacht zijn). Kwalificeer kort wat de klant wil, wanneer het uitkomt, en of het spoed is. Geen prijs die niet past bij de vraag.",
        qualifyingQuestions: [
          "Waar kan ik je mee helpen — en hoe spoed is het?",
          "Welke dag of tijd past ongeveer?",
          "Is dit je eerste keer bij ons of kom je vaker?",
        ],
      },
    },
  ),

  consultancy: def(
    "consultancy",
    "Consultancy / advies",
    "Strategie, organisatie, IT of vakadvies.",
    {
      defaultServices: [
        "Strategiegesprek",
        "Procesanalyse",
        "Implementatiebegeleiding",
        "Workshop",
      ],
      defaultPricingHints: "Uurtarief €… of dagtarief €…. Vaste projectprijs na offerte.",
      onboardingFields: [
        {
          name: "expertise",
          label: "Jouw expertise",
          type: "textarea",
          placeholder: "Digitalisering, HR, financieel…",
        },
        {
          name: "client_type",
          label: "Typische klant",
          type: "textarea",
          placeholder: "MKB, non-profit, scale-up…",
        },
      ],
      ai: {
        contextExtra:
          "Branche: consultancy. Geen juridisch of fiscaal advies in chat; plan intakes.",
        qualifyingQuestions: [
          "Wat is de kernvraag of het doel?",
          "Wie is beslisser?",
          "Wanneer past een kennismaking?",
        ],
        replySystemPersona:
          "Je bent een senior consultant in tekst: rustig, scherp, altijd een concrete vervolgstap.",
      },
    },
  ),

  trade_contractor: def(
    "trade_contractor",
    "Klusbedrijf",
    "Klussen, renovatie en onderhoud op locatie.",
    {
      defaultServices: ["Renovatie", "Onderhoud", "Montage", "Spoedklussen"],
      defaultPricingHints: "Voorrijden €… uurtarief €… materiaal achteraf volgens bon.",
      onboardingFields: [
        {
          name: "job_scope",
          label: "Soort klussen",
          type: "textarea",
          placeholder: "Sanitair, timmerwerk, afwerking…",
        },
      ],
      ai: {
        contextExtra:
          "Branche: klusbedrijf. Vraag naar foto's, regio en urgentie. Geen vaste prijs zonder inspectie.",
        qualifyingQuestions: [
          "Wat moet er gebeuren?",
          "Is het spoed?",
          "Waar moeten we langskomen (regio)?",
        ],
      },
    },
  ),

  other: def("other", "Anders", "Vrij invullen — jouw branche.", {
    defaultServices: [],
    onboardingFields: [
      {
        name: "describe",
        label: "Omschrijf kort je branche en aanbod",
        type: "textarea",
        placeholder: "Wat doe je, voor wie, en wat is je USP?",
      },
    ],
    ai: {
      contextExtra:
        "Branche: algemene dienstverlening. Stel gerichte vragen om de aanvraag te kwalificeren.",
    },
  }),
};

export function isNicheId(s: string): s is NicheId {
  return (NICHE_OPTION_IDS as readonly string[]).includes(s);
}

export function getNicheConfig(id: string | null | undefined): NicheDefinition {
  if (id && isNicheId(id)) {
    return NICHE_CATALOG[id];
  }
  return NICHE_CATALOG.other;
}

/** Labels voor onboarding-select (volgorde UI) */
export const NICHE_SELECT_OPTIONS: { id: NicheId; uiLabel: string }[] = [
  { id: "general_services", uiLabel: "Dienstverlener" },
  { id: "consultancy", uiLabel: "Consultancy / advies" },
  { id: "trade_contractor", uiLabel: "Klusbedrijf" },
  { id: "garage", uiLabel: "Garage / autobedrijf" },
  { id: "hair_salon", uiLabel: "Kapper / salon" },
  { id: "dentist", uiLabel: "Tandarts / zorg" },
  { id: "plumber", uiLabel: "Loodgieter / installateur" },
  { id: "electrician", uiLabel: "Elektricien" },
  { id: "cleaning", uiLabel: "Schoonmaakbedrijf" },
  { id: "realtor", uiLabel: "Makelaar" },
  { id: "coach", uiLabel: "Coach / trainer" },
  { id: "other", uiLabel: "Anders (vrije invoer)" },
];

export function displayNicheLabel(
  nicheId: string | null | undefined,
  customLabel: string | null | undefined,
): string {
  if (nicheId === "other" && customLabel?.trim()) {
    return customLabel.trim();
  }
  if (nicheId && isNicheId(nicheId)) {
    return NICHE_CATALOG[nicheId].label;
  }
  if (customLabel?.trim()) return customLabel.trim();
  return "Servicebedrijf";
}
