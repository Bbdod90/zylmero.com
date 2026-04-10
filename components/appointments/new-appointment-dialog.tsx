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

export function NewAppointmentDialog({
  leads,
  disabled,
  defaultLeadId,
  initialOpen,
}: {
  leads: Lead[];
  disabled?: boolean;
  /** Preselect lead (bijv. vanuit lead-werkruimte) */
  defaultLeadId?: string | null;
  /** Open dialoog bij eerste render */
  initialOpen?: boolean;
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
          variant="outline"
          className="h-12 min-h-[44px] rounded-xl"
          disabled={disabled || leads.length === 0}
        >
          <CalendarPlus className="mr-2 size-4" />
          Nieuwe afspraak
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuwe afspraak</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            start(async () => {
              const lead_id = String(fd.get("lead_id") || "");
              const starts_at = String(fd.get("starts_at") || "");
              const ends_at = String(fd.get("ends_at") || "");
              const notes = String(fd.get("notes") || "");
              const res = await createAppointment({
                lead_id,
                starts_at,
                ends_at: ends_at || null,
                notes: notes || null,
              });
              if (!res.ok) {
                toast.error(res.error);
                return;
              }
              toast.success("Afspraak aangemaakt");
              setOpen(false);
              router.refresh();
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="appt_lead">Lead</Label>
            <select
              id="appt_lead"
              name="lead_id"
              required
              className="flex h-12 w-full rounded-xl border border-white/[0.08] bg-background/50 px-3 text-sm"
              defaultValue={
                defaultLeadId && leads.some((l) => l.id === defaultLeadId)
                  ? defaultLeadId
                  : ""
              }
              key={defaultLeadId || "none"}
            >
              <option value="">Kies een lead</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="starts_at">Start</Label>
            <Input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              required
              defaultValue={defaultStart()}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ends_at">Einde (optioneel)</Label>
            <Input
              id="ends_at"
              name="ends_at"
              type="datetime-local"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notitie</Label>
            <Input
              id="notes"
              name="notes"
              className="rounded-xl"
              placeholder="Korte context voor de balie"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={pending}>
            {pending ? "Opslaan…" : "Afspraak opslaan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
