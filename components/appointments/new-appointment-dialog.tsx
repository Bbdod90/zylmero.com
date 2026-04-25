"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAppointment } from "@/actions/appointments";
import type { Lead } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarPlus } from "lucide-react";
import Link from "next/link";
import type { AgendaAppointment } from "@/components/appointments/agenda-types";

function buildDemoAppointment(
  fd: FormData,
  leads: Lead[],
): AgendaAppointment {
  const lead_id = String(fd.get("lead_id") || "");
  const lead = leads.find((l) => l.id === lead_id);
  const starts_at_raw = String(fd.get("starts_at") || "");
  const ends_at_raw = String(fd.get("ends_at") || "");
  const notesRaw = String(fd.get("notes") || "").trim();
  const notes = notesRaw.length > 0 ? notesRaw : null;

  const starts = new Date(starts_at_raw);
  let ends: Date;
  if (ends_at_raw) {
    ends = new Date(ends_at_raw);
    if (Number.isNaN(ends.getTime())) {
      ends = new Date(starts.getTime() + 60 * 60 * 1000);
    }
  } else {
    ends = new Date(starts.getTime() + 60 * 60 * 1000);
  }
  const now = new Date().toISOString();
  return {
    id: `demo-appt-${crypto.randomUUID()}`,
    company_id: lead?.company_id ?? "demo",
    lead_id: lead_id.length > 0 ? lead_id : null,
    starts_at: starts.toISOString(),
    ends_at: ends.toISOString(),
    status: "scheduled",
    notes,
    created_at: now,
    updated_at: now,
    lead_name: lead?.full_name ?? null,
  };
}

export function NewAppointmentDialog({
  leads,
  demoMode = false,
  defaultLeadId,
  initialOpen,
  onDemoAppointmentCreated,
}: {
  leads: Lead[];
  demoMode?: boolean;
  defaultLeadId?: string | null;
  initialOpen?: boolean;
  /** Alleen demo: voegt afspraak toe aan lokale agenda */
  onDemoAppointmentCreated?: (appointment: AgendaAppointment) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(initialOpen));
  const [pending, start] = useTransition();

  useEffect(() => {
    if (initialOpen) setOpen(true);
  }, [initialOpen]);

  const defaultStart = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="default"
          className="h-10 min-h-10 rounded-lg px-4 text-sm font-semibold shadow-md shadow-primary/18 transition-[box-shadow,transform] hover:shadow-lg hover:shadow-primary/22 active:scale-[0.99]"
        >
          <CalendarPlus className="mr-2 size-4 shrink-0" />
          Nieuwe afspraak
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto rounded-2xl p-5 sm:max-w-[400px]">
        <DialogHeader className="space-y-1 pb-1">
          <DialogTitle className="text-lg">Nieuwe afspraak</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            start(async () => {
              if (demoMode) {
                const appt = buildDemoAppointment(fd, leads);
                onDemoAppointmentCreated?.(appt);
                toast.success("Afspraak toegevoegd aan je agenda (demo).", {
                  description:
                    "Zo ziet het eruit voor je klanten — echte opslag na het verlaten van de demo.",
                });
                setOpen(false);
                return;
              }
              const lead_id = String(fd.get("lead_id") || "");
              const starts_at = String(fd.get("starts_at") || "");
              const ends_at = String(fd.get("ends_at") || "");
              const notes = String(fd.get("notes") || "");
              const res = await createAppointment({
                lead_id: lead_id || null,
                starts_at,
                ends_at: ends_at || null,
                notes: notes || null,
              });
              if (!res.ok) {
                toast.error(res.error);
                return;
              }
              toast.success("Afspraak toegevoegd aan je agenda");
              setOpen(false);
              await router.refresh();
            });
          }}
        >
          {leads.length === 0 ? (
            <p className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground dark:border-white/[0.1]">
              Je hebt nog geen klanten in de lijst. Je mag alsnog een afspraak plannen zonder klant, of{" "}
              <Link href="/dashboard/leads" className="font-semibold text-primary underline underline-offset-2">
                voeg eerst een klant toe
              </Link>
              .
            </p>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="appt_lead" className="text-xs font-medium">
              Klant (optioneel)
            </Label>
            <select
              id="appt_lead"
              name="lead_id"
              className="flex h-10 w-full rounded-lg border border-white/[0.08] bg-background/50 px-3 text-sm"
              defaultValue={
                defaultLeadId && leads.some((l) => l.id === defaultLeadId)
                  ? defaultLeadId
                  : ""
              }
              key={defaultLeadId || "none"}
            >
              <option value="">Geen klant gekoppeld</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="starts_at" className="text-xs font-medium">
              Start
            </Label>
            <Input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              required
              defaultValue={defaultStart()}
              className="h-10 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ends_at" className="text-xs font-medium">
              Einde (optioneel)
            </Label>
            <Input
              id="ends_at"
              name="ends_at"
              type="datetime-local"
              className="h-10 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-medium">
              Notitie
            </Label>
            <Input
              id="notes"
              name="notes"
              className="h-10 rounded-lg text-sm"
              placeholder="Korte context (optioneel)"
            />
          </div>
          <Button
            type="submit"
            className="mt-1 w-full rounded-lg font-semibold"
            disabled={pending}
          >
            {pending ? "Bezig…" : "Afspraak toevoegen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
