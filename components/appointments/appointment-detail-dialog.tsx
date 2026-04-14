"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { toast } from "sonner";
import { deleteAppointment, updateAppointmentDetails } from "@/actions/appointments";
import { appointmentStatusNl } from "@/lib/i18n/nl-labels";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppointmentStatusSelect } from "@/components/appointments/appointment-status-select";
import type { AgendaAppointment } from "@/components/appointments/agenda-types";
import { CalendarClock, ExternalLink, Trash2 } from "lucide-react";

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  demoMode,
  onDemoUpdated,
  onDemoDeleted,
}: {
  appointment: AgendaAppointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demoMode: boolean;
  /** Demo: lokale agenda bijwerken na wijziging tijd/notities */
  onDemoUpdated?: (next: AgendaAppointment) => void;
  /** Demo: verwijder lokaal na delete */
  onDemoDeleted?: (appointmentId: string) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [startsLocal, setStartsLocal] = useState("");
  const [endsLocal, setEndsLocal] = useState("");
  const [notes, setNotes] = useState("");
  const [deleteStep, setDeleteStep] = useState(false);

  useEffect(() => {
    if (!appointment) return;
    setStartsLocal(toDatetimeLocalValue(appointment.starts_at));
    setEndsLocal(
      appointment.ends_at ? toDatetimeLocalValue(appointment.ends_at) : "",
    );
    setNotes(appointment.notes ?? "");
    setDeleteStep(false);
  }, [appointment]);

  const summaryLine = useMemo(() => {
    if (!appointment) return "";
    const start = new Date(appointment.starts_at);
    return `${format(start, "EEEE d MMMM yyyy", { locale: nl })} · ${format(start, "HH:mm")}`;
  }, [appointment]);

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92vh,720px)] overflow-y-auto rounded-2xl p-5 sm:max-w-[440px]">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="flex items-start gap-2 text-lg leading-snug">
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <span>Afspraak</span>
          </DialogTitle>
          <p className="text-xs font-medium text-muted-foreground">{summaryLine}</p>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="rounded-xl border border-border/50 bg-muted/15 px-3 py-2.5 dark:border-white/[0.08] dark:bg-white/[0.04]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Klant
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {appointment.lead_id && appointment.lead_name ? (
                <>
                  <p className="text-sm font-semibold text-foreground">
                    {appointment.lead_name}
                  </p>
                  <Link
                    href={`/dashboard/leads/${appointment.lead_id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Profiel
                    <ExternalLink className="size-3" aria-hidden />
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Geen gekoppelde klant</p>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Status:{" "}
              <span className="font-medium text-foreground">
                {appointmentStatusNl(appointment.status)}
              </span>
            </p>
          </div>

          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <Label className="text-xs">Status wijzigen</Label>
            <AppointmentStatusSelect
              appointmentId={appointment.id}
              current={appointment.status}
              demoMode={demoMode}
            />
          </div>

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                if (demoMode) {
                  const starts = new Date(startsLocal);
                  if (Number.isNaN(starts.getTime())) {
                    toast.error("Ongeldige starttijd");
                    return;
                  }
                  let endsIso: string;
                  if (endsLocal) {
                    const ends = new Date(endsLocal);
                    if (Number.isNaN(ends.getTime())) {
                      toast.error("Ongeldige eindtijd");
                      return;
                    }
                    endsIso = ends.toISOString();
                  } else {
                    endsIso = new Date(
                      starts.getTime() + 60 * 60 * 1000,
                    ).toISOString();
                  }
                  const next: AgendaAppointment = {
                    ...appointment,
                    starts_at: starts.toISOString(),
                    ends_at: endsIso,
                    notes: notes.trim() ? notes.trim() : null,
                    updated_at: new Date().toISOString(),
                  };
                  onDemoUpdated?.(next);
                  toast.success("Opgeslagen in je demo-agenda");
                  onOpenChange(false);
                  return;
                }
                const res = await updateAppointmentDetails({
                  appointmentId: appointment.id,
                  starts_at: startsLocal,
                  ends_at: endsLocal || null,
                  notes: notes.trim() ? notes.trim() : null,
                });
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                toast.success("Afspraak bijgewerkt");
                onOpenChange(false);
                await router.refresh();
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="detail_starts" className="text-xs">
                Start
              </Label>
              <Input
                id="detail_starts"
                type="datetime-local"
                required
                value={startsLocal}
                onChange={(e) => setStartsLocal(e.target.value)}
                className="h-10 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="detail_ends" className="text-xs">
                Einde (optioneel)
              </Label>
              <Input
                id="detail_ends"
                type="datetime-local"
                value={endsLocal}
                onChange={(e) => setEndsLocal(e.target.value)}
                className="h-10 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="detail_notes" className="text-xs">
                Notities
              </Label>
              <Textarea
                id="detail_notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Context voor jezelf of de balie…"
                className="min-h-[120px] rounded-lg text-sm"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-lg font-semibold"
              disabled={pending}
            >
              {pending ? "Opslaan…" : "Wijzigingen opslaan"}
            </Button>
          </form>

          <Separator className="my-1 bg-border/60 dark:bg-white/[0.08]" />

          {deleteStep ? (
            <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/[0.06] p-3">
              <p className="text-xs font-medium text-foreground">
                Afspraak definitief verwijderen? Dit kan niet ongedaan worden.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="rounded-lg"
                  disabled={pending}
                  onClick={() => {
                    start(async () => {
                      if (demoMode || appointment.id.startsWith("demo-")) {
                        onDemoDeleted?.(appointment.id);
                        toast.success("Afspraak verwijderd (demo)");
                        onOpenChange(false);
                        return;
                      }
                      const res = await deleteAppointment(appointment.id);
                      if (!res.ok) {
                        toast.error(res.error);
                        return;
                      }
                      toast.success("Afspraak verwijderd");
                      onOpenChange(false);
                      await router.refresh();
                    });
                  }}
                >
                  {pending ? "Bezig…" : "Ja, verwijderen"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  disabled={pending}
                  onClick={() => setDeleteStep(false)}
                >
                  Annuleren
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-lg border-destructive/35 text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteStep(true)}
            >
              <Trash2 className="mr-2 size-4 shrink-0" aria-hidden />
              Afspraak verwijderen
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
