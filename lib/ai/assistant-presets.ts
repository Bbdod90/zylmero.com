/** Vooraf ingevulde waarden voor AI-assistent — gebruikers kiezen één optie en kunnen daarna vrij aanpassen. */

export type AiTonePreset = {
  id: string;
  label: string;
  hint: string;
  value: string;
};

export type AiReplyStylePreset = {
  id: string;
  label: string;
  hint: string;
  value: string;
};

export type AiFollowupPreset = {
  id: string;
  label: string;
  hint: string;
  value: string;
};

export const AI_TONE_PRESETS: AiTonePreset[] = [
  {
    id: "warm-pro",
    label: "Professioneel & warm",
    hint: "Vertrouwen, duidelijk, menselijk",
    value:
      "Professioneel, warm en direct. Korte zinnen, geen onnodig jargon. Je spreekt de klant respectvol aan.",
  },
  {
    id: "no-nonsense",
    label: "No-nonsense",
    hint: "Efficiënt, to the point",
    value:
      "Zakelijk en efficiënt: eerlijk advies, geen omhaal. Helpt de klant snel verder zonder poespas.",
  },
  {
    id: "friendly",
    label: "Vriendelijk & enthousiast",
    hint: "Licht, persoonlijk, uitnodigend",
    value:
      "Vriendelijk en enthousiast, alsof je een collega helpt. Mag informeel zijn, maar blijf betrouwbaar en netjes.",
  },
  {
    id: "calm",
    label: "Rustig & geduldig",
    hint: "Extra uitleg, geen haast",
    value:
      "Rustig en geduldig. Neem de tijd om uit te leggen, stel één duidelijke vraag tegelijk en laat de klant zich gehoord voelen.",
  },
];

export const AI_REPLY_STYLE_PRESETS: AiReplyStylePreset[] = [
  {
    id: "short-step",
    label: "Kort, met volgende stap",
    hint: "Aanbevolen voor chat & WhatsApp",
    value:
      "Houd antwoorden kort (een paar zinnen). Sluit af met één concrete vervolgstap: bellen, offerte, afspraak of duidelijke vraag.",
  },
  {
    id: "bullets",
    label: "Lijstjes waar het helpt",
    hint: "Overzichtelijk bij prijzen of opties",
    value:
      "Gebruik korte alinea’s; bij meerdere opties of stappen mag je een genummerd lijstje gebruiken. Eindig met wat de klant nu het beste kan doen.",
  },
  {
    id: "explain",
    label: "Iets meer uitleg",
    hint: "Als klanten vaak hetzelfde vragen",
    value:
      "Mag iets uitgebreider uitleggen, maar blijf scanbaar: tussenkopjes of korte blokken. Geen lange lappen tekst; eindig met een duidelijke actie.",
  },
  {
    id: "one-question",
    label: "Max. één vraag per bericht",
    hint: "Minder overweldigend",
    value:
      "Stel per bericht hooguit één gerichte vraag. Geef eerst een korte reactie op wat de klant vraagt, daarna pas de vraag.",
  },
];

export const AI_LANGUAGE_OPTIONS: { code: string; label: string }[] = [
  { code: "nl", label: "Nederlands" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
];

export const AI_FOLLOWUP_PRESETS: AiFollowupPreset[] = [
  {
    id: "none",
    label: "Geen extra regels",
    hint: "Standaard gedrag",
    value: "",
  },
  {
    id: "gentle",
    label: "Rustig opvolgen",
    hint: "Niet te snel duwen",
    value:
      "Volg rustig op: eerst een vriendelijke check-in na ongeveer één werkdag; daarna pas weer als de klant zelf reageert of na enkele dagen.",
  },
  {
    id: "propose-call",
    label: "Graag bellen voorstellen",
    hint: "Persoonlijk contact",
    value:
      "Wanneer het past, stel voor om even te bellen voor persoonlijk advies — nooit opdringerig, altijd als logische volgende stap.",
  },
  {
    id: "quote-first",
    label: "Offerte centraal",
    hint: "B2B / projecten",
    value:
      "Stuur waar zinvol door naar een heldere offerte of prijsindicatie; leg uit wat je nodig hebt om die te maken.",
  },
];

export function matchPresetId<T extends { id: string; value: string }>(
  current: string,
  presets: T[],
): string | null {
  const t = current.trim();
  const hit = presets.find((p) => p.value.trim() === t);
  return hit?.id ?? null;
}
