"use client";

import { useEffect, useState } from "react";
import type { Lead } from "@/lib/types";
import { NewAppointmentDialog } from "@/components/appointments/new-appointment-dialog";
import { AppointmentsCalendar } from "@/components/appointments/appointments-calendar";
import type { AgendaAppointment } from "@/components/appointments/agenda-types";

export function AppointmentsPageClient({
  agendaItems,
  agendaRevision,
  demoMode,
  leads,
  defaultLeadId,
  initialOpen,
}: {
  agendaItems: AgendaAppointment[];
  /** Wijzigt bij server-refresh zodat lokale state synchroniseert */
  agendaRevision: string;
  demoMode: boolean;
  leads: Lead[];
  defaultLeadId: string | null;
  initialOpen: boolean;
}) {
  const [items, setItems] = useState<AgendaAppointment[]>(agendaItems);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- sync alleen wanneer server-revisie verandert (router.refresh)
  useEffect(() => {
    setItems(agendaItems);
  }, [agendaRevision]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <NewAppointmentDialog
          leads={leads}
          demoMode={demoMode}
          defaultLeadId={defaultLeadId}
          initialOpen={initialOpen}
          onDemoAppointmentCreated={(appt) => {
            setItems((prev) => [...prev, appt]);
          }}
        />
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-b from-card/80 to-muted/15 p-5 shadow-[0_12px_48px_-28px_rgb(0_0_0/0.2)] dark:border-white/[0.09] dark:from-white/[0.04] dark:to-transparent dark:shadow-[0_16px_56px_-32px_rgb(0_0_0/0.55)] sm:p-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
          aria-hidden
        />
        <AppointmentsCalendar
          items={items}
          demoMode={demoMode}
          onDemoAppointmentUpdated={(next) =>
            setItems((prev) => prev.map((x) => (x.id === next.id ? next : x)))
          }
          onDemoAppointmentDeleted={(id) =>
            setItems((prev) => prev.filter((x) => x.id !== id))
          }
        />
      </div>
    </>
  );
}
