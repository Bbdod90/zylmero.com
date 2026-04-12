/**
 * RDW Open Data — gekentekende voertuigen (basis).
 * @see https://opendata.rdw.nl/Voertuigen/Open_Data_RDW_Gekentekende_voertuigen/m9d7-ebf2
 */

const RDW_BASE =
  "https://opendata.rdw.nl/resource/m9d7-ebf2.json?$limit=1&kenteken=";

export type RdwVehicleSnapshot = {
  kenteken: string;
  merk: string;
  handelsbenaming: string;
  voertuigsoort: string;
  vervaldatum_apk?: string;
  eerste_kleur?: string;
  datum_eerste_toelating?: string;
  aantal_deuren?: string;
  inrichting?: string;
};

/** Strip tot 6 tekens zoals RDW verwacht (zonder streepjes). */
export function normalizeKenteken(raw: string): string | null {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.length !== 6) return null;
  return s;
}

const PLATE_PATTERNS: RegExp[] = [
  /\b([0-9]{1,3})-([A-Z]{1,3})-([0-9]{1,3})\b/gi,
  /\b([A-Z]{1,3})-([0-9]{1,3})-([A-Z]{1,3})\b/gi,
  /\b([A-Z]{2})-([0-9]{3})-([A-Z])\b/gi,
  /\b([0-9]{2})-([A-Z]{3})-([0-9])\b/gi,
  /\b([A-Z])-([0-9]{3})-([A-Z]{2})\b/gi,
];

/** Haal mogelijke kentekens uit vrije tekst (Nederlandse sidecodes). */
export function extractKentekenCandidates(text: string): string[] {
  const found = new Set<string>();
  for (const re of PLATE_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const norm = normalizeKenteken(m[0]);
      if (norm) found.add(norm);
    }
  }
  const tokens = text.toUpperCase().split(/[^A-Z0-9]+/);
  for (const t of tokens) {
    const norm = normalizeKenteken(t);
    if (norm) found.add(norm);
  }
  return Array.from(found);
}

export async function lookupKenteken(
  raw: string,
): Promise<RdwVehicleSnapshot | null> {
  const kenteken = normalizeKenteken(raw);
  if (!kenteken) return null;

  const url = `${RDW_BASE}${encodeURIComponent(kenteken)}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as Record<string, string>[];
  const row = rows[0];
  if (!row?.kenteken) return null;

  return {
    kenteken: row.kenteken,
    merk: row.merk || "",
    handelsbenaming: row.handelsbenaming || "",
    voertuigsoort: row.voertuigsoort || "",
    vervaldatum_apk: row.vervaldatum_apk,
    eerste_kleur: row.eerste_kleur,
    datum_eerste_toelating: row.datum_eerste_toelating,
    aantal_deuren: row.aantal_deuren,
    inrichting: row.inrichting,
  };
}

/** Eerste kandidaat die bij RDW bestaat. */
export async function resolveKentekenFromText(
  text: string,
): Promise<RdwVehicleSnapshot | null> {
  const candidates = extractKentekenCandidates(text);
  for (const c of candidates) {
    const v = await lookupKenteken(c);
    if (v) return v;
  }
  return null;
}
