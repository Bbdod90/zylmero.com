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

  useEffect(() => {
    setItems(agendaItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync alleen bij agendaRevision (router.refresh), niet bij elke agendaItems-referentie
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
      <div className="relative overflow-hidden rounded-[1.375rem] border border-border/45 bg-[linear-gradient(165deg,hsl(var(--card))_0%,hsl(var(--muted)/0.35)_52%,transparent_100%)] p-5 shadow-[0_20px_60px_-40px_rgb(0_0_0/0.32)] dark:border-white/[0.08] dark:bg-[linear-gradient(165deg,hsl(228_22%_11%/0.96)_0%,hsl(228_26%_7%/0.5)_58%,transparent_100%)] dark:shadow-[0_28px_72px_-44px_rgb(0_0_0/0.58)] sm:p-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/[0.18] to-transparent"
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
