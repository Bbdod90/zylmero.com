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
        "cf-dashboard-panel flex flex-col items-center border-dashed border-border/50 bg-gradient-to-b from-card via-card/90 to-muted/12 px-8 py-16 text-center dark:border-white/[0.14] dark:via-[hsl(222_28%_11%/0.5)] dark:to-card/35",
        className,
      )}
    >
      <div className="mb-6 flex size-[4.25rem] items-center justify-center rounded-[1.15rem] bg-primary/[0.09] text-primary shadow-[0_12px_40px_-20px_hsl(var(--primary)/0.45)] ring-1 ring-primary/20 dark:bg-primary/[0.12] dark:ring-primary/25">
        <Icon className="size-[1.85rem]" strokeWidth={1.4} />
      </div>
      <p className="text-lg font-medium tracking-tight text-foreground">{title}</p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actions ? <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
