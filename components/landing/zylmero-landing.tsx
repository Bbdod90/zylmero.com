"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { HeroInboxMock } from "@/components/landing/hero-inbox-mock";
import { LandingFinalCtaSection } from "@/components/landing/landing-final-cta-section";
import { LandingInteractiveChat } from "@/components/landing/landing-interactive-chat";
import { LandingMissedRevenueEstimator } from "@/components/landing/landing-missed-revenue-estimator";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingOutcomesSection } from "@/components/landing/landing-outcomes-section";
import { LandingPainCostSection } from "@/components/landing/landing-pain-cost-section";
import { LandingSolutionSection } from "@/components/landing/landing-solution-section";
import { LandingTrustSection } from "@/components/landing/landing-trust-section";
import { StickyConversionBar } from "@/components/landing/sticky-conversion-bar";
import { Button } from "@/components/ui/button";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { BRAND_CONTACT_EMAIL, BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const HERO_H1 = "Je mist klanten. Elke dag.";

const HERO_SUB = "Zylmero reageert direct en volgt aanvragen op terwijl jij werkt.";

const DEMO_BELOW = [
  "Reageert binnen seconden",
  "Volgt automatisch op",
  "Zet om in afspraken",
] as const;

const HOW_LINES = [
  "Klant stuurt bericht",
  "Zylmero reageert",
  "Gesprek loopt door",
  "Jij sluit de deal",
] as const;

const FAQ_ITEMS = [
  {
    q: "Wat doet het?",
    a: "Reageert op aanvragen. Houdt overzicht. Volgt op. Jij sluit af.",
  },
  {
    q: "Werkt het automatisch?",
    a: "Ja — binnen wat jij instelt. Jij houdt de regels.",
  },
  {
    q: "Voor wie is dit?",
    a: "Zzp en kleine bedrijven met aanvragen via mail, WhatsApp of site.",
  },
  {
    q: "Kan ik stoppen?",
    a: "Ja. Maandelijks opzegbaar.",
  },
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
};

export function ZylmeroLanding() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background pb-24 text-foreground md:pb-20">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.06),transparent_55%)] dark:opacity-90"
        aria-hidden
      />
      <LandingNav />

      {/* Hero */}
      <section className="border-b border-border/30 dark:border-white/[0.06]">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-4 py-16 md:gap-16 md:px-8 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div {...fadeUp}>
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl md:leading-[1.02]">
              {HERO_H1}
            </h1>
            <p className="mt-6 max-w-md text-lg font-medium leading-snug text-muted-foreground md:text-xl">
              {HERO_SUB}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-14 rounded-xl px-8 text-base font-semibold sm:h-16 sm:text-lg">
                <Link href="/signup">Start gratis</Link>
              </Button>
              <AnonymousDemoForm className="w-full sm:w-auto">
                <Button
                  type="submit"
                  size="lg"
                  variant="outline"
                  className="h-14 w-full rounded-xl border-2 border-primary/30 px-8 text-base font-semibold sm:h-16 sm:w-auto sm:text-lg"
                >
                  Bekijk demo
                  <ArrowRight className="ml-2 size-4" aria-hidden />
                </Button>
              </AnonymousDemoForm>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">Geen creditcard · Binnen minuten actief</p>
          </motion.div>
          <div className="relative lg:pl-4">
            <div className="overflow-hidden rounded-2xl border border-border/50 shadow-xl dark:border-white/[0.1]">
              <HeroInboxMock />
            </div>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="scroll-mt-24 border-b border-border/30 py-20 md:py-28 dark:border-white/[0.06]">
        <div className="mx-auto max-w-[720px] px-4 text-center md:px-8">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Dit gebeurt terwijl jij bezig bent
          </h2>
        </div>
        <LandingInteractiveChat showMarketingHeader={false} />
        <div className="mx-auto mt-10 max-w-xl px-4 md:px-8">
          <ul className="flex flex-col gap-2 text-center text-lg font-semibold text-foreground sm:flex-row sm:justify-center sm:gap-8 md:text-xl">
            {DEMO_BELOW.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <LandingPainCostSection />
      <LandingSolutionSection />

      {/* Hoe */}
      <motion.section
        id="hoe-het-werkt"
        className="scroll-mt-24 border-b border-border/30 py-20 md:py-28 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[720px] px-4 md:px-8">
          <h2 className="text-center text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Zo simpel is het
          </h2>
          <ol className="mt-14 space-y-5 text-center text-xl font-semibold text-foreground md:text-2xl">
            {HOW_LINES.map((line, i) => (
              <li key={line} className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-4">
                <span className="text-primary tabular-nums">{i + 1}.</span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </div>
      </motion.section>

      <LandingOutcomesSection />

      {/* Prijzen */}
      <motion.section id="prijzen" className="scroll-mt-24 border-b border-border/30 py-20 md:py-28 dark:border-white/[0.06]" {...fadeUp}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <div id="indicatie" className="scroll-mt-24">
            <LandingMissedRevenueEstimator className="mb-8" />
          </div>
          <p className="mb-10 text-center text-lg font-semibold text-foreground md:text-xl">
            1 extra klant = vaak al terugverdiend
          </p>
          <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {BILLING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-2xl border p-6 md:p-8",
                  plan.popular
                    ? "border-primary/45 bg-primary/[0.07] ring-1 ring-primary/20 dark:bg-primary/[0.09]"
                    : "border-border/45 bg-card/50 dark:border-white/[0.08]",
                )}
              >
                {plan.popular ? (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    Populair
                  </span>
                ) : null}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-bold tabular-nums">€{plan.priceEur}</span>
                  <span className="text-muted-foreground">/mnd</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{plan.leadCapLabel}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 h-12 w-full rounded-xl font-semibold" variant={plan.popular ? "default" : "outline"}>
                  <Link href="/signup">Start gratis</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <LandingTrustSection />

      <motion.section id="faq" className="scroll-mt-24 border-b border-border/30 py-20 md:py-28 dark:border-white/[0.06]" {...fadeUp}>
        <div className="mx-auto max-w-xl px-4 md:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground md:text-4xl">FAQ</h2>
          <div className="mt-10 space-y-2">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border/40 bg-card/30 open:bg-card/50 dark:border-white/[0.08]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-left font-semibold text-foreground">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="border-t border-border/30 px-4 pb-3.5 pt-2 text-sm text-muted-foreground dark:border-white/[0.06]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </motion.section>

      <LandingFinalCtaSection />

      <footer className="border-t border-border/40 py-10 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold">
              {BRAND_LOGO_MONOGRAM}
            </div>
            <span className="font-semibold">{BRAND_NAME}</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <Link href="/login">Inloggen</Link>
            <a href={`mailto:${BRAND_CONTACT_EMAIL}`}>Contact</a>
            <a href="#prijzen">Prijzen</a>
          </nav>
        </div>
      </footer>

      <StickyConversionBar />
    </div>
  );
}
