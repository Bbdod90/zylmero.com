import type { EmbeddedChatTone } from "@/lib/embedded-chat/types";

export type WizardGoalId = "support" | "assistant" | "sales" | "custom";

export type WizardGoalPreset = {
  name: string;
  tone: EmbeddedChatTone;
  instructions: string;
};

export const WIZARD_GOAL_PRESETS: Record<WizardGoalId, WizardGoalPreset> = {
  support: {
    name: "Klantenservice",
    tone: "vriendelijk",
    instructions:
      "Je helpt bezoekers met vragen en problemen. Wees duidelijk en geduldig. Als iets complex is of om menselijke hulp vraagt, bied je aan om contact of een terugbelverzoek te regelen.",
  },
  assistant: {
    name: "Website-assistent",
    tone: "vriendelijk",
    instructions:
      "Je bent de digitale assistent van dit bedrijf. Beantwoord vragen over diensten, prijzen, bereikbaarheid en planning. Werk klanten rustig toe naar een concrete afspraak of volgende stap.",
  },
  sales: {
    name: "Verkoop-assistent",
    tone: "zakelijk",
    instructions:
      "Je helpt bezoekers het juiste product of dienst te kiezen. Stel gerichte vragen, geef heldere prijsindicaties waar mogelijk, en werk toe naar een afspraak of contactmoment.",
  },
  custom: {
    name: "Website-assistent",
    tone: "vriendelijk",
    instructions:
      "Beantwoord vragen over ons bedrijf en wat we doen. Blijf kort en duidelijk, en nodig uit tot een volgende stap (bellen, mailen, afspraak).",
  },
};
