import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { OnboardingStepsStrip } from "@/components/dashboard/onboarding-steps-strip";
import type { OnboardingStepUi } from "@/lib/dashboard/readiness";
import { cn } from "@/lib/utils";

function Bubble({
  side,
  children,
}: {
  side: "left" | "right";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-[92%] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[85%]",
        side === "left" &&
          "border-border/60 bg-muted/50 text-foreground dark:border-white/[0.1] dark:bg-white/[0.06]",
        side === "right" &&
          "ml-auto border-primary/25 bg-gradient-to-br from-primary/[0.12] to-primary/[0.06] text-foreground dark:border-primary/35",
      )}
    >
      {children}
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
    <div className="space-y-8">
      <OnboardingStepsStrip onboarding={onboarding} />

      <div
        className={cn(
          "overflow-hidden rounded-[1.25rem] border border-border/55 bg-card/95 p-5 shadow-md sm:p-8",
          "dark:border-white/[0.1] dark:bg-[hsl(222_28%_11%/0.94)]",
        )}
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <MessageCircle className="size-4 text-primary" aria-hidden />
          Voorbeeldgesprek
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Zo ziet een gesprek eruit zodra een kanaal live staat.
        </p>

        <div className="mt-6 space-y-4">
          <Bubble side="left">
            <p className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">Klant</p>
            <p className="mt-1 font-medium text-foreground">Wat kost schilderwerk bij jullie?</p>
          </Bubble>
          <Bubble side="right">
            <p className="text-2xs font-semibold uppercase tracking-wide text-primary">Assistent</p>
            <p className="mt-1 font-medium text-foreground">
              Dat hangt af van de oppervlakte en het werk. Wil je dat ik een offerte voor je voorbereid?
            </p>
          </Bubble>
        </div>

        <div className="mt-8 rounded-xl border border-primary/25 bg-primary/[0.06] p-5 text-center dark:border-primary/35 dark:bg-primary/[0.1]">
          <p className="text-sm font-semibold text-foreground">Koppel een kanaal om echte berichten te ontvangen</p>
          <p className="mt-1 text-xs text-muted-foreground">WhatsApp, websitechat of e-mail — binnen een paar minuten.</p>
          <Button
            asChild
            size="lg"
            className="mt-5 rounded-xl px-8 font-semibold shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link href="/dashboard/ai-koppelingen">Naar koppelingen</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
