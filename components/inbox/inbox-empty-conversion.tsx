import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { OnboardingStepsStrip } from "@/components/dashboard/onboarding-steps-strip";
import type { OnboardingStepUi } from "@/lib/dashboard/readiness";
import { cn } from "@/lib/utils";

function Bubble({
  side,
  label,
  children,
}: {
  side: "left" | "right";
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-[min(100%,26rem)] rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-sm",
        side === "left" &&
          "border border-border/50 bg-background/95 text-foreground ring-1 ring-black/[0.03] dark:border-white/[0.1] dark:bg-[hsl(222_28%_11%/0.92)] dark:ring-white/[0.04]",
        side === "right" &&
          "ml-auto border border-primary/20 bg-gradient-to-br from-primary/[0.14] to-primary/[0.06] text-foreground ring-1 ring-primary/10 dark:from-primary/[0.22] dark:to-primary/[0.08]",
      )}
    >
      <p
        className={cn(
          "text-[0.65rem] font-semibold uppercase tracking-[0.18em]",
          side === "left" ? "text-muted-foreground" : "text-primary",
        )}
      >
        {label}
      </p>
      <div className="mt-1.5 font-medium leading-snug text-foreground/95">{children}</div>
    </div>
  );
}

export function InboxEmptyConversion({
  onboarding,
}: {
  onboarding: {
    ai: OnboardingStepUi;
    channel: OnboardingStepUi;
    live: OnboardingStepUi;
  };
}) {
  return (
    <div className="space-y-10">
      <OnboardingStepsStrip onboarding={onboarding} />

      <div
        className={cn(
          "relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-card p-6 shadow-[0_28px_80px_-48px_hsl(222_47%_11%/0.28)] sm:p-9",
          "dark:border-white/[0.1] dark:bg-[linear-gradient(180deg,hsl(222_30%_12%/0.97)_0%,hsl(225_32%_9%/0.99)_100%)] dark:shadow-[0_32px_90px_-44px_rgb(0_0_0/0.55)]",
        )}
      >
        <div
          className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-primary/[0.07] blur-3xl"
          aria-hidden
        />

        <div className="relative flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <MessageCircle className="size-[1.125rem]" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Voorbeeld</p>
            <h2 className="mt-0.5 text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl">
              Zo voelt het als de eerste klant reageert
            </h2>
          </div>
        </div>
        <p className="relative mt-3 max-w-2xl text-sm font-medium leading-relaxed text-foreground/65">
          Nog even geduld: zodra je een kanaal koppelt, zie je hier echte gesprekken. Onderstaand zie je hoe strak en
          professioneel een eerste uitwisseling kan lopen.
        </p>

        <div className="relative mt-8 space-y-4 rounded-2xl border border-border/40 bg-muted/25 p-5 sm:p-6 dark:border-white/[0.08] dark:bg-white/[0.03]">
          <Bubble side="left" label="Klant">
            Wat kost schilderwerk bij jullie ongeveer?
          </Bubble>
          <Bubble side="right" label="Jouw assistent">
            Goede vraag — dat hangt af van de oppervlakte en het werk. Zal ik een offerte voor je voorbereiden op basis
            van je situatie?
          </Bubble>
        </div>

        <div className="relative mt-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] to-transparent p-6 text-center dark:border-primary/30 dark:from-primary/[0.12]">
          <p className="text-base font-semibold tracking-tight text-foreground">Klaar voor echte gesprekken?</p>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-foreground/65">
            Koppel WhatsApp, zet je websitechat live, of laat mail binnenlopen — dan hoeft niemand meer buiten de boot
            te vallen.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 h-12 rounded-2xl px-10 text-[0.9375rem] font-semibold shadow-[0_14px_36px_-18px_hsl(var(--primary)/0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Link href="/dashboard/ai-koppelingen">Kanalen instellen</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
