/**
 * Demo-identiteit: universeel (standaard) en garage (niche garage).
 */

/** Standaard demo — herkenbaar voor elke sector (kapper, praktijk, zaak, monteur). */
export const DEMO_UNIVERSAL_BRAND = {
  legalName: "Het Loket Centrum",
  shortName: "Het Loket",
  tagline: "Afspraken · spoed · opvolging — voor drukbezette lokale zaken",
  nicheKey: "general_services" as const,
  email: "hallo@hetloket-demo.nl",
  phoneDisplay: "+31 20 000 2140",
  phoneE164: "+31200002140",
  addressLine: "Stationsplein 12 · 1012 AB Amsterdam (demo)",
  serviceArea: "Regio Amsterdam en omstreken (voorbeeld).",
  bookingUrl: "https://demo.plannen.nl",
  tone:
    "Warm, efficiënt, geen jargon. Altijd een concrete volgende stap: tijd voorstellen, korte vraag, of duidelijk wat je nodig hebt van de klant.",
  hours: "Ma–vr 08:00–18:00 · za op afspraak · zo gesloten",
  services: [
    "Intake via WhatsApp, mail en site",
    "Afspraken en herinneringen",
    "Spoed en wachtlijst",
    "Offerte of transparante richtprijs",
  ],
} as const;

/** Premium garage-demo wanneer niche expliciet op garage staat. */
export const DEMO_GARAGE_BRAND = {
  legalName: "Van Dijk AutoService",
  shortName: "Van Dijk",
  tagline: "APK · onderhoud · diagnose · banden",
  nicheKey: "garage" as const,
  email: "planning@vandijk-autoservice.nl",
  phoneDisplay: "+31 297 820 014",
  phoneE164: "+31297820014",
  addressLine: "Zuideinde 48 · 3641 BB Mijdrecht",
  serviceArea:
    "Mijdrecht, De Ronde Venen, Uithoorn, Amstelveen en directe omgeving (ca. 25 km).",
  bookingUrl: "https://vandijk-autoservice.nl/plan",
  tone:
    "Nuchter, vriendelijk, no-nonsense. Korte zinnen, duidelijke prijsindicaties, altijd een concrete vervolgstap (inspectie, offerte of afspraak).",
  hours:
    "Ma–vr 07:30–18:00 · za 08:00–13:00 · zo gesloten · spoed op afspraak.",
  services: [
    "APK-keuring",
    "Kleine en grote beurt",
    "Banden wisselen, balanceren, uitlijnen",
    "Remmen (schijven, blokken, vloeistof)",
    "Airco service en vullen",
    "Diagnose storingslampjes en elektronica",
    "Accu testen en vervangen",
    "Onderhoud zakelijke voertuigen en kleine vloten",
  ],
} as const;

export function demoUniversalMonogram(): string {
  return "HL";
}

export function demoGarageMonogram(): string {
  return "VDA";
}
