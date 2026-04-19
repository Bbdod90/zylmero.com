"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    description: "Live gaan met een duidelijke chatbot op één site.",
    popular: false,
    features: ["Basis chatbot voor veelgestelde vragen", "1 website", "Standaard antwoorden op maat van je branche"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    description: "Meer conversie: slimme flow en betere kwalificatie.",
    popular: true,
    features: ["Slimmere antwoorden op context", "Afspraken-flow ingebouwd", "Betere filtering van serieuze aanvragen"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    description: "Volledige grip: maatwerk en prioriteit als je groeit.",
    popular: false,
    features: ["Maatwerk in tone en scenario’s", "Meerdere flows (bijv. spoed vs. regulier)", "Prioriteit bij support"],
  },
] as const;

export function ChatbotPricing() {
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "relative flex flex-col rounded-2xl border p-6 md:p-7",
            plan.popular
              ? "z-[1] border-primary/40 bg-primary/[0.07] shadow-[0_24px_70px_-40px_hsl(var(--primary)/0.5)] ring-1 ring-primary/25 dark:bg-primary/[0.1] lg:scale-[1.02]"
              : "border-border/45 bg-card/50 shadow-[0_18px_50px_-38px_rgb(0_0_0/0.45)] dark:border-white/[0.09] dark:bg-white/[0.03] dark:shadow-black/50",
          )}
        >
          {plan.popular ? (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25">
              Meest gekozen
            </span>
          ) : null}
          <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
          <p className="mt-2 text-sm leading-snug text-muted-foreground">{plan.description}</p>
          <p className="mt-6">
            <span className="text-4xl font-bold tabular-nums md:text-5xl">€{plan.price}</span>
            <span className="text-muted-foreground">/mnd</span>
          </p>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-foreground">
            {plan.features.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          <Button
            asChild
            className={cn("mt-6 h-11 w-full rounded-xl text-sm font-semibold md:h-12")}
            variant={plan.popular ? "default" : "outline"}
          >
            <Link href="/signup">Start gratis</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
