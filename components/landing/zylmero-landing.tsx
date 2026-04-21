"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { LandingFinalCtaSection } from "@/components/landing/landing-final-cta-section";
import { LandingHeroProductVisual } from "@/components/landing/landing-hero-product-visual";
import { LandingInteractiveChat } from "@/components/landing/landing-interactive-chat";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingOutcomesSection } from "@/components/landing/landing-outcomes-section";
import { LandingPainCostSection } from "@/components/landing/landing-pain-cost-section";
import { LandingSolutionSection } from "@/components/landing/landing-solution-section";
import { LandingUseCasesSection } from "@/components/landing/landing-use-cases-section";
import { StickyConversionBar } from "@/components/landing/sticky-conversion-bar";
import { Button } from "@/components/ui/button";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { BRAND_CONTACT_EMAIL, BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const POSITIONING = "Automatisch reageren op elke aanvraag — meer klanten binnenhalen zonder extra werk.";

const HOW_STEPS = [
  "Sluit je kanalen aan (WhatsApp, site, e-mail)",
  "AI reageert direct op klanten",
  "Jij focust alleen op serieuze aanvragen",
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

export function ZylmeroLanding() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background pb-28 text-foreground md:pb-24">
      <LandingNav />

      {/* 1 — Hero */}
      <section className="border-b border-border/40 dark:border-white/[0.06]">
        <div className="mx-auto grid max-w-[1120px] gap-16 px-4 py-20 md:gap-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div {...fadeUp}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{POSITIONING}</p>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[3.35rem] lg:leading-[1.02]">
              Elke gemiste aanvraag kost je geld
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
              Zylmero reageert automatisch op elke klantvraag, filtert serieuze leads en plant afspraken in — zonder dat
              jij continu online hoeft te zijn.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-12 rounded-lg px-8 text-base font-semibold sm:h-14">
                <Link href="/signup">Start gratis</Link>
              </Button>
              <AnonymousDemoForm className="w-full sm:w-auto">
                <Button
                  type="submit"
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-lg border-border/60 px-8 text-base font-semibold sm:h-14 sm:w-auto dark:border-white/[0.12]"
                >
                  Bekijk demo
                  <ArrowRight className="ml-2 size-4" aria-hidden />
                </Button>
              </AnonymousDemoForm>
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }}>
            <LandingHeroProductVisual />
          </motion.div>
        </div>
      </section>

      {/* 2 — Probleem */}
      <LandingPainCostSection />

      {/* 3 — Oplossing */}
      <LandingSolutionSection />

      {/* 4 — Hoe het werkt */}
      <motion.section
        id="hoe-het-werkt"
        className="scroll-mt-28 border-t border-border/40 py-24 md:py-32 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[640px] px-4 md:px-8">
          <h2 className="text-center text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
            Hoe het werkt
          </h2>
          <ol className="mt-14 space-y-6">
            {HOW_STEPS.map((line, i) => (
              <li key={line} className="flex gap-5 text-lg font-semibold text-foreground md:text-xl">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <span className="pt-1 leading-snug">{line}</span>
              </li>
            ))}
          </ol>
        </div>
      </motion.section>

      {/* 5 — Resultaten */}
      <LandingOutcomesSection />

      {/* 6 — Visuele demo */}
      <div id="demo" className="scroll-mt-28">
        <div className="mx-auto max-w-[1120px] px-4 pt-20 md:px-8 md:pt-28">
          <h2 className="mx-auto max-w-3xl text-balance text-center text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
            Van bericht tot afspraak
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base text-muted-foreground md:text-lg">
            Klant stuurt · AI antwoordt · Afspraak staat · Lead zichtbaar
          </p>
        </div>
        <LandingInteractiveChat
          showMarketingHeader={false}
          hideBottomCtas
          premiumEmbed
          hideQuickPrompts
        />
      </div>

      {/* 7 — Use cases */}
      <LandingUseCasesSection />

      {/* 8 — Prijs */}
      <motion.section id="prijzen" className="scroll-mt-28 border-t border-border/40 py-24 md:py-32 dark:border-white/[0.06]" {...fadeUp}>
        <div className="mx-auto max-w-[1000px] px-4 md:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground md:text-5xl">Prijzen</h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-lg text-muted-foreground">Start klein, schaal wanneer nodig.</p>
          <div className="mx-auto mt-14 grid gap-6 md:grid-cols-3">
            {BILLING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-2xl border p-8",
                  plan.popular
                    ? "border-foreground/15 bg-muted/30 dark:border-white/[0.12] dark:bg-white/[0.04]"
                    : "border-border/50 bg-background dark:border-white/[0.08]",
                )}
              >
                {plan.popular ? (
                  <span className="mb-4 w-fit rounded-md bg-foreground px-2.5 py-1 text-xs font-semibold text-background">Populair</span>
                ) : (
                  <span className="mb-4 block h-7" aria-hidden />
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-semibold tabular-nums tracking-tight">€{plan.priceEur}</span>
                  <span className="text-muted-foreground">/mnd</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.leadCapLabel}</p>
                <ul className="mt-8 flex-1 space-y-3 text-sm text-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-foreground opacity-70" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-10 h-11 w-full rounded-lg font-semibold" variant={plan.popular ? "default" : "outline"}>
                  <Link href="/signup">Start gratis</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 9 — Final CTA */}
      <LandingFinalCtaSection />

      <footer className="border-t border-border/40 py-12 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-8 px-4 md:flex-row md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              {BRAND_LOGO_MONOGRAM}
            </div>
            <span className="font-semibold">{BRAND_NAME}</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              Inloggen
            </Link>
            <a href={`mailto:${BRAND_CONTACT_EMAIL}`} className="hover:text-foreground">
              Contact
            </a>
            <a href="#prijzen" className="hover:text-foreground">
              Prijzen
            </a>
          </nav>
        </div>
      </footer>

      <StickyConversionBar />
    </div>
  );
}
