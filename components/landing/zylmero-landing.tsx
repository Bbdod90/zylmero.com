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
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-56px" },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

const LANDING_MAX = "mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8";

export function ZylmeroLanding() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background pb-32 text-foreground md:pb-28">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 zm-landing-radial-fade" />
        <div className="absolute inset-0 zm-landing-dots opacity-[0.65] dark:opacity-50" />
      </div>

      <div className="relative z-10">
        <LandingNav />

        {/* 1 — Hero */}
        <section className="border-b border-border/50 dark:border-white/[0.07]">
          <div className={cn(LANDING_MAX, "grid gap-16 py-24 md:gap-20 md:py-32 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16")}>
            <motion.div {...fadeUp}>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {POSITIONING}
              </p>
              <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl md:text-6xl lg:text-[3.65rem]">
                Elke gemiste aanvraag kost je geld
              </h1>
              <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl md:leading-[1.55]">
                Zylmero reageert automatisch op elke klantvraag, filtert serieuze leads en plant afspraken in — zonder dat
                jij continu online hoeft te zijn.
              </p>
              <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full px-9 text-[15px] font-semibold shadow-md sm:h-[3.25rem] sm:px-10"
                >
                  <Link href="/signup">Start gratis</Link>
                </Button>
                <AnonymousDemoForm className="w-full sm:w-auto">
                  <Button
                    type="submit"
                    size="lg"
                    variant="outline"
                    className="h-12 w-full rounded-full border-border/70 bg-background/60 px-9 text-[15px] font-semibold backdrop-blur-sm sm:h-[3.25rem] sm:w-auto dark:border-white/[0.14] dark:bg-white/[0.03]"
                  >
                    Bekijk demo
                    <ArrowRight className="ml-2 size-4 opacity-80" aria-hidden />
                  </Button>
                </AnonymousDemoForm>
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
              <LandingHeroProductVisual />
            </motion.div>
          </div>
        </section>

        <div className="border-b border-border/40 bg-muted/[0.35] dark:border-white/[0.06] dark:bg-white/[0.02]">
          <LandingPainCostSection className="border-t-0" />
        </div>

        <LandingSolutionSection />

        <motion.section
          id="hoe-het-werkt"
          className="scroll-mt-28 border-t border-border/40 bg-muted/[0.2] py-28 md:py-36 dark:border-white/[0.06] dark:bg-white/[0.02]"
          {...fadeUp}
        >
          <div className={cn(LANDING_MAX, "max-w-[680px]")}>
            <h2 className="text-center text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-5xl md:leading-[1.08]">
              Hoe het werkt
            </h2>
            <ol className="mt-16 space-y-0">
              {HOW_STEPS.map((line, i) => (
                <li
                  key={line}
                  className="group relative flex gap-5 border-b border-border/45 py-7 last:border-0 dark:border-white/[0.08] md:gap-6 md:py-8"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card font-mono text-sm font-semibold tabular-nums text-foreground shadow-sm dark:border-white/[0.1] dark:bg-[hsl(228_26%_10%)]">
                    {i + 1}
                  </span>
                  <span className="pt-1.5 text-lg font-medium leading-snug text-foreground md:text-xl">{line}</span>
                </li>
              ))}
            </ol>
          </div>
        </motion.section>

        <LandingOutcomesSection />

        <div id="demo" className="scroll-mt-28 border-t border-border/40 dark:border-white/[0.06]">
          <div className={cn(LANDING_MAX, "pt-24 md:pt-32")}>
            <h2 className="mx-auto max-w-3xl text-balance text-center text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-5xl md:leading-[1.08]">
              Van bericht tot afspraak
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-center font-mono text-[13px] text-muted-foreground md:text-sm">
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

        <LandingUseCasesSection />

        <motion.section
          id="prijzen"
          className="scroll-mt-28 border-t border-border/40 bg-muted/[0.25] py-28 md:py-36 dark:border-white/[0.06] dark:bg-white/[0.02]"
          {...fadeUp}
        >
          <div className={LANDING_MAX}>
            <h2 className="text-center text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-5xl">Prijzen</h2>
            <p className="mx-auto mt-5 max-w-lg text-center text-lg text-muted-foreground">Start klein, schaal wanneer nodig.</p>
            <div className="mx-auto mt-16 grid max-w-[1040px] gap-5 md:grid-cols-3 md:gap-6">
              {BILLING_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "cf-landing-pro-card flex flex-col p-8 transition-transform duration-300 md:p-9",
                    "hover:-translate-y-0.5",
                    plan.popular && "ring-1 ring-primary/25 dark:ring-primary/35",
                  )}
                >
                  {plan.popular ? (
                    <span className="mb-5 inline-flex w-fit rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                      Populair
                    </span>
                  ) : (
                    <span className="mb-5 block h-7" aria-hidden />
                  )}
                  <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                  <p className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-[-0.03em] tabular-nums md:text-[2.75rem]">
                      €{plan.priceEur}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">/mnd</span>
                  </p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">{plan.leadCapLabel}</p>
                  <ul className="mt-10 flex-1 space-y-3.5 text-[15px] leading-snug text-foreground">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-3">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary opacity-90" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={cn(
                      "mt-10 h-12 w-full rounded-full text-[15px] font-semibold",
                      plan.popular ? "" : "border-border/70 dark:border-white/[0.12]",
                    )}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    <Link href="/signup">Start gratis</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <LandingFinalCtaSection />

        <footer className="border-t border-border/50 py-16 dark:border-white/[0.08]">
          <div className={cn(LANDING_MAX, "flex flex-col items-center justify-between gap-10 md:flex-row")}>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                {BRAND_LOGO_MONOGRAM}
              </div>
              <span className="text-[15px] font-semibold tracking-tight">{BRAND_NAME}</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm font-medium text-muted-foreground">
              <Link href="/login" className="transition-colors hover:text-foreground">
                Inloggen
              </Link>
              <a href={`mailto:${BRAND_CONTACT_EMAIL}`} className="transition-colors hover:text-foreground">
                Contact
              </a>
              <a href="#prijzen" className="transition-colors hover:text-foreground">
                Prijzen
              </a>
            </nav>
          </div>
        </footer>

        <StickyConversionBar />
      </div>
    </div>
  );
}
