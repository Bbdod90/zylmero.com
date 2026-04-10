import { cn } from "@/lib/utils";
import type { LeadTemperature } from "@/lib/sales/scoring";

const styles: Record<
  LeadTemperature,
  { label: string; dot: string; ring: string }
> = {
  hot: {
    label: "Prioriteit",
    dot: "bg-amber-500/90",
    ring: "border-amber-500/25 bg-amber-500/[0.08] text-amber-100/95",
  },
  warm: {
    label: "Warm",
    dot: "bg-sky-500/80",
    ring: "border-sky-500/20 bg-sky-500/[0.08] text-sky-100/90",
  },
  cold: {
    label: "Koud",
    dot: "bg-slate-500/80",
    ring: "border-border/60 bg-muted/40 text-muted-foreground",
  },
};

export function TemperatureBadge({
  temp,
  className,
}: {
  temp: LeadTemperature;
  className?: string;
}) {
  const s = styles[temp];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-[0.1em]",
        s.ring,
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", s.dot)} aria-hidden />
      {s.label}
    </span>
  );
}
