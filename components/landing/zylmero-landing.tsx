"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  Check,
  ChevronDown,
  Inbox,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { HeroInboxMock } from "@/components/landing/hero-inbox-mock";
import { LandingFinalCtaSection } from "@/components/landing/landing-final-cta-section";
import { LandingImpactSection } from "@/components/landing/landing-impact-section";
import { LandingInteractiveChat } from "@/components/landing/landing-interactive-chat";
import { LandingMissedRevenueEstimator } from "@/components/landing/landing-missed-revenue-estimator";
import { LandingModulesSection } from "@/components/landing/landing-modules-section";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingPainCostSection } from "@/components/landing/landing-pain-cost-section";
import { LandingResultSection } from "@/components/landing/landing-result-section";
import { LandingSolutionSection } from "@/components/landing/landing-solution-section";
import { StickyConversionBar } from "@/components/landing/sticky-conversion-bar";
import { Button } from "@/components/ui/button";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { BRAND_CONTACT_EMAIL, BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const HERO_H1 = "Elke gemiste aanvraag kost je geld — zonder dat je het doorhebt";

const HERO_SUB =
  "Zylmero reageert direct op je klanten, filtert serieuze aanvragen en helpt richting afspraak. Jij hoeft niet de hele dag online te zijn — maar mist geen klant meer onnodig.";

const HERO_BULLETS = [
  "Reageert binnen seconden",
  "Meer afspraken zonder extra werk",
  "Werkt via je website, mail en WhatsApp",
] as const;

const FAQ_ITEMS = [
  {
    q: "Is dit moeilijk om te gebruiken?",
    a: "Nee. Je start binnen enkele minuten: overzicht, eerste antwoorden, en later optioneel een website-chat. Geen IT-project.",
  },
  {
    q: "Werkt dit voor mijn bedrijf?",
    a: "Als je aanvragen krijgt — mail, WhatsApp of website — dan wel. Het gaat om snelheid en overzicht, niet om je sectorlabel.",
  },
  {
    q: "Wat levert het echt op?",
    a: "Minder gemiste klanten en snellere opvolging: meer geboekte momenten uit dezelfde stroom aanvragen. Geen belofte van magie — wél minder omzet laten liggen.",
  },
  {
    q: "Kan ik stoppen?",
    a: "Ja. Betaald abonnement is maandelijks opzegbaar. Geen kleine letter-fratsen in deze uitleg — check wel je bevestiging bij start.",
  },
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

export function ZylmeroLanding() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background pb-28 text-foreground md:pb-24">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,hsl(var(--primary)/0.08),transparent_55%)] dark:bg-[radial-gradient(ellipse_85%_55%_at_50%_-18%,hsl(var(--primary)/0.1),transparent_58%)]"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 -z-10 cf-landing-grain opacity-75 dark:opacity-90" aria-hidden />
      <LandingNav />

      <section className="relative overflow-hidden border-b border-border/30 dark:border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
        <div
          className="pointer-events-none absolute -left-1/3 top-0 h-[min(520px,70vh)] w-[70%] max-w-3xl rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12),transparent_68%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.16),transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-[1200px] px-4 pb-20 pt-12 md:px-8 md:pb-28 md:pt-16 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <motion.div {...fadeUp}>
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-[3.45rem] lg:leading-[1.02] dark:bg-gradient-to-b dark:from-white dark:to-zinc-400 dark:bg-clip-text dark:text-transparent">
              {HERO_H1}
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg lg:text-xl">
              {HERO_SUB}
            </p>
            <ul className="mt-10 max-w-xl space-y-3">
              {HERO_BULLETS.map((label) => (
                <li key={label} className="flex gap-3 text-[0.9375rem] font-medium leading-snug text-foreground md:text-base">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/25">
                    <Check className="size-3.5" aria-hidden strokeWidth={2.5} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
            <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
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
            <p className="mt-8 text-sm text-muted-foreground">Geen creditcard · maandelijks opzegbaar</p>
          </motion.div>
          <div className="relative mt-16 lg:mt-0">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_40%_35%,hsl(var(--primary)/0.22),transparent_62%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_45%_30%,hsl(var(--primary)/0.28),transparent_65%)]"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-[1.35rem] border border-border/45 shadow-[0_28px_90px_-42px_rgb(0_0_0/0.72)] ring-1 ring-black/[0.04] dark:border-white/[0.12] dark:shadow-black/55 dark:ring-white/[0.06]">
              <HeroInboxMock />
            </div>
          </div>
        </div>
      </section>

      <LandingPainCostSection />

      <LandingImpactSection />

      <LandingSolutionSection />

      <motion.section
        id="hoe-het-werkt"
        className="relative scroll-mt-28 border-b border-border/30 bg-gradient-to-b from-muted/25 via-muted/10 to-transparent py-20 md:py-24 dark:border-white/[0.06] dark:from-white/[0.03] dark:via-transparent dark:to-transparent"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1180px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
            Zo werkt het (simpel)
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-muted-foreground md:text-lg">
            Geen handleiding van twintig pagina&apos;s — drie stappen.
          </p>

          <ol className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
            {(
              [
                {
                  step: "1",
                  title: "Aanvraag komt binnen",
                  body: "Via je site, mail of WhatsApp.",
                  Icon: Inbox,
                },
                {
                  step: "2",
                  title: `${BRAND_NAME} reageert direct`,
                  body: "Strak eerste antwoord — ook als jij op de klus staat.",
                  Icon: MessageCircle,
                },
                {
                  step: "3",
                  title: "Klant boekt of wacht op jou",
                  body: "Jij ziet wat er speelt en pakt het op waar nodig.",
                  Icon: CalendarCheck,
                },
              ] as const
            ).map((item) => (
              <li key={item.step} className="cf-landing-pro-card p-8 md:p-9">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                  <item.Icon className="size-6" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary">Stap {item.step}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </motion.section>

      <motion.section
        id="chatbots"
        className="scroll-mt-28 border-b border-border/30 py-20 md:py-24 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1180px] px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Website</p>
            <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
              Zet een chatbot op je website in 5 minuten
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              Bezoekers stellen vragen — jouw chatbot reageert meteen. Zelfs als jij aan het werk bent of offline.
            </p>
          </div>

          <ul className="mx-auto mt-12 grid max-w-3xl gap-3 text-left sm:mx-auto">
            {[
              "Beantwoord vragen automatisch",
              "Laat klanten afspraken aanvragen",
              "Werkt 24/7",
            ].map((label) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-xl border border-border/45 bg-muted/25 px-5 py-4 text-[0.9375rem] font-medium text-foreground dark:border-white/[0.08] dark:bg-white/[0.04]"
              >
                <Check className="size-5 shrink-0 text-primary" aria-hidden strokeWidth={2.25} />
                {label}
              </li>
            ))}
          </ul>

          <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-primary/35 bg-primary/[0.07] p-6 text-center shadow-[0_20px_60px_-40px_hsl(var(--primary)/0.45)] dark:border-primary/30 dark:bg-primary/[0.09]">
            <p className="text-sm font-semibold text-foreground">Hier maak je je echte website-chatbot</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Niet op deze marketingpagina — in je <strong className="text-foreground">dashboard</strong> onder{" "}
              <strong className="text-foreground">Website-chat</strong>. Geen account? Start gratis, daarna bot aanmaken en één regel code
              plakken.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild className="h-11 rounded-xl px-6 font-semibold">
                <Link href="/dashboard/chatbots">Ga naar Website-chat</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl px-6 font-semibold">
                <Link href="/signup">Account aanmaken</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Niet ingelogd? Je wordt doorgestuurd naar inloggen — daarna direct bouwen.
            </p>
          </div>

          <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
            Plak één regel code op je site — actief met een geldige proef of betaald abonnement.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
            <div className="cf-landing-pro-card p-8 md:p-9">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                <Bot className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Voor klanten bouwen</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                Dezelfde bouwstenen voor salons, garages, monteurs en praktijken — snel live, strak afgesteld.
              </p>
            </div>
            <div className="cf-landing-pro-card p-8 md:p-9">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                <Sparkles className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Voor jezelf</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                Begin klein, breid uit als het bevalt — geen tweede baan aan onderhoud.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <div id="demo">
        <LandingInteractiveChat />
      </div>

      <LandingResultSection />

      <motion.section
        id="prijzen"
        className="border-b border-border/30 py-20 md:py-24 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <div id="indicatie" className="scroll-mt-28">
            <LandingMissedRevenueEstimator className="mb-2" />
          </div>

          <p className="mx-auto mt-14 max-w-2xl text-center text-sm font-medium text-primary md:text-base">
            Vaak al terugverdiend met 1 extra afspraak per maand
          </p>
          <h2 className="mt-4 text-center text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
            Kies wat bij je past
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-muted-foreground md:text-lg">
            Start gratis. Daarna vast per maand — klein beginnen kan, uitbreiden ook.
          </p>
          <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {BILLING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-7 transition-[transform,box-shadow] duration-200 md:p-8",
                  plan.popular
                    ? "z-[1] border-primary/40 bg-primary/[0.07] shadow-[0_24px_70px_-40px_hsl(var(--primary)/0.55)] ring-1 ring-primary/25 dark:bg-primary/[0.1] lg:scale-[1.02]"
                    : "border-border/40 bg-card/50 shadow-[0_18px_50px_-38px_rgb(0_0_0/0.45)] dark:border-white/[0.09] dark:bg-white/[0.03] dark:shadow-black/50",
                )}
              >
                {plan.popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25">
                    Meest gekozen
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-sm font-medium leading-snug text-foreground">{plan.description}</p>
                <p className="mt-3 text-xs leading-snug text-muted-foreground">{plan.audience}</p>
                <p className="mt-8">
                  <span className="text-4xl font-bold tabular-nums md:text-5xl">€{plan.priceEur}</span>
                  <span className="text-muted-foreground">/mnd</span>
                </p>
                <p className="mt-2 text-[0.7rem] text-muted-foreground">{plan.leadCapLabel}</p>
                <ul className="mt-8 flex-1 space-y-3.5 text-sm text-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={cn("mt-8 h-12 w-full rounded-xl text-sm font-semibold md:h-12 md:text-base")}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/signup">Start gratis</Link>
                </Button>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-14 max-w-lg text-center text-sm leading-relaxed text-muted-foreground">
            Kleiner starten, later modules bijzetten — je betaalt niet voor wat je niet gebruikt.
          </p>
        </div>
      </motion.section>

      <LandingModulesSection />

      <motion.section
        id="faq"
        className="border-b border-border/30 py-20 md:py-24 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Veelgestelde vragen</h2>
          </div>
          <div className="mt-12 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group cf-landing-pro-card open:shadow-[0_26px_70px_-42px_rgb(0_0_0/0.55)] [&[open]]:ring-1 [&[open]]:ring-primary/15"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[0.9375rem] font-medium text-foreground md:px-6">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="border-t border-border/35 px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground dark:border-white/[0.07] md:px-6">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </motion.section>

      <LandingFinalCtaSection />

      <footer className="border-t border-border/40 py-12 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-4 md:flex-row md:justify-between md:px-8">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-foreground">
                {BRAND_LOGO_MONOGRAM}
              </div>
              <span className="font-semibold text-foreground">{BRAND_NAME}</span>
            </div>
            <p className="text-xs text-muted-foreground">Minder omzet laten liggen · sneller voor je klanten klaarstaan</p>
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
