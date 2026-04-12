"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";

type Scenario = {
  id: string;
  inbound: string;
  aiReply: string;
  valueLabel: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "apk",
    inbound: "Kunnen jullie morgen nog APK doen?",
    aiReply: "Ja dat kan! Hoe laat komt het uit?",
    valueLabel: "€120 – €200",
  },
  {
    id: "banden",
    inbound: "Ik heb 4 winterbanden nodig — montage deze week?",
    aiReply:
      "Top, we plannen graag montage in. Welke maat en kenteken heb je?",
    valueLabel: "€280 – €420",
  },
  {
    id: "spoed",
    inbound: "Remmen maken een tikkend geluid — kan ik vandaag langskomen?",
    aiReply:
      "Dat pakken we serieus. Ik kan je om 15:00 laten inplannen — past dat?",
    valueLabel: "€150 – €340",
  },
];

export function LiveDemoSimulation() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fast = reduceMotion;
    const t0 = fast ? 50 : 80;
    const t1 = fast ? 220 : 1100;
    const t2 = fast ? 280 : 1200;
    const t3 = fast ? 1800 : 3200;

    setStep(0);
    const a = setTimeout(() => {
      if (!cancelled) setStep(1);
    }, t0);
    const b = setTimeout(() => {
      if (!cancelled) setStep(2);
    }, t0 + t1);
    const c = setTimeout(() => {
      if (!cancelled) setStep(3);
    }, t0 + t1 + t2);
    const d = setTimeout(() => {
      if (!cancelled) setScenarioIdx((i) => (i + 1) % SCENARIOS.length);
    }, t0 + t1 + t2 + t3);

    return () => {
      cancelled = true;
      clearTimeout(a);
      clearTimeout(b);
      clearTimeout(c);
      clearTimeout(d);
    };
  }, [scenarioIdx, reduceMotion]);

  const s = SCENARIOS[scenarioIdx]!;

  return (
    <section
      className="border-b border-border/50 py-16 dark:border-white/5 md:py-24"
      aria-label="Live demo simulatie"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Live demo simulatie
          </p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            Zo wordt een aanvraag omzet — terwijl jij op de klus zit
          </h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
            Nieuwe lead → direct antwoord → afspraak met zichtbare €-waarde. Zo voelt
            snelle opvolging voor je klant.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-lg">
          <div className="overflow-hidden rounded-[1.35rem] border border-white/[0.1] bg-gradient-to-b from-card via-card to-secondary/[0.05] shadow-[0_24px_56px_-28px_rgba(0,0,0,0.45),0_0_0_1px_hsl(var(--primary)/0.08)] ring-1 ring-white/[0.06] [contain:layout]">
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.55)]" />
                <span className="text-xs font-bold text-muted-foreground">
                  Inbox · live · omzetmodus
                </span>
              </div>
              <span className="rounded-full border border-primary/25 bg-primary/12 px-2.5 py-0.5 text-[11px] font-extrabold text-primary shadow-[0_0_16px_-4px_hsl(var(--primary)/0.45)]">
                € focus aan
              </span>
            </div>

            {/* Vaste rijen + alleen opacity: geen verticale slide, geen hoogteverschil bij scenario-wissel */}
            <div className="space-y-3 p-4 sm:p-5">
              <div
                className={cn(
                  "min-h-[7.25rem] transition-opacity duration-500 ease-out motion-reduce:transition-none",
                  step >= 1 ? "opacity-100" : "opacity-0",
                )}
              >
                <div className="flex justify-end">
                  <div className="max-w-[92%] rounded-2xl rounded-br-md bg-zinc-200/90 px-4 py-3 text-sm leading-relaxed text-zinc-900 shadow-sm dark:bg-zinc-700/90 dark:text-zinc-50">
                    {s.inbound}
                  </div>
                </div>
                <p className="mt-1.5 text-right text-[10px] font-semibold text-muted-foreground">
                  Nieuwe lead · potentieel €120–€600
                </p>
              </div>

              <div
                className={cn(
                  "min-h-[10.5rem] transition-opacity duration-500 ease-out motion-reduce:transition-none",
                  step >= 2 ? "opacity-100" : "opacity-0",
                )}
              >
                <div className="flex justify-start">
                  <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-primary/15 bg-primary/[0.08] px-4 py-3 text-sm leading-relaxed text-foreground">
                    <span className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      <Sparkles className="size-3" />
                      AI-reactie
                    </span>
                    {s.aiReply}
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "min-h-[6.25rem] transition-opacity duration-500 ease-out motion-reduce:transition-none",
                  step >= 3 ? "opacity-100" : "opacity-0",
                )}
              >
                <div className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.09] to-transparent p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <CalendarCheck className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-foreground">
                      Afspraak = omzet in de agenda
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Geschatte order:{" "}
                      <span className="font-extrabold tabular-nums text-primary">
                        {s.valueLabel}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-xl flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-2xl px-8 text-base font-bold shadow-lg shadow-primary/20"
          >
            <Link href="/signup">Start — pak je eerste klant</Link>
          </Button>
          <AnonymousDemoForm className="flex-1 sm:flex-initial">
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-2xl border-2 px-8 text-base font-bold"
            >
              Zie hoe het werkt
            </Button>
          </AnonymousDemoForm>
        </div>
      </div>
    </section>
  );
}
