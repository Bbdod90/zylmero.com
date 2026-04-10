export const LEAD_FINDER_KEYWORDS = [
  "garage",
  "autobedrijf",
  "bandenservice",
  "APK",
  "werkplaats",
  "autoservice",
] as const;

export function getSearchStrategyCopy(): string {
  return `GOOGLE MAPS
1. Open Google Maps bij jouw stad/regio.
2. Zoek: "garage" of "autobedrijf" + wijknaam.
3. Open elk profiel → check website / telefoon / WhatsApp in de beschrijving.
4. Voorkeur 4.0–4,7★ (druk genoeg om pijn te voelen, niet zo groot dat je enterprise-sales nodig hebt).

INSTAGRAM
1. Zoek #garage #[jouw stad] #apk #banden #autoservice
2. Open recente posts → profiel → als ze DMs beantwoorden of "DM voor afspraak" hebben, zijn ze interessant.
3. Bewaar 20 profielen; stuur 5 per dag een bericht.

ZOEKWOORDEN COMBINEREN
${LEAD_FINDER_KEYWORDS.join(", ")}

REGEL
Benader bedrijven die onderbezet lijken aan de balie — die verliezen leads door snelheid, niet door prijs.`;
}
