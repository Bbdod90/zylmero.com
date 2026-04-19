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

function testimonialInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0];
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return [a, b].filter(Boolean).join("").toUpperCase();
}

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

        <div className="relative mx-auto max-w-[1200px] px-4 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <motion.div {...fadeUp}>
            <span className="mb-6 inline-flex max-w-full rounded-full border border-primary/25 bg-primary/[0.06] px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary">
              {HERO_TRUST}
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-[1.06] tracking-tight text-foreground md:text-5xl lg:text-[3.25rem] dark:bg-gradient-to-b dark:from-white dark:to-zinc-400 dark:bg-clip-text dark:text-transparent">
              {HERO_H1}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-[1.65] text-muted-foreground md:text-lg">
              {HERO_SUB}
            </p>
            <div className="mt-6 flex max-w-xl flex-wrap gap-2">
              {["Chatbot op je site", "Mail & WhatsApp samen", "Minder leads missen"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-border/50 bg-muted/35 px-3 py-1 text-xs text-muted-foreground shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04]"
                >
                  {label}
                </span>
              ))}
            </div>
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

      <motion.section
        id="hoe-het-werkt"
        className="relative border-b border-border/30 bg-gradient-to-b from-muted/25 via-muted/10 to-transparent py-16 md:py-24 dark:border-white/[0.06] dark:from-white/[0.03] dark:via-transparent dark:to-transparent"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1180px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Zo werkt het
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-[1.65] text-muted-foreground">
            Aanvraag binnen, snel antwoord, duidelijke volgende stap — ook als jij net op de klus staat.
          </p>

          <ol className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
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
              <li key={item.step} className="cf-landing-pro-card p-6 md:p-7">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                  <item.Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-primary">Stap {item.step}</p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
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
        <div className="mx-auto max-w-[1180px] px-4 md:px-8">
          <div className="text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
              Wat je koopt — in gewone taal
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Wat Zylmero voor je doet
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-[1.65] text-muted-foreground">
              Je betaalt om minder klanten te missen en meer uit de aanvragen te halen die je al binnenkrijgt — niet voor
              losse knopjes.
            </p>
          </div>
          <ul className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
            {VALUE_BLOCKS.map(({ title, desc, Icon }) => (
              <li key={title} className="cf-landing-pro-card p-6 md:p-7">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="mt-5 font-semibold text-foreground">{title}</p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">{desc}</p>
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
        <div className="mx-auto max-w-[1180px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Wat andere ondernemers merken
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
            Voorbeelden — geen echte klantquotes. Wel herkenbare situaties.
          </p>
          <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
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
              <blockquote key={t.name} className="cf-landing-pro-card flex h-full flex-col p-6 md:p-7">
                <Quote className="size-5 text-primary/45" aria-hidden />
                <p className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-6 flex items-center gap-3 border-t border-border/40 pt-5 dark:border-white/[0.07]">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/[0.12] text-xs font-semibold text-primary ring-1 ring-primary/20">
                    {testimonialInitials(t.name)}
                  </span>
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="mt-0.5 text-muted-foreground">{t.role}</p>
                  </div>
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
                  "relative flex flex-col rounded-2xl border p-6 transition-[transform,box-shadow] duration-200 md:p-7",
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
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Veelgestelde vragen</h2>
          </div>
          <div className="mt-10 space-y-3">
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

      <motion.section className="border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]" {...fadeUp}>
        <div className="mx-auto max-w-xl px-4 text-center md:px-8">
          <div className="cf-landing-pro-card px-6 py-10 md:px-10 md:py-12">
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
