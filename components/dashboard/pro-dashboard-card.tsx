import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Gedeelde visuele schil voor dashboard-secties — rand, gradient, accentlijn. */
export function ProDashboardCard({
  title,
  eyebrow,
  action,
  children,
  className,
  bodyClassName,
  id,
  "aria-labelledby": ariaLabelledBy,
}: {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
  "aria-labelledby"?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "cf-dashboard-panel relative overflow-hidden rounded-2xl border border-border/65 bg-gradient-to-b from-card via-card/98 to-muted/12 shadow-[0_18px_50px_-36px_rgb(15_23_42/0.2)] dark:border-white/[0.09] dark:from-card dark:via-card/95 dark:to-[hsl(222_26%_6%)] dark:shadow-[0_22px_60px_-40px_rgb(0_0_0/0.55)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/28 to-transparent"
        aria-hidden
      />
      <div className={cn("relative p-5 sm:p-6 lg:p-6", bodyClassName)}>
        {eyebrow || title || action ? (
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border/40 pb-4 dark:border-white/[0.06]">
            <div className="min-w-0 space-y-1">
              {eyebrow ? (
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-[1.0625rem]">
                  {title}
                </h3>
              ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
