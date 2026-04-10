"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAppointmentStatus } from "@/actions/appointments";
import { Badge } from "@/components/ui/badge";
import { appointmentStatusNl } from "@/lib/i18n/nl-labels";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "scheduled", label: "Gepland" },
  { value: "confirmed", label: "Bevestigd" },
  { value: "completed", label: "Afgerond" },
  { value: "cancelled", label: "Geannuleerd" },
];

export function AppointmentStatusSelect({
  appointmentId,
  current,
  disabled,
  demoMode,
}: {
  appointmentId: string;
  current: string;
  disabled?: boolean;
  demoMode?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const norm = current.trim().toLowerCase();
  const allowed = new Set(OPTIONS.map((o) => o.value));
  const value = (() => {
    if (norm === "planned") return "scheduled";
    if (allowed.has(norm)) return norm;
    return "scheduled";
  })();

  if (demoMode) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "rounded-full border-primary/25 bg-primary/[0.08] px-3 py-1 text-2xs font-semibold uppercase tracking-wide text-primary",
        )}
      >
        {appointmentStatusNl(current)}
      </Badge>
    );
  }

  return (
    <select
      aria-label="Afspraakstatus"
      className="h-10 min-h-[40px] rounded-full border border-primary/25 bg-primary/[0.08] px-3 text-2xs font-semibold uppercase tracking-wide text-primary"
      value={value}
      disabled={disabled || pending}
      onChange={(e) => {
        const v = e.target.value;
        start(async () => {
          const res = await updateAppointmentStatus(appointmentId, v);
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success("Afspraak bijgewerkt");
          router.refresh();
        });
      }}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
