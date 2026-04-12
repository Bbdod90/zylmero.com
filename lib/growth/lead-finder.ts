export const LEAD_FINDER_KEYWORDS = [
  "kapper",
  "kapsalon",
  "tandarts",
  "mondhygiënist",
  "garage",
  "loodgieter",
  "schoonmaak",
  "beautysalon",
] as const;

export function getSearchStrategyCopy(): string {
  return `GOOGLE MAPS
1. Open Google Maps bij jouw stad/regio.
2. Zoek een sector + wijk (bijv. "kapsalon", "tandarts", "garage", "loodgieter") + plaatsnaam.
3. Open elk profiel → check website / telefoon / WhatsApp in de beschrijving.
4. Voorkeur 4.0–4,7★ (druk genoeg om pijn te voelen, niet zo groot dat je enterprise-sales nodig hebt).

INSTAGRAM
1. Zoek #[jouw stad] gecombineerd met #kapper #tandarts #garage #afspraak — kies wat bij jouw aanpak past.
2. Open recente posts → profiel → als ze DMs beantwoorden of "DM voor afspraak" hebben, zijn ze interessant.
3. Bewaar 20 profielen; stuur 5 per dag een bericht.

ZOEKWOORDEN COMBINEREN
${LEAD_FINDER_KEYWORDS.join(", ")}

REGEL
Benader lokale zaken die onder druk staan op aanvragen — die verliezen klanten door snelheid, niet alleen door prijs.`;
}
