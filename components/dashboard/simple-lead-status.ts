import type { LeadStatus } from "@/lib/types";

/** Eenvoudige status voor het dashboard-overzicht. */
export function simpleDashboardStatus(status: LeadStatus): string {
  if (status === "new") return "Nieuw";
  if (status === "won") return "Gewonnen";
  if (status === "lost") return "Verloren";
  return "Bezig";
}
