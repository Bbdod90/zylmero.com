import type { LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nieuw",
  active: "Actief",
  quote_sent: "Offerte verstuurd",
  appointment_booked: "Afspraak ingepland",
  won: "Gewonnen",
  lost: "Verloren",
};

/** Zelfde volgorde als `updateLeadStatus` server-side. */
export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "active",
  "quote_sent",
  "appointment_booked",
  "won",
  "lost",
];

const styles: Record<LeadStatus, string> = {
  new: "border-border/70 bg-muted/50 text-foreground dark:border-white/[0.1] dark:bg-white/[0.06]",
  active: "border-primary/35 bg-primary/12 text-primary",
  quote_sent: "border-amber-500/35 bg-amber-500/10 text-amber-950 dark:border-amber-500/25 dark:text-amber-100",
  appointment_booked: "border-primary/30 bg-primary/10 text-primary",
  won: "border-emerald-500/35 bg-emerald-500/10 text-emerald-900 dark:border-primary/35 dark:bg-primary/15 dark:text-primary",
  lost: "border-border/60 bg-muted/60 text-muted-foreground dark:border-white/[0.08] dark:bg-muted/40",
};

export function leadStatusBadgeClass(status: LeadStatus, className?: string) {
  return cn(
    "inline-flex items-center rounded-full border px-3 py-1 text-2xs font-semibold uppercase tracking-wide",
    styles[status],
    className,
  );
}

export function LeadStatusBadge({
  status,
  className,
}: {
  status: LeadStatus;
  className?: string;
}) {
  return (
    <span className={leadStatusBadgeClass(status, className)}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
