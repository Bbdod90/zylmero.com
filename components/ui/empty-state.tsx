import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  /** Optionele knoppen of links onder de tekst */
  actions?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "cf-dashboard-panel flex flex-col items-center border-dashed border-border/55 bg-gradient-to-b from-card to-muted/15 px-8 py-14 text-center dark:border-white/[0.12] dark:to-card/40",
        className,
      )}
    >
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner-soft ring-1 ring-primary/15">
        <Icon className="size-8" strokeWidth={1.5} />
      </div>
      <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actions ? <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
