/** Widget + dashboard preview: eerste 3 keuzes (houd `public/widget.js` gelijk). */
export const WIDGET_STARTER_WELCOME_DEFAULT =
  "Welkom. Waarmee kunnen we je helpen? Kies hieronder een onderwerp — of stel je eigen vraag.";

export type WidgetStarter = {
  id: string;
  /** Korte tekst in de chat als gebruikersbericht */
  label: string;
  /** Volledige prompt naar /api/chat voor rijk antwoord */
  prompt: string;
};

export const WIDGET_STARTERS: WidgetStarter[] = [
  {
    id: "repair",
    label: "Plan een reparatie",
    prompt:
      "Ik wil een reparatie laten uitvoeren. Leg uit hoe ik bij jullie een afspraak plan, wat de gang van zaken is en wat ik eventueel mee moet brengen of vooraf moet regelen. Gebruik alleen informatie uit jullie bedrijfsgegevens.",
  },
  {
    id: "models",
    label: "Modellen en prijzen",
    prompt:
      "Ik wil weten welke modellen jullie aanbieden en wat de prijzen zijn. Geef een duidelijk overzicht; noem bij prijzen consequent de juiste vanaf-prijzen zonder tegenstrijdige zinnen. Gebruik alleen wat in jullie kennis staat.",
  },
  {
    id: "returns",
    label: "Retourzending",
    prompt:
      "Hoe werkt een retour, ruiling of garantie bij jullie? Wat zijn de stappen, termijnen en voorwaarden? Antwoord op basis van jullie officiële informatie.",
  },
];
