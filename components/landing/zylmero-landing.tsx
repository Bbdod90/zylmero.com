"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  Inbox,
  MessageCircle,
  Quote,
  Zap,
} from "lucide-react";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { HeroInboxMock } from "@/components/landing/hero-inbox-mock";
import { LandingInteractiveChat } from "@/components/landing/landing-interactive-chat";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingMissedRevenueEstimator } from "@/components/landing/landing-missed-revenue-estimator";
import { LandingPainCostSection } from "@/components/landing/landing-pain-cost-section";
import { LandingDashboardPeek } from "@/components/landing/landing-dashboard-peek";
import { LandingWebsiteServices } from "@/components/landing/landing-website-services";
import { LandingWithoutWithSection } from "@/components/landing/landing-without-with-section";
import { StickyConversionBar } from "@/components/landing/sticky-conversion-bar";
import { Button } from "@/components/ui/button";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { BRAND_CONTACT_EMAIL, BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const HERO_H1 = "Jouw website naar een niveau hoger tillen?";

const HERO_SUB =
  "Een chatbot op je site die meteen antwoord geeft — plus overzicht wanneer het via mail of WhatsApp binnenkomt. Zylmero helpt zzp’ers en kleine teams om sneller te reageren en minder aanvragen te missen, zonder de hele dag online te hoeven zijn.";

const HERO_TRUST = "Voor garages, salons, monteurs, praktijken — iedereen die klanten via meerdere kanalen binnen krijgt";

const VALUE_BLOCKS = [
  {
    title: "Sneller eerste antwoord",
    desc: "Ook als jij op de werkvloer staat.",
    Icon: Zap,
  },
  {
    title: "Minder aanvragen missen",
    desc: "Mail, site en WhatsApp op één plek.",
    Icon: Inbox,
  },
  {
    title: "Meer uit dezelfde leads",
    desc: "Zien wat urgent is — minder zoeken, meer geboekt.",
    Icon: CalendarCheck,
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "Kost dit veel tijd om op te zetten?",
    a: "Nee — je koppelt je kanalen en werkt vanuit één overzicht. Je hoeft geen IT-project te draaien: start klein, breid uit als het bevalt.",
  },
  {
    q: "Ik ben maar klein — heb ik dit wel nodig?",
    a: "Juist kleine zaken verliezen aanvragen omdat er niemand fulltime achter de telefoon zit. Als je genoeg hebt aan mail, WhatsApp en website om klanten binnen te krijgen, heb je genoeg aan structuur om ze niet te verliezen.",
  },
  {
    q: "Waarvoor betaal ik precies?",
    a: "Voor minder chaos in je aanvragen en snellere opvolging — zodat je minder omzet laat liggen. Geen betaling voor “software om software”; wel voor grip en tempo richting klanten.",
  },
  {
    q: "Zit ik ergens aan vast?",
    a: "Niet voor de proef. Betaald abonnement: maandelijks opzegbaar, geen jaarcontract. Je hoeft niet alles meteen af te nemen — later modules bijzetten kan.",
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

        <div className="relative mx-auto max-w-[1200px] px-4 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <motion.div {...fadeUp}>
            <p className="mb-6 max-w-xl text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-primary">
              {HERO_TRUST}
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[3rem] dark:text-white">
              {HERO_H1}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-[1.65] text-muted-foreground md:text-lg">
              {HERO_SUB}
            </p>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Chatbot op je site · mail & WhatsApp op één plek · minder aanvragen missen.
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
            <p className="mt-6 text-sm text-muted-foreground">
              Geen creditcard om te starten · maandelijks opzegbaar · geen jaarcontract
            </p>
          </motion.div>
          <div className="relative mt-16 lg:mt-0">
            <div className="relative overflow-hidden rounded-2xl border border-border/40 shadow-lg dark:border-white/[0.1] dark:shadow-black/40">
              <HeroInboxMock />
            </div>
          </div>
        </div>
      </section>

      <LandingPainCostSection />

      <motion.section
        id="hoe-het-werkt"
        className="border-b border-border/30 bg-muted/15 py-16 md:py-20 dark:border-white/[0.06] dark:bg-transparent"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[640px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Zo werkt het
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-base leading-[1.65] text-muted-foreground">
            Aanvraag binnen, snel antwoord, duidelijke volgende stap — ook als jij net op de klus staat.
          </p>

          <ol className="mx-auto mt-12 max-w-xl space-y-0 divide-y divide-border/35 rounded-xl border border-border/40 dark:divide-white/[0.08] dark:border-white/[0.08]">
            {(
              [
                {
                  step: "1",
                  title: "Aanvraag komt binnen",
                  body: "Via site, mail of WhatsApp — niet meer zoeken welk kanaal het was.",
                  Icon: Inbox,
                },
                {
                  step: "2",
                  title: `${BRAND_NAME} helpt je antwoorden`,
                  body: "Via je site-chat en je kanalen: een eerste reactie in jouw branchetaal.",
                  Icon: MessageCircle,
                },
                {
                  step: "3",
                  title: "Van vraag naar geboekt moment",
                  body: "Je ziet wie wat heeft gezegd en wat nog openstaat.",
                  Icon: CalendarCheck,
                },
              ] as const
            ).map((item) => (
              <li key={item.step} className="flex gap-4 px-5 py-6 md:gap-5 md:px-6">
                <item.Icon className="mt-0.5 size-5 shrink-0 text-primary/75" strokeWidth={1.5} aria-hidden />
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-primary">Stap {item.step}</p>
                  <h3 className="mt-1 font-medium text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </motion.section>

      <LandingWithoutWithSection />

      <LandingDashboardPeek />

      <motion.section
        id="wat-je-krijgt"
        className="border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[640px] px-4 md:px-8">
          <div className="text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
              Wat je koopt — in gewone taal
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Wat Zylmero voor je doet
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-[1.65] text-muted-foreground">
              Je betaalt om minder klanten te missen en meer uit de aanvragen te halen die je al binnenkrijgt — niet voor
              losse knopjes.
            </p>
          </div>
          <ul className="mx-auto mt-12 max-w-xl space-y-8">
            {VALUE_BLOCKS.map(({ title, desc, Icon }) => (
              <li key={title} className="flex gap-4 md:gap-5">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary/75" strokeWidth={1.5} aria-hidden />
                <div>
                  <p className="font-medium text-foreground">{title}</p>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      <LandingWebsiteServices />

      <div id="demo">
        <LandingInteractiveChat />
      </div>

      <motion.section className="border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]" {...fadeUp}>
        <div className="mx-auto max-w-[640px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Wat andere ondernemers merken
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-muted-foreground">
            Voorbeelden — geen echte klantquotes. Wel herkenbare situaties.
          </p>
          <div className="mt-12 space-y-12">
            {[
              {
                name: "Rick de Vries",
                role: "Garagehouder · Apeldoorn",
                quote:
                  "Ik zie eerder welke klant haast heeft. Minder gesprekken gemist tussen twee monteurs door.",
              },
              {
                name: "Floor Martens",
                role: "Fysiotherapiepraktijk · Amersfoort",
                quote:
                  "Patiënten mailen ook buiten receptietijden — nu leggen we niet meer onbedoeld een week stil.",
              },
              {
                name: "Soufiane El Amrani",
                role: "Installatie · Den Haag",
                quote:
                  "Spoed staat vooraan in het overzicht. Ik hoef niet meer vijf gesprekken terug te scrollen.",
              },
            ].map((t) => (
              <blockquote key={t.name} className="border-l-2 border-primary/25 pl-6 dark:border-primary/35">
                <Quote className="mb-3 size-4 text-primary/40" aria-hidden />
                <p className="text-[0.9375rem] leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 text-sm">
                  <p className="font-medium text-foreground">{t.name}</p>
                  <p className="mt-0.5 text-muted-foreground">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="prijzen"
        className="border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <div id="indicatie" className="scroll-mt-28">
            <LandingMissedRevenueEstimator className="mb-2" />
          </div>

          <h2 className="mt-14 text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Prijzen
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base leading-[1.65] text-muted-foreground">
            Start gratis. Daarna een vast bedrag per maand — klein beginnen kan, uitbreiden ook.
          </p>
          <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {BILLING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-xl border p-6 md:p-7",
                  plan.popular
                    ? "border-primary/35 bg-primary/[0.06] dark:bg-primary/[0.08]"
                    : "border-border/40 bg-card/40 dark:border-white/[0.08] dark:bg-white/[0.02]",
                )}
              >
                {plan.popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Meest gekozen
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-sm leading-snug text-foreground">{plan.description}</p>
                <p className="mt-2 text-xs leading-snug text-muted-foreground">{plan.audience}</p>
                <p className="mt-6">
                  <span className="text-4xl font-bold tabular-nums md:text-5xl">€{plan.priceEur}</span>
                  <span className="text-muted-foreground">/mnd</span>
                </p>
                <p className="mt-2 text-[0.7rem] text-muted-foreground">{plan.leadCapLabel}</p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
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

          <p className="mx-auto mt-12 max-w-lg text-center text-sm leading-relaxed text-muted-foreground">
            Modules zoals chatbot en inbox zet je gefaseerd in — zie{" "}
            <a href="#diensten-website" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
              diensten
            </a>
            .
          </p>
        </div>
      </motion.section>

      <motion.section
        id="faq"
        className="border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[640px] px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Veelgestelde vragen</h2>
          </div>
          <div className="mt-10 divide-y divide-border/35 border-y border-border/35 dark:divide-white/[0.08] dark:border-white/[0.08]">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-[0.9375rem] font-medium text-foreground">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]" {...fadeUp}>
        <div className="mx-auto max-w-[520px] px-4 text-center md:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Zelf proberen</h2>
          <p className="mt-4 text-base leading-[1.65] text-muted-foreground">
            Probeer de chat hierboven — zo voelt snelle opvolging voor je klant.
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
            <p className="text-xs text-muted-foreground">Minder klanten missen · meer uit je aanvragen</p>
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
