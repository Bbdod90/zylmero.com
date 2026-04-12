"use client";

import Link from "next/link";
import {
  Ban,
  BellOff,
  Coins,
  EyeOff,
  MessageSquareOff,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";

const BEFORE = [
  {
    icon: MessageSquareOff,
    text: "Te laat = klant boekt bij concurrent",
  },
  {
    icon: BellOff,
    text: "Aanvragen verdwijnen — geen factuur",
  },
  {
    icon: EyeOff,
    text: "Geen zicht op welke lead € oplevert",
  },
  {
    icon: Ban,
    text: "Gemiste omzet zie je nooit terug",
  },
];

const AFTER = [
  {
    icon: Zap,
    text: "Eerste reactie binnen seconden",
  },
  {
    icon: Sparkles,
    text: "Opvolging die niet blijft liggen",
  },
  {
    icon: TrendingUp,
    text: "Meer geboekte afspraken",
  },
  {
    icon: Coins,
    text: "Meer euro’s uit dezelfde aanvragen",
  },
];

export function BeforeAfterComparison() {
  return (
    <section className="border-b border-border/50 py-16 dark:border-white/5 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Voor en na
          </p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            Chaos kost geld — structuur pakt omzet
          </h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
            Zelfde aantal aanvragen. Minder lekken. Meer geboekte klussen — omdat je
            eerder wint dan de concurrent.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 md:gap-8">
          <div
            className={cn(
              "rounded-[1.35rem] border border-red-500/15 bg-gradient-to-b from-red-500/[0.04] to-transparent p-6 sm:p-8",
            )}
          >
            <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-red-500/90">
              Zonder systeem
            </p>
            <ul className="mt-8 space-y-4">
              {BEFORE.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-4 rounded-2xl border border-red-500/10 bg-background/40 px-4 py-3.5"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500/90">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-sm font-medium leading-snug text-foreground">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={cn(
              "rounded-[1.35rem] border border-primary/20 bg-gradient-to-b from-primary/[0.06] via-card/80 to-primary/[0.03] p-6 shadow-[0_20px_50px_-32px_hsl(var(--primary)/0.35)] sm:p-8",
            )}
          >
            <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Met {BRAND_NAME}
            </p>
            <ul className="mt-8 space-y-4">
              {AFTER.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-background/50 px-4 py-3.5 backdrop-blur-sm"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold leading-snug text-foreground">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
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
