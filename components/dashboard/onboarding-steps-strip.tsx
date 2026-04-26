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
        "group relative flex min-h-[7.5rem] flex-1 flex-col rounded-2xl border p-5 transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "hover:-translate-y-1 hover:shadow-[0_20px_48px_-28px_hsl(222_47%_11%/0.22)]",
        done &&
          "border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.09] via-card to-card shadow-[0_1px_0_0_hsl(0_0%_100%/0.5)_inset] dark:border-emerald-500/20 dark:from-emerald-500/[0.12] dark:shadow-none",
        current &&
          "border-primary/35 bg-gradient-to-br from-primary/[0.14] via-card to-card shadow-[0_18px_44px_-24px_hsl(var(--primary)/0.45),0_1px_0_0_hsl(0_0%_100%/0.45)_inset] ring-1 ring-primary/15 dark:from-primary/[0.2] dark:ring-primary/25",
        status === "upcoming" &&
          "border-border/50 bg-muted/[0.35] opacity-[0.92] shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold tabular-nums shadow-sm",
            done && "bg-emerald-600 text-white ring-1 ring-emerald-700/20",
            current && "bg-primary text-primary-foreground ring-1 ring-black/5 dark:ring-white/10",
            status === "upcoming" &&
              "border border-border/60 bg-background/90 text-muted-foreground dark:border-white/[0.12]",
          )}
        >
          {done ? <Check className="size-[1.05rem]" strokeWidth={2.75} aria-hidden /> : n}
        </span>
        {status !== "upcoming" ? (
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground/70 opacity-0 transition duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden
          />
        ) : null}
      </div>
      <div className="mt-4 min-w-0">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Stap {n}</p>
        <p className="mt-1.5 text-[0.9375rem] font-semibold leading-snug tracking-tight text-foreground">{title}</p>
        <p className="mt-2 text-xs font-medium leading-relaxed text-foreground/65 sm:text-[0.8125rem]">{hint}</p>
        {status !== "upcoming" ? (
          <p className="mt-3 text-xs font-semibold text-primary">{cta}</p>
        ) : (
          <p className="mt-3 text-xs font-medium text-muted-foreground">Volgt zodra de vorige stap af is.</p>
        )}
      </div>
    </Link>
  );
}

/** Zelfde drie stappen op dashboard, berichten en koppelingen — rustig ritme voor ondernemers. */
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
    <div
      className={cn(
        "rounded-[1.5rem] border border-border/50 bg-gradient-to-b from-card/95 to-muted/[0.2] p-5 shadow-[0_24px_64px_-40px_hsl(222_47%_11%/0.2)] sm:p-6",
        "dark:border-white/[0.09] dark:from-[hsl(222_28%_12%/0.55)] dark:to-transparent dark:shadow-[0_28px_70px_-40px_rgb(0_0_0/0.5)]",
        className,
      )}
    >
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Route</p>
          <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl">
            In drie duidelijke stappen klaar
          </p>
        </div>
        <p className="max-w-md text-xs font-medium leading-relaxed text-foreground/60 sm:text-right sm:text-sm">
          Je hoeft niet alles tegelijk te doen. Werk van boven naar beneden — dan bouwt Zylmero automatisch mee.
        </p>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
        <StepBlock
          n={1}
          title="Website koppelen"
          hint="Eén bedrijfswebsite — we lezen je pagina’s en je bot antwoordt op basis van jouw site."
          href="/dashboard/chatbot#kennis"
          cta="Naar je chatbot →"
          status={onboarding.ai}
        />
        <StepBlock
          n={2}
          title="Kanalen koppelen"
          hint="WhatsApp, websitechat of e-mail — waar jouw klanten jou al zoeken, daar vang je ze op."
          href="/dashboard/ai-koppelingen"
          cta="Naar koppelingen →"
          status={onboarding.channel}
        />
        <StepBlock
          n={3}
          title="Live gaan & opvolgen"
          hint="Controleer je berichten, beantwoord snel, en plan meteen een vervolgstap — daar wint elke zaak mee."
          href="/dashboard/inbox"
          cta="Naar berichten →"
          status={onboarding.live}
        />
      </div>
    </div>
  );
}
