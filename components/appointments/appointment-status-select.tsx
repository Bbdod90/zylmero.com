"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAppointmentStatus } from "@/actions/appointments";
import { appointmentStatusNl } from "@/lib/i18n/nl-labels";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";

const OPTIONS = [
  { value: "scheduled", label: "Gepland" },
  { value: "confirmed", label: "Bevestigd" },
  { value: "completed", label: "Afgerond" },
  { value: "cancelled", label: "Geannuleerd" },
] as const;

function normalizeCurrent(current: string): (typeof OPTIONS)[number]["value"] {
  const norm = current.trim().toLowerCase();
  if (norm === "planned") return "scheduled";
  const hit = OPTIONS.find((o) => o.value === norm);
  if (hit) return hit.value;
  return "scheduled";
}

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
  const value = normalizeCurrent(current);
  const [demoValue, setDemoValue] = useState<string | null>(null);

  useEffect(() => {
    setDemoValue(null);
  }, [current]);

  const displayValue = demoMode ? (demoValue ?? value) : value;
  const displayLabel = OPTIONS.find((o) => o.value === displayValue)?.label ?? appointmentStatusNl(current);

  if (demoMode) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Afspraakstatus (demo)"
            className={cn(
              "flex h-9 max-w-full min-w-0 items-center gap-1 rounded-full border border-primary/25 bg-primary/[0.08] px-2.5 text-left text-2xs font-semibold text-primary",
            )}
          >
            <span className="min-w-0 flex-1 truncate normal-case tracking-normal" title={displayLabel}>
              {displayLabel}
            </span>
            <ChevronDown className="size-3 shrink-0 opacity-60" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {OPTIONS.map((o) => (
            <DropdownMenuItem
              key={o.value}
              className="gap-2 text-sm"
              onSelect={() => setDemoValue(o.value)}
            >
              {o.value === displayValue ? (
                <Check className="size-4 shrink-0 text-primary" />
              ) : (
                <span className="size-4 shrink-0" />
              )}
              {o.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <select
      aria-label="Afspraakstatus"
      className="h-9 max-w-full min-w-0 rounded-full border border-primary/25 bg-primary/[0.08] px-2.5 text-2xs font-semibold text-primary"
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
