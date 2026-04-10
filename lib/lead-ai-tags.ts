/** Vaste labels (DB-slug → weergave NL) */
export const AI_TAG_LABELS: Record<string, string> = {
  spoed: "Spoed",
  hoge_waarde: "Hoge waarde",
  prijsvraag: "Prijsvraag",
  klacht: "Klacht",
  offerte: "Offerte",
  afspraak: "Afspraak",
};

export function labelForAiTag(slug: string): string {
  return AI_TAG_LABELS[slug] ?? slug.replace(/_/g, " ");
}
