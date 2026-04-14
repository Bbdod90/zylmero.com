"use client";

import { Fragment } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Inbox,
  Layers,
  MessageCircle,
  Quote,
  Sparkles,
} from "lucide-react";
import { AnonymousDemoForm, useDemoRole } from "@/components/landing/demo-role-context";
import { HeroInboxMock } from "@/components/landing/hero-inbox-mock";
import { LandingInteractiveChat } from "@/components/landing/landing-interactive-chat";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingMissedRevenueEstimator } from "@/components/landing/landing-missed-revenue-estimator";
import { StickyConversionBar } from "@/components/landing/sticky-conversion-bar";
import { Button } from "@/components/ui/button";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { heroSubtitleForRole } from "@/lib/demo/hero-mock-copy";
import { BRAND_CONTACT_EMAIL, BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const HERO_H1 = "Je reageert te laat — en dat kost je klanten";

const HERO_TRUST = "Vaak terugverdiend met één extra afspraak";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

export function ZylmeroLanding() {
  const { demoRole } = useDemoRole();
  const heroSub = heroSubtitleForRole(demoRole, BRAND_NAME);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background pb-28 text-foreground md:pb-24">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_85%_55%_at_50%_-18%,hsl(var(--primary)/0.12),transparent_58%),radial-gradient(ellipse_55%_42%_at_100%_5%,hsl(var(--primary)/0.07),transparent_52%),radial-gradient(ellipse_50%_38%_at_0%_22%,hsl(220_35%_45%/0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.14),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_0%,hsl(var(--primary)/0.08),transparent_50%),radial-gradient(ellipse_50%_35%_at_0%_20%,hsl(220_40%_50%/0.06),transparent_50%)]"
        aria-hidden
      />
      <LandingNav />

      <section className="relative overflow-hidden border-b border-border/40 dark:border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_-25%,hsl(var(--primary)/0.14),transparent_58%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />

        <div className="relative mx-auto max-w-[1200px] px-4 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <motion.div {...fadeUp}>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-foreground">
              <Sparkles className="size-3.5 shrink-0 text-foreground" />
              {HERO_TRUST}
            </p>
            <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[2.875rem]">
              {HERO_H1}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground md:text-lg">
              {heroSub}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 min-h-[48px] rounded-xl px-7 text-base font-semibold sm:h-14 sm:min-h-[52px]"
              >
                <Link href="/signup">Start gratis</Link>
              </Button>
              <AnonymousDemoForm className="w-full sm:w-auto">
                <Button
                  type="submit"
                  size="lg"
                  variant="demo"
                  className="h-12 min-h-[48px] w-full rounded-xl px-7 text-base font-semibold sm:h-14 sm:min-h-[52px] sm:w-auto"
                >
                  Bekijk demo
                  <ArrowRight className="ml-2 size-4 opacity-90" />
                </Button>
              </AnonymousDemoForm>
            </div>
            <p className="mt-6 text-sm text-foreground">
              Geen creditcard · opzeggen wanneer je wilt
            </p>
          </motion.div>
          <div className="relative mt-16 lg:mt-0">
            <div
              className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-primary/[0.07] via-primary/[0.02] to-transparent blur-2xl dark:-inset-4 dark:from-primary/12 dark:via-primary/5 dark:to-transparent"
              aria-hidden
            />
            <div className="relative">
              <HeroInboxMock />
            </div>
          </div>
        </div>
      </section>

      <motion.section
        id="probleem"
        className="border-b border-border/40 bg-gradient-to-b from-muted/30 via-background to-background py-16 md:py-24 dark:border-white/[0.06] dark:from-white/[0.03] dark:via-background dark:to-background"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[960px] px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-primary">
              Herkenbaar?
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Wat er misgaat
            </h2>
            <p className="mt-3 text-base leading-relaxed text-foreground md:text-lg">
              Te laat gezien = klant al weg. Dat kost omzet.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-12 lg:gap-6">
            {(
              [
                { line: "Niet op tijd reageren", Icon: Clock },
                { line: "Berichten verspreid over apps", Icon: Layers },
                { line: "Opvolgen schuift door", Icon: CalendarClock },
                { line: "Geen zicht op waarde per lead", Icon: CircleDollarSign },
              ] as const
            ).map(({ line, Icon }) => (
              <li
                key={line}
                className={cn(
                  "group flex flex-col items-center rounded-2xl border px-5 pb-6 pt-7 text-center",
                  "border-border/45 bg-card/85 shadow-[0_4px_24px_-16px_hsl(222_48%_32%/0.14)]",
                  "ring-1 ring-black/[0.03] transition-all duration-300",
                  "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_16px_40px_-24px_hsl(var(--primary)/0.18)]",
                  "dark:border-white/[0.08] dark:bg-card/50 dark:ring-white/[0.04] dark:hover:border-primary/30",
                )}
              >
                <div
                  className={cn(
                    "relative mb-4 flex size-14 items-center justify-center rounded-2xl",
                    "bg-gradient-to-br from-primary/22 via-primary/10 to-primary/[0.04]",
                    "ring-2 ring-primary/12 ring-offset-2 ring-offset-card",
                    "shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.2)] transition-transform duration-300 group-hover:scale-[1.04]",
                    "dark:from-primary/28 dark:via-primary/14 dark:ring-primary/20 dark:ring-offset-[hsl(222_26%_7%)]",
                  )}
                >
                  <Icon
                    className="size-6 text-primary dark:text-primary-foreground/90"
                    strokeWidth={1.65}
                    aria-hidden
                  />
                </div>
                <p className="max-w-[220px] text-sm font-semibold leading-snug text-foreground sm:max-w-none md:text-[0.9375rem]">
                  {line}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      <motion.section
        id="hoe-het-werkt"
        className="border-b border-border/40 bg-gradient-to-b from-primary/[0.04] via-muted/20 to-background py-16 md:py-24 dark:border-white/[0.06] dark:from-primary/[0.06] dark:via-transparent dark:to-transparent"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Hoe het werkt
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-foreground md:text-base">
            Aanvraag binnen → antwoord en korte vragen → afspraak. Zonder je telefoon non-stop te checken.
          </p>

          <div className="mt-12 flex flex-col items-stretch md:mt-14 md:flex-row md:items-stretch md:justify-center md:gap-2 lg:gap-4">
            {(
              [
                {
                  step: "1",
                  title: "Aanvraag binnen",
                  body: "Site, mail, WhatsApp — één inbox.",
                  Icon: Inbox,
                },
                {
                  step: "2",
                  title: `${BRAND_NAME} antwoordt`,
                  body: "Kort en duidelijk. Geen stilte van uren.",
                  Icon: MessageCircle,
                },
                {
                  step: "3",
                  title: "Afspraak geboekt",
                  body: "Klant kiest tijd; jij ziet het meteen.",
                  Icon: CalendarCheck,
                },
              ] as const
            ).map((item, index) => (
              <Fragment key={item.step}>
                <div
                  className={cn(
                    "group relative mx-auto flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl border px-7 pb-8 pt-9 text-center",
                    "border-border/45 bg-card/90 shadow-[0_4px_28px_-14px_hsl(222_48%_32%/0.18),inset_0_1px_0_0_hsl(0_0%_100%/0.55)]",
                    "backdrop-blur-[2px] transition-all duration-300",
                    "hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_48px_-28px_hsl(var(--primary)/0.22)]",
                    "dark:border-white/[0.09] dark:bg-card/55 dark:shadow-[0_8px_40px_-24px_rgba(0,0,0,0.5)] dark:hover:border-primary/35 md:max-w-none md:flex-1",
                  )}
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.07] to-transparent dark:from-primary/[0.12]"
                    aria-hidden
                  />
                  <span className="relative mb-5 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-primary">
                    Stap {item.step}
                  </span>
                  <div className="relative mb-6">
                    <div
                      className="absolute inset-0 scale-110 rounded-3xl bg-primary/20 opacity-40 blur-2xl transition duration-500 group-hover:opacity-70 dark:bg-primary/25"
                      aria-hidden
                    />
                    <div
                      className={cn(
                        "relative flex size-[4.25rem] items-center justify-center rounded-2xl",
                        "bg-gradient-to-br from-primary/25 via-primary/12 to-primary/[0.04]",
                        "ring-2 ring-primary/15 ring-offset-2 ring-offset-card dark:ring-primary/25 dark:ring-offset-[hsl(222_26%_7%)]",
                        "shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.25)] transition-transform duration-300 group-hover:scale-[1.04]",
                      )}
                    >
                      <item.Icon className="size-[1.65rem] text-primary dark:text-primary-foreground/95" strokeWidth={1.65} aria-hidden />
                    </div>
                  </div>
                  <h3 className="relative text-lg font-bold tracking-tight text-foreground md:text-xl">
                    {item.title}
                  </h3>
                  <p className="relative mt-3 max-w-[260px] text-sm leading-relaxed text-foreground md:max-w-none md:text-[0.9375rem]">
                    {item.body}
                  </p>
                </div>

                {index < 2 ? (
                  <>
                    <div
                      className="flex shrink-0 justify-center py-2 text-primary/35 md:hidden dark:text-primary/40"
                      aria-hidden
                    >
                      <ChevronDown className="size-6" strokeWidth={2} />
                    </div>
                    <div
                      className="hidden shrink-0 items-center self-center pt-6 text-primary/30 md:flex dark:text-primary/45"
                      aria-hidden
                    >
                      <ChevronRight className="size-8" strokeWidth={1.5} />
                    </div>
                  </>
                ) : null}
              </Fragment>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="resultaat"
        className="border-b border-border/40 py-14 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[720px] px-4 md:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Wat je eraan hebt
          </h2>
          <ul className="mt-8 space-y-3">
            {[
              "Sneller dan je concurrent",
              "Meer afspraken uit dezelfde leads",
              "Meer omzet per aanvraag",
              "Pipeline in één oogopslag",
            ].map((t) => (
              <li key={t} className="flex gap-3 text-base text-foreground md:text-lg">
                <Check className="mt-1 size-5 shrink-0 text-foreground" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      <div id="demo">
        <LandingInteractiveChat />
      </div>

      <motion.section
        className="border-b border-border/40 py-14 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Wat anderen merken
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-foreground">
            Voorbeelden (demo).
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
            {[
              {
                name: "Marco van den Berg",
                role: "Autoservice, Rotterdam",
                quote: "Minder gemiste aanvragen — de afspraak staat er vaak al voordat ik ’s avonds inhaal.",
              },
              {
                name: "Linda Visser",
                role: "Salon, Utrecht",
                quote: "Klanten krijgen meteen antwoord. Minder stress over ‘te laat’.",
              },
              {
                name: "Tom Jansen",
                role: "Installatie, Eindhoven",
                quote: "In één oogopslag zie ik welke leads ertoe doen. Scheelt zoekwerk.",
              },
            ].map((t) => (
              <blockquote
                key={t.name}
                className="flex gap-3 rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm shadow-black/5 ring-1 ring-primary/[0.08] transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:ring-primary/15 dark:border-white/[0.08] dark:shadow-black/25"
              >
                <Quote
                  className="mt-0.5 size-6 shrink-0 text-foreground/25 dark:text-foreground/35"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-foreground md:text-[0.9375rem]">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-4 border-t border-border/40 pt-4">
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="mt-0.5 text-xs text-foreground">{t.role}</p>
                  </footer>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="prijzen"
        className="relative border-b border-border/40 py-14 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <LandingMissedRevenueEstimator className="mb-2" />

          <h2 className="mt-14 text-center text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Prijzen
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-center text-sm text-foreground">
            Start gratis — daarna bepaal jij of je door wilt.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {BILLING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-0.5 md:p-7",
                  plan.popular
                    ? "border-primary/40 bg-primary/[0.06] shadow-[0_0_0_1px_hsl(var(--primary)/0.2),0_24px_48px_-28px_hsl(var(--primary)/0.25)] lg:scale-[1.02]"
                    : "border-border/60 bg-card/40 shadow-sm shadow-black/5 hover:border-primary/20 dark:border-white/[0.08] dark:shadow-black/20",
                )}
              >
                {plan.popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Meest gekozen
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-sm text-foreground">{plan.description}</p>
                <p className="mt-6">
                  <span className="text-4xl font-bold tabular-nums md:text-5xl">€{plan.priceEur}</span>
                  <span className="text-foreground">/mnd</span>
                </p>
                <ul className="mt-8 flex-1 space-y-3 text-sm text-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={cn("mt-6 h-11 w-full rounded-xl text-sm font-semibold md:h-12 md:text-base")}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/signup">Start gratis</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="faq"
        className="border-b border-border/40 py-14 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-2xl px-4 md:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground md:text-3xl">FAQ</h2>
          <div className="mt-8 space-y-2">
            {[
              {
                q: "Hoe snel start ik?",
                a: "Vaak binnen minuten. Geen creditcard nodig om te proberen.",
              },
              {
                q: "Wat merk ik?",
                a: "Minder blijven-liggen, meer geboekte afspraken.",
              },
              {
                q: "Past dit bij mij?",
                a: "Heb je aanvragen en niet altijd tijd om direct te antwoorden? Dan meestal wel.",
              },
              {
                q: "Kan ik stoppen?",
                a: "Ja — nergens aan vast.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border/50 bg-card/40 px-4 backdrop-blur-[2px] transition open:bg-muted/25 hover:border-primary/20 dark:border-white/[0.08]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-[0.9375rem] font-semibold text-foreground">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 text-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-3.5 text-sm leading-relaxed text-foreground md:text-[0.9375rem]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="border-b border-border/40 py-14 md:py-20 dark:border-white/[0.06]" {...fadeUp}>
        <div className="mx-auto max-w-2xl px-4 text-center md:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Zelf proberen
          </h2>
          <p className="mt-2 text-sm text-foreground md:text-base">
            Zie hoe snel een aanvraag wordt opgepakt.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="h-12 rounded-xl px-7 text-base font-semibold sm:h-14">
              <Link href="/signup">Start gratis</Link>
            </Button>
            <AnonymousDemoForm>
              <Button
                type="submit"
                size="lg"
                variant="demo"
                className="h-12 w-full rounded-xl px-7 text-base font-semibold sm:h-14 sm:w-auto"
              >
                Bekijk demo
              </Button>
            </AnonymousDemoForm>
          </div>
        </div>
      </motion.section>

      <footer className="border-t border-border/40 py-10 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-4 md:flex-row md:justify-between md:px-8">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-foreground">
                {BRAND_LOGO_MONOGRAM}
              </div>
              <span className="font-semibold text-foreground">{BRAND_NAME}</span>
            </div>
            <p className="text-xs text-foreground">Minder te laat · meer geboekt</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-foreground">
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
  );
}
