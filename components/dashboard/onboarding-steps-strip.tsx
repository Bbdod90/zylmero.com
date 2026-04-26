import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingStepUi } from "@/lib/dashboard/readiness";

function StepBlock({
  n,
  title,
  hint,
  href,
  cta,
  status,
}: {
  n: 1 | 2 | 3;
  title: string;
  hint: string;
  href: string;
  cta: string;
  status: OnboardingStepUi;
}) {
  const done = status === "done";
  const current = status === "current";
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex min-h-[5.5rem] flex-1 flex-col justify-between rounded-2xl border p-4 shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
        done &&
          "border-emerald-500/35 bg-gradient-to-br from-emerald-500/[0.08] to-card dark:border-emerald-500/25",
        current &&
          "border-primary/40 bg-gradient-to-br from-primary/[0.12] to-card ring-1 ring-primary/20 dark:from-primary/[0.18]",
        status === "upcoming" &&
          "border-border/50 bg-muted/15 opacity-90 dark:border-white/[0.08]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            done && "bg-emerald-500 text-white",
            current && "bg-primary text-primary-foreground",
            status === "upcoming" && "border border-border/70 bg-background text-muted-foreground",
          )}
        >
          {done ? <Check className="size-4" strokeWidth={2.5} aria-hidden /> : n}
        </span>
        {status !== "upcoming" ? (
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden
          />
        ) : null}
      </div>
      <div className="mt-2 min-w-0">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
          Stap {n}
        </p>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-snug text-muted-foreground">{hint}</p>
        {status !== "upcoming" ? (
          <p className="mt-2 text-xs font-semibold text-primary">{cta} →</p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Eerst vorige stap afronden</p>
        )}
      </div>
    </Link>
  );
}

/** Zelfde drie stappen op dashboard, berichten en koppelingen. */
export function OnboardingStepsStrip({
  onboarding,
  className,
}: {
  onboarding: {
    ai: OnboardingStepUi;
    channel: OnboardingStepUi;
    live: OnboardingStepUi;
  };
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Jouw route in drie stappen
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
        <StepBlock
          n={1}
          title="Assistent trainen"
          hint="Jouw aanbod en toon — zodat antwoorden kloppen."
          href="/dashboard/ai-knowledge"
          cta="Naar kennis"
          status={onboarding.ai}
        />
        <StepBlock
          n={2}
          title="Kanaal koppelen"
          hint="WhatsApp, website of e-mail — waar klanten je vinden."
          href="/dashboard/ai-koppelingen"
          cta="Koppelingen"
          status={onboarding.channel}
        />
        <StepBlock
          n={3}
          title="Live gaan"
          hint="Controleer berichten en plan je eerste opvolging."
          href="/dashboard/inbox"
          cta="Open berichten"
          status={onboarding.live}
        />
      </div>
    </div>
  );
}
