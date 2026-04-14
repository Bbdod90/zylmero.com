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
        "relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/95 to-muted/15 shadow-[0_20px_64px_-40px_rgb(0_0_0/0.42)] dark:border-white/[0.09] dark:from-white/[0.04] dark:to-black/20 dark:shadow-[0_24px_72px_-44px_rgb(0_0_0/0.58)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/28 to-transparent"
        aria-hidden
      />
      <div className={cn("relative p-5 sm:p-6 lg:p-7", bodyClassName)}>
        {eyebrow || title || action ? (
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-5">
            <div className="min-w-0 space-y-1">
              {eyebrow ? (
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
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
