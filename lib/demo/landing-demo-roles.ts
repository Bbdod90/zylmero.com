import type { NicheId } from "@/lib/niches";

/** Rollen op de homepage-demo — koppel aan bestaande niche-config (AI-gedrag + dataset in dashboard). */
export const LANDING_DEMO_ROLES: { id: NicheId; label: string }[] = [
  { id: "general_services", label: "Algemeen" },
  { id: "hair_salon", label: "Kapper" },
  { id: "dentist", label: "Tandarts" },
  { id: "garage", label: "Garage" },
  { id: "plumber", label: "Loodgieter" },
  { id: "cleaning", label: "Schoonmaak" },
  { id: "electrician", label: "Elektricien" },
  { id: "coach", label: "Coach" },
];
