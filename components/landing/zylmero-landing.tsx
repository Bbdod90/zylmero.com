"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  Inbox,
  ListChecks,
  MessageCircle,
} from "lucide-react";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { HeroInboxMock } from "@/components/landing/hero-inbox-mock";
import { LandingAudienceSection } from "@/components/landing/landing-audience-section";
import { LandingFinalCtaSection } from "@/components/landing/landing-final-cta-section";
import { LandingInteractiveChat } from "@/components/landing/landing-interactive-chat";
import { LandingMissedRevenueEstimator } from "@/components/landing/landing-missed-revenue-estimator";
import { LandingModulesSection } from "@/components/landing/landing-modules-section";
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

const HERO_H1 = "Gemiste aanvragen kosten omzet";

const HERO_SUB =
  "Zylmero reageert als eerste op mail, WhatsApp en aanvragen via je site. Serieuze leads blijven in beeld. Opvolging loopt door. Jij pakt af wat telt — zonder extra iemand op kantoor.";

const HERO_BULLETS = [
  "Eerste reactie binnen seconden, in jouw woorden",
  "Eén plek: geen zoekwerk meer tussen apps en inbox",
  "Meer afspraken uit dezelfde stroom aanvragen",
] as const;

const FAQ_ITEMS = [
  {
    q: "Wat doet Zylmero precies?",
    a: "Het vangt klantaanvragen op en zorgt voor een snelle eerste reactie. Alles staat op één plek. Opvolging blijft lopen. Jij ziet wat spoed heeft en wat wacht — en pakt de verkoop zelf af.",
  },
  {
    q: "Is dit geschikt voor mijn bedrijf?",
    a: "Als je zzp bent, eenmanszaak voert of een klein team hebt en aanvragen binnenkomt via mail, WhatsApp of je site: ja. Lokale dienstverlening — techniek, garage, zorg, beauty, hoveniers, schoonmaak — past hier het best bij.",
  },
  {
    q: "Reageert het automatisch?",
    a: "Ja, op de manier die jij instelt: eerste antwoord en opvolging binnen jouw grenzen. Jij bepaalt toon en inhoud. Geen bericht zonder dat jij weet hoe het werkt.",
  },
  {
    q: "Moet ik technisch zijn?",
    a: "Nee. Je vult je zaak in, koppelt waar nodig, en je ziet je aanvragen. Geen IT-traject.",
  },
  {
    q: "Bespaart dit echt tijd?",
    a: "Ja. Minder app-wisselen, minder dubbel typen, minder dingen die blijven liggen. Dat is tijd die je nu kwijt bent aan ruis rond klanten.",
  },
  {
    q: "Waarom zou ik dit gebruiken in plaats van zelf te reageren?",
    a: "Omdat jij niet overal tegelijk kunt zijn. Klanten wachten niet tot je klaar bent op de klus. Zylmero vult de gaten: avond, weekend, drukte op locatie. Jij blijft baas; het systeem vangt de piek op.",
  },
  {
    q: "Kan ik stoppen?",
    a: "Ja. Betaalde plannen zijn maandelijks opzegbaar. Check je bevestigingsmail bij start.",
  },
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

const HOW_STEPS = [
  {
    step: "1",
    title: "Klant stuurt een aanvraag",
    body: "Mail, WhatsApp of je site — het komt bij jou binnen.",
    Icon: Inbox,
  },
  {
    step: "2",
    title: "Zylmero reageert direct",
    body: "Strak, duidelijk, in jouw stijl. Ook als jij niet bij de telefoon zit.",
    Icon: MessageCircle,
  },
  {
    step: "3",
    title: "De lead wordt opgevolgd",
    body: "Wat serieus is, blijft in beeld. Niets verdwijnt tussen de ruis.",
    Icon: ListChecks,
  },
  {
    step: "4",
    title: "Jij krijgt serieuze klanten",
    body: "Offerte of afspraak: jij sluit af waar het geld wordt verdiend.",
    Icon: CalendarCheck,
  },
] as const;

export function ZylmeroLanding() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background pb-28 text-foreground md:pb-24">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_90%_55%_at_50%_-12%,hsl(var(--primary)/0.09),transparent_58%)] dark:bg-[radial-gradient(ellipse_88%_52%_at_50%_-15%,hsl(var(--primary)/0.11),transparent_60%)]"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 -z-10 cf-landing-grain opacity-75 dark:opacity-90" aria-hidden />
      <LandingNav />

      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden border-b border-border/30 dark:border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
        <div
          className="pointer-events-none absolute -left-1/3 top-0 h-[min(560px,72vh)] w-[72%] max-w-3xl rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.11),transparent_68%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.14),transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-[1200px] px-4 pb-24 pt-14 md:px-8 md:pb-32 md:pt-20 lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-[0.6875rem] font-medium tracking-tight text-foreground dark:border-white/[0.1] dark:bg-white/[0.04]">
              <span className="size-1.5 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.25)]" aria-hidden />
              Zzp en kleine bedrijven
            </div>
            <h1 className="mt-7 text-balance text-[2rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.05] dark:bg-gradient-to-b dark:from-white dark:to-zinc-400 dark:bg-clip-text dark:text-transparent">
              {HERO_H1}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg lg:text-xl">
              {HERO_SUB}
            </p>
            <ul className="mt-9 max-w-xl space-y-2.5">
              {HERO_BULLETS.map((label) => (
                <li
                  key={label}
                  className="flex gap-3 text-[0.9375rem] font-medium leading-snug text-foreground md:text-base"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/25">
                    <Check className="size-3.5" aria-hidden strokeWidth={2.5} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
            <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 min-h-[48px] rounded-xl px-8 text-base font-semibold shadow-md sm:h-14 sm:min-h-[52px]"
              >
                <Link href="/signup">Gratis starten</Link>
              </Button>
              <AnonymousDemoForm className="w-full sm:w-auto">
                <Button
                  type="submit"
                  size="lg"
                  variant="outline"
                  className="h-12 min-h-[48px] w-full rounded-xl border-2 border-primary/25 bg-background/80 px-8 text-base font-semibold backdrop-blur-sm sm:h-14 sm:min-h-[52px] sm:w-auto dark:border-primary/30 dark:bg-transparent"
                >
                  Bekijk hoe het werkt
                  <ArrowRight className="ml-2 size-4 opacity-80" aria-hidden />
                </Button>
              </AnonymousDemoForm>
            </div>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
              Geen creditcard om te starten · opzeggen wanneer je wilt · binnen minuten aan de slag
            </p>
          </motion.div>
          <div className="relative mt-16 lg:mt-0">
            <div
              className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[radial-gradient(ellipse_at_42%_32%,hsl(var(--primary)/0.2),transparent_62%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_42%_30%,hsl(var(--primary)/0.26),transparent_64%)]"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-[1.35rem] border border-border/50 shadow-[0_32px_100px_-44px_rgb(0_0_0/0.75)] ring-1 ring-black/[0.04] dark:border-white/[0.12] dark:shadow-black/55 dark:ring-white/[0.06]">
              <HeroInboxMock />
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground lg:text-left">
              Voorbeeld — straks met jouw echte aanvragen.
            </p>
          </div>
        </div>

        {/* Trust strip */}
        <div className="border-t border-border/25 bg-muted/20 py-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-center text-xs font-medium text-muted-foreground md:px-8 md:text-sm">
            <span>E-mail</span>
            <span className="hidden text-border sm:inline" aria-hidden>
              ·
            </span>
            <span>WhatsApp</span>
            <span className="hidden text-border sm:inline" aria-hidden>
              ·
            </span>
            <span>Website-widget voor leads</span>
            <span className="hidden text-border sm:inline" aria-hidden>
              ·
            </span>
            <span>Eén overzicht</span>
          </div>
        </div>
      </section>

      <LandingPainCostSection />
      <LandingSolutionSection />

      {/* Hoe het werkt */}
      <motion.section
        id="hoe-het-werkt"
        className="relative scroll-mt-28 border-b border-border/30 bg-gradient-to-b from-muted/20 via-transparent to-transparent py-24 md:py-28 dark:border-white/[0.06] dark:from-white/[0.03]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1180px] px-4 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="cf-landing-eyebrow">Hoe het werkt</p>
            <h2 className="cf-landing-h2 mt-4">Zo loopt het bij jou</h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Van binnenkomst tot afspraak. Korte zinnen. Geen gedoe.
            </p>
          </div>

          <ol className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {HOW_STEPS.map((item) => (
              <li key={item.step} className="cf-landing-pro-card flex flex-col p-7 md:p-8">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                  <item.Icon className="size-6" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary">
                  Stap {item.step}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground md:text-xl">{item.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </motion.section>

      <LandingOutcomesSection />
      <LandingAudienceSection />

      <div id="demo" className="scroll-mt-28">
        <LandingInteractiveChat />
      </div>

      <LandingModulesSection />

      {/* Prijzen */}
      <motion.section
        id="prijzen"
        className="border-b border-border/30 py-24 md:py-28 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <div id="indicatie" className="scroll-mt-28">
            <LandingMissedRevenueEstimator className="mb-4" />
          </div>

          <div className="mx-auto mt-16 max-w-3xl text-center">
            <p className="cf-landing-eyebrow">Tarieven</p>
            <h2 className="cf-landing-h2 mt-4">Wat het kost</h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Start gratis. Werkt het? Dan kies je een vast bedrag per maand. Geen verborgen kosten.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {BILLING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-8 transition-[transform,box-shadow] duration-200 md:p-9",
                  plan.popular
                    ? "z-[1] border-primary/45 bg-primary/[0.08] shadow-[0_28px_80px_-42px_hsl(var(--primary)/0.5)] ring-1 ring-primary/25 dark:bg-primary/[0.1] lg:scale-[1.02]"
                    : "border-border/45 bg-card/60 shadow-[0_20px_56px_-40px_rgb(0_0_0/0.45)] dark:border-white/[0.09] dark:bg-white/[0.03] dark:shadow-black/50",
                )}
              >
                {plan.popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25">
                    Meest gekozen
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-sm font-medium leading-snug text-foreground">{plan.description}</p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{plan.audience}</p>
                <p className="mt-8">
                  <span className="text-4xl font-bold tabular-nums md:text-5xl">€{plan.priceEur}</span>
                  <span className="text-muted-foreground">/mnd</span>
                </p>
                <p className="mt-2 text-[0.7rem] text-muted-foreground">{plan.leadCapLabel}</p>
                <ul className="mt-8 flex-1 space-y-3.5 text-sm text-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={cn("mt-9 h-12 w-full rounded-xl text-sm font-semibold md:text-base")}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/signup">Gratis starten</Link>
                </Button>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-14 max-w-lg text-center text-sm leading-relaxed text-muted-foreground">
            Eerst proberen, daarna beslissen. Geen dwang.
          </p>
        </div>
      </motion.section>

      <LandingTrustSection />

      {/* FAQ */}
      <motion.section
        id="faq"
        className="border-b border-border/30 py-24 md:py-28 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="text-center">
            <p className="cf-landing-eyebrow">Praktisch</p>
            <h2 className="cf-landing-h2 mt-4">Veelgestelde vragen</h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Kort antwoord. Geen omweg.
            </p>
          </div>
          <div className="mt-12 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group cf-landing-pro-card open:shadow-[0_26px_70px_-42px_rgb(0_0_0/0.55)] [&[open]]:ring-1 [&[open]]:ring-primary/15"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-left text-[0.9375rem] font-medium text-foreground md:px-6">
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

      <footer className="border-t border-border/40 py-14 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-10 px-4 md:flex-row md:justify-between md:px-8">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-foreground ring-1 ring-primary/20">
                {BRAND_LOGO_MONOGRAM}
              </div>
              <span className="font-semibold text-foreground">{BRAND_NAME}</span>
            </div>
            <p className="max-w-xs text-center text-xs leading-relaxed text-muted-foreground md:text-left">
              Sneller op aanvragen. Minder klanten missen. Voor zzp en kleine bedrijven.
            </p>
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
