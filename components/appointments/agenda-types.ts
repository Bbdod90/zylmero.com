import type { Appointment } from "@/lib/types";

export type AgendaAppointment = Appointment & {
  lead_name: string | null;
};
