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
      className={cn("cf-dashboard-panel", className)}
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
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-primary">
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
