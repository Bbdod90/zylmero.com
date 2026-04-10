/**
 * Vaste premium demo-identiteit voor garage-default (niche: garage).
 * Overal dezelfde naam, contact en toon — geen generieke "Demo"-mix.
 */
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

/** Monogram voor UI (logo-placeholder) */
export function demoGarageMonogram(): string {
  return "VDA";
}
