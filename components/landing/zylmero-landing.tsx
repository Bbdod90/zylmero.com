"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { LandingComparisonSection } from "@/components/landing/landing-comparison-section";
import { LandingFaqSection } from "@/components/landing/landing-faq-section";
import { LandingFinalCtaSection } from "@/components/landing/landing-final-cta-section";
import { LandingHeroDashboardPreview } from "@/components/landing/landing-hero-dashboard-preview";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingOutcomesSection } from "@/components/landing/landing-outcomes-section";
import { LandingPainCostSection } from "@/components/landing/landing-pain-cost-section";
import { LandingPlatformBento } from "@/components/landing/landing-platform-bento";
import { LandingProductTour } from "@/components/landing/landing-product-tour";
import { LandingSolutionSection } from "@/components/landing/landing-solution-section";
import { LandingStatsStrip } from "@/components/landing/landing-stats-strip";
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

const CHANNEL_BADGES = ["WhatsApp", "Website", "E-mail"] as const;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-56px" },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

const LANDING_MAX = "mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8";

export function ZylmeroLanding() {
  return (
    <div className="relative min-h-dvh zm-landing-atmosphere overflow-x-hidden pb-36 text-foreground md:pb-32">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 zm-landing-spotlight opacity-90 dark:opacity-100" />
        <div className="absolute inset-0 zm-landing-edge-glow opacity-70 dark:opacity-90" />
        <div className="absolute inset-0 zm-landing-radial-fade opacity-75" />
        <div className="absolute inset-0 zm-landing-dots opacity-[0.55] dark:opacity-[0.42]" />
      </div>

      <div className="relative z-10">
        <LandingNav />

        {/* Hero */}
        <section className="border-b border-border/50 dark:border-white/[0.09]">
          <div className={cn(LANDING_MAX, "grid gap-16 py-24 md:gap-24 md:py-36 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-14")}>
            <motion.div {...fadeUp}>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{POSITIONING}</p>
              <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.038em] sm:text-5xl md:text-[3.25rem] lg:text-[3.95rem]">
                <span className="zm-text-gradient block">Elke gemiste aanvraag</span>
                <span className="mt-2 block text-foreground">kost je geld</span>
              </h1>
              <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl md:leading-relaxed">
                {BRAND_NAME} vangt elke klantvraag op, beantwoordt meteen met context, en zet serieuze leads om in concrete
                afspraken — zonder dat jij 24/7 bereikbaar hoeft te zijn.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {CHANNEL_BADGES.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border/55 bg-card/70 px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.05]"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-[3.25rem] rounded-full px-10 text-[15px] font-semibold shadow-[0_2px_24px_-8px_hsl(var(--primary)/0.55)] sm:h-14 sm:px-11"
                >
                  <Link href="/signup">Start gratis</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-[3.25rem] w-full rounded-full border-border/65 bg-background/70 px-10 text-[15px] font-semibold backdrop-blur-md sm:h-14 sm:w-auto dark:border-white/[0.16] dark:bg-white/[0.04]"
                >
                  <Link href="#demo">
                    Product tour
                    <ArrowRight className="ml-2 size-4 opacity-80" aria-hidden />
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
              <LandingHeroDashboardPreview />
            </motion.div>
          </div>
        </section>

        <LandingStatsStrip />

        <div className="border-b border-border/45 bg-muted/25 dark:border-white/[0.07] dark:bg-white/[0.03]">
          <LandingPainCostSection className="border-t-0" />
        </div>

        <LandingSolutionSection />

        <LandingPlatformBento />

        <motion.section
          id="hoe-het-werkt"
          className="scroll-mt-28 border-t border-border/45 bg-muted/15 py-28 md:py-36 dark:border-white/[0.08] dark:bg-white/[0.02]"
          {...fadeUp}
        >
          <div className={cn(LANDING_MAX, "max-w-[720px]")}>
            <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Proces</p>
            <h2 className="mt-4 text-center text-balance text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-5xl md:leading-[1.06]">
              Hoe het werkt
            </h2>
            <ol className="relative mt-16">
              <div
                className="pointer-events-none absolute left-[19px] top-8 bottom-8 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent md:left-[21px]"
                aria-hidden
              />
              {HOW_STEPS.map((line, i) => (
                <li key={line} className="relative flex gap-5 pb-12 last:pb-0 md:gap-7 md:pb-14">
                  <span className="relative z-[1] flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-background font-mono text-sm font-semibold tabular-nums text-primary shadow-[0_0_20px_-8px_hsl(var(--primary)/0.5)] dark:border-primary/35 dark:bg-[hsl(222_35%_9%)] dark:text-primary">
                    {i + 1}
                  </span>
                  <span className="pt-1.5 text-lg font-medium leading-snug text-foreground md:text-xl">{line}</span>
                </li>
              ))}
            </ol>
          </div>
        </motion.section>

        <LandingOutcomesSection />

        <LandingProductTour />

        <LandingUseCasesSection />

        <LandingComparisonSection />

        <motion.section
          id="prijzen"
          className="scroll-mt-28 border-t border-border/45 bg-muted/20 py-28 md:py-36 dark:border-white/[0.08] dark:bg-white/[0.03]"
          {...fadeUp}
        >
          <div className={LANDING_MAX}>
            <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Abonnementen</p>
            <h2 className="mt-4 text-center text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-5xl">Prijzen</h2>
            <p className="mx-auto mt-5 max-w-lg text-center text-lg text-muted-foreground">Start klein, schaal wanneer nodig.</p>
            <div className="mx-auto mt-16 grid max-w-[1040px] gap-5 md:grid-cols-3 md:gap-6">
              {BILLING_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "cf-landing-pro-card flex flex-col p-8 transition-all duration-300 md:p-9",
                    "hover:-translate-y-1",
                    plan.popular && "cf-landing-feature-ring md:scale-[1.03]",
                  )}
                >
                  {plan.popular ? (
                    <span className="mb-5 inline-flex w-fit rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
                      Populair
                    </span>
                  ) : (
                    <span className="mb-5 block h-7" aria-hidden />
                  )}
                  <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                  <p className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-[-0.04em] tabular-nums text-foreground md:text-[2.75rem]">
                      €{plan.priceEur}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">/mnd</span>
                  </p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">{plan.leadCapLabel}</p>
                  <ul className="mt-10 flex-1 space-y-3.5 text-[15px] leading-snug text-foreground">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-3 text-[15px] text-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={cn(
                      "mt-10 h-12 w-full rounded-full text-[15px] font-semibold",
                      plan.popular ? "" : "border-border/65 dark:border-white/[0.14]",
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

        <LandingFaqSection />

        <LandingFinalCtaSection />

        <footer className="border-t border-border/50 bg-muted/10 py-16 dark:border-white/[0.1] dark:bg-transparent">
          <div className={cn(LANDING_MAX, "flex flex-col items-center justify-between gap-10 md:flex-row")}>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-md ring-1 ring-black/10 dark:ring-white/15">
                {BRAND_LOGO_MONOGRAM}
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-foreground">{BRAND_NAME}</span>
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
              <a href="#faq" className="transition-colors hover:text-foreground">
                FAQ
              </a>
            </nav>
          </div>
        </footer>

        <StickyConversionBar />
      </div>
    </div>
  );
}
