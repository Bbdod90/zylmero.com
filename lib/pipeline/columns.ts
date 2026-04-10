import type { Lead, LeadStatus } from "@/lib/types";

export type PipelineColumnId =
  | "nieuw"
  | "gesprek"
  | "offerte"
  | "gewonnen"
  | "verloren";

export const PIPELINE_COLUMNS: {
  id: PipelineColumnId;
  label: string;
  /** Primaire status bij neerzetten in deze kolom */
  dropStatus: LeadStatus;
  statuses: readonly LeadStatus[];
}[] = [
  { id: "nieuw", label: "Nieuw", dropStatus: "new", statuses: ["new"] },
  {
    id: "gesprek",
    label: "In gesprek",
    dropStatus: "active",
    statuses: ["active", "appointment_booked"],
  },
  {
    id: "offerte",
    label: "Offerte",
    dropStatus: "quote_sent",
    statuses: ["quote_sent"],
  },
  { id: "gewonnen", label: "Gewonnen", dropStatus: "won", statuses: ["won"] },
  { id: "verloren", label: "Verloren", dropStatus: "lost", statuses: ["lost"] },
];

export function columnIdForLeadStatus(status: LeadStatus): PipelineColumnId {
  for (const col of PIPELINE_COLUMNS) {
    if ((col.statuses as readonly string[]).includes(status)) {
      return col.id;
    }
  }
  return "nieuw";
}

export function sortLeadsInColumn(leads: Lead[]): Lead[] {
  return [...leads].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}
