"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { LandingFaqSection } from "@/components/landing/landing-faq-section";
import { LandingFinalCtaSection } from "@/components/landing/landing-final-cta-section";
import { LandingHeroConversation } from "@/components/landing/landing-hero-conversation";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingOutcomesSection } from "@/components/landing/landing-outcomes-section";
import { LandingPainCostSection } from "@/components/landing/landing-pain-cost-section";
import { LandingPlatformBento } from "@/components/landing/landing-platform-bento";
import { LandingProductTour } from "@/components/landing/landing-product-tour";
import { StickyConversionBar } from "@/components/landing/sticky-conversion-bar";
import { Button } from "@/components/ui/button";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { BRAND_CONTACT_EMAIL, BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const POSITIONING = "Aanvragen opvangen, direct antwoord, serieuze leads naar afspraak.";

const HOW_STEPS = [
  "Koppel WhatsApp, site en mail",
  "AI reageert meteen met context",
  "Jij pakt alleen deals die tellen",
] as const;

const CHANNEL_BADGES = ["WhatsApp", "Website", "E-mail"] as const;

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

const LANDING_MAX = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8";

export function ZylmeroLanding() {
  return (
    <div className="relative min-h-dvh zm-landing-atmosphere overflow-x-hidden pb-24 text-foreground md:pb-20">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 zm-landing-spotlight opacity-90 dark:opacity-100" />
        <div className="absolute inset-0 zm-landing-edge-glow opacity-70 dark:opacity-90" />
        <div className="absolute inset-0 zm-landing-radial-fade opacity-75" />
        <div className="absolute inset-0 zm-landing-dots opacity-[0.55] dark:opacity-[0.42]" />
      </div>
      <div className="zm-landing-grain-fixed" aria-hidden />

      <div className="relative z-10">
        <LandingNav />

        {/* Hero */}
        <section className="border-b border-border/50 dark:border-white/[0.09]">
          <div
            className={cn(
              LANDING_MAX,
              "grid gap-8 py-11 md:gap-10 md:py-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-9",
            )}
          >
            <motion.div {...fadeUp}>
              <p className="cf-landing-eyebrow">{POSITIONING}</p>
              <h1 className="mt-3 text-balance text-[2rem] font-semibold leading-[1.07] tracking-[-0.038em] sm:text-[2.35rem] md:text-[2.65rem] lg:text-[3rem]">
                <span className="zm-text-gradient block">Elke gemiste aanvraag</span>
                <span className="mt-1 block text-foreground">kost je geld</span>
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground md:text-[16px]">
                {BRAND_NAME} bundelt mail, WhatsApp en site, antwoordt direct met context en zet warme leads om in afspraken.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {CHANNEL_BADGES.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border/55 bg-card/70 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.05]"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full px-8 text-[14px] font-semibold shadow-[0_2px_20px_-6px_hsl(var(--primary)/0.55)] sm:h-[3rem] sm:px-10"
                >
                  <Link href="/signup">Start gratis</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full border-border/65 bg-background/70 px-8 text-[14px] font-semibold backdrop-blur-md sm:h-[3rem] sm:w-auto dark:border-white/[0.16] dark:bg-white/[0.04]"
                >
                  <Link href="#demo">
                    Product tour
                    <ArrowRight className="ml-2 size-4 opacity-80" aria-hidden />
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }}>
              <LandingHeroConversation />
            </motion.div>
          </div>
        </section>

        <LandingPainCostSection />

        <LandingPlatformBento />

        <motion.section
          id="hoe-het-werkt"
          className="scroll-mt-24 border-t border-border/45 bg-muted/12 py-9 md:py-11 dark:border-white/[0.08] dark:bg-white/[0.02]"
          {...fadeUp}
        >
          <div className={LANDING_MAX}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div>
                <p className="cf-landing-eyebrow">Proces</p>
                <h2 className="cf-landing-h2 mt-2 max-w-xl">Zo werkt het</h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Drie stappen — daarna draait het zonder dat jij 24/7 bereikbaar hoeft te zijn.
              </p>
            </div>
            <ol className="mt-6 grid gap-3 md:grid-cols-3 md:gap-4">
              {HOW_STEPS.map((line, i) => (
                <li key={line} className="cf-landing-pro-card p-5 md:p-5">
                  <span className="font-mono text-[11px] font-bold tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-2 text-[15px] font-medium leading-snug text-foreground">{line}</p>
                </li>
              ))}
            </ol>
          </div>
        </motion.section>

        <LandingOutcomesSection />

        <LandingProductTour />

        <motion.section
          id="prijzen"
          className="scroll-mt-24 border-t border-border/45 bg-muted/15 py-9 md:py-12 dark:border-white/[0.08] dark:bg-white/[0.03]"
          {...fadeUp}
        >
          <div className={LANDING_MAX}>
            <p className="cf-landing-eyebrow text-center">Abonnementen</p>
            <h2 className="cf-landing-h2 mx-auto mt-2 max-w-3xl text-center">Prijzen</h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground md:text-[15px]">Start klein, schaal mee.</p>
            <div className="mx-auto mt-7 grid max-w-[1040px] gap-3 md:grid-cols-3 md:gap-4">
              {BILLING_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "cf-landing-pro-card flex flex-col p-6 transition-all duration-300 md:p-7",
                    "hover:-translate-y-0.5",
                    plan.popular && "cf-landing-feature-ring md:scale-[1.02]",
                  )}
                >
                  {plan.popular ? (
                    <span className="mb-3 inline-flex w-fit rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                      Populair
                    </span>
                  ) : (
                    <span className="mb-3 block h-6" aria-hidden />
                  )}
                  <h3 className="text-base font-semibold tracking-tight">{plan.name}</h3>
                  <p className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold tracking-[-0.04em] tabular-nums text-foreground md:text-[2.25rem]">
                      €{plan.priceEur}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">/mnd</span>
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">{plan.leadCapLabel}</p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-[14px] leading-snug text-foreground">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2.5">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={cn(
                      "mt-8 h-11 w-full rounded-full text-[14px] font-semibold",
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

        <footer className="border-t border-border/50 bg-background/70 py-8 backdrop-blur-xl dark:border-white/[0.1] dark:bg-[hsl(222_40%_6%/0.65)]">
          <div className={cn(LANDING_MAX, "flex flex-col items-center justify-between gap-5 md:flex-row")}>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-[11px] font-bold text-primary-foreground shadow-md ring-1 ring-black/10 dark:ring-white/15">
                {BRAND_LOGO_MONOGRAM}
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">{BRAND_NAME}</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-muted-foreground">
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
