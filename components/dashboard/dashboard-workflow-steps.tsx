import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: 1,
    label: "Berichten",
    hint: "Eerst antwoorden",
    href: "/dashboard/inbox",
  },
  {
    step: 2,
    label: "Klanten",
    hint: "Kwalificeren",
    href: "/dashboard/leads",
  },
  {
    step: 3,
    label: "Afspraken",
    hint: "In de agenda",
    href: "/dashboard/appointments",
  },
] as const;

export function DashboardWorkflowSteps() {
  return (
    <section
      className="cf-workflow-shell mb-10 px-4 py-6 sm:px-7 sm:py-7"
      aria-label="Aanbevolen workflow"
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Werkwijze in drie stappen
      </p>
      <ol className="mt-5 flex list-none flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
        {STEPS.map((s, i) => (
          <li key={s.href} className="flex items-center gap-2 md:contents">
            <Link
              href={s.href}
              className={cn(
                "group flex min-w-0 flex-1 items-center gap-3.5 rounded-xl border border-border/60 bg-background/60 px-4 py-3.5 shadow-sm backdrop-blur-sm transition-all duration-200",
                "hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-md dark:border-white/[0.08] dark:bg-card/50 dark:hover:border-primary/35 dark:hover:bg-white/[0.04]",
                "md:flex-initial md:min-w-[11.5rem]",
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-primary/5 text-sm font-bold text-primary shadow-inner-soft ring-1 ring-primary/15 dark:from-primary/35 dark:to-primary/10">
                {s.step}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold tracking-tight text-foreground">
                  {s.label}
                </span>
                <span className="mt-0.5 block text-2xs text-muted-foreground">
                  {s.hint}
                </span>
              </span>
            </Link>
            {i < STEPS.length - 1 ? (
              <ChevronRight
                className="hidden size-4 shrink-0 text-primary/35 md:block"
                aria-hidden
              />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
