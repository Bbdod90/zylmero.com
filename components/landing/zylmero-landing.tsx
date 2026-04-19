"use client";

import { Fragment } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronRight,
  Flame,
  Inbox,
  Layers,
  MessageCircle,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Unlock,
  Users,
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

const HERO_PILLS = [
  "Website-chatbot · eerste antwoord direct",
  "Mail · WhatsApp · site → één overzicht",
  "Minder zoeken, meer geboekt",
] as const;

const VALUE_BLOCKS = [
  {
    title: "Sneller eerste antwoord",
    desc: "Ook als jij op de werkvloer staat — de klant merkt tempo.",
    Icon: Zap,
  },
  {
    title: "Minder gemiste aanvragen",
    desc: "Mail, site en berichten op één plek — je hoeft niet te gokken waar het binnenkwam.",
    Icon: Inbox,
  },
  {
    title: "Meer uit dezelfde stroom",
    desc: "Meer afspraken uit leads die je al binnenkrijgt.",
    Icon: CalendarCheck,
  },
  {
    title: "Wat nu telt, vooraan",
    desc: "Urgentie en rust — minder chaotisch zoeken in threads.",
    Icon: Flame,
  },
  {
    title: "Minder rommel tussen apps",
    desc: "WhatsApp, mail, site en briefjes op één lijn.",
    Icon: Layers,
  },
  {
    title: "Rust in je hoofd",
    desc: "Minder snel vergeten op te volgen.",
    Icon: ShieldCheck,
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "Kost dit veel tijd om op te zetten?",
    a: "Nee — je koppelt je kanalen en werkt vanuit één overzicht. Je hoeft geen IT-project te draaien: start klein, breid uit als het bevalt.",
    Icon: Timer,
  },
  {
    q: "Ik ben maar klein — heb ik dit wel nodig?",
    a: "Juist kleine zaken verliezen aanvragen omdat er niemand fulltime achter de telefoon zit. Als je genoeg hebt aan mail, WhatsApp en website om klanten binnen te krijgen, heb je genoeg aan structuur om ze niet te verliezen.",
    Icon: Users,
  },
  {
    q: "Waarvoor betaal ik precies?",
    a: "Voor minder chaos in je aanvragen en snellere opvolging — zodat je minder omzet laat liggen. Geen betaling voor “software om software”; wel voor grip en tempo richting klanten.",
    Icon: Sparkles,
  },
  {
    q: "Zit ik ergens aan vast?",
    a: "Niet voor de proef. Betaald abonnement: maandelijks opzegbaar, geen jaarcontract. Je hoeft niet alles meteen af te nemen — later modules bijzetten kan.",
    Icon: Unlock,
  },
] as const;

function testimonialInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = (parts[1]?.[0] ?? parts[0]?.[1] ?? "").toString();
  return `${a}${b}`.toUpperCase();
}

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
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_85%_55%_at_50%_-18%,hsl(var(--primary)/0.12),transparent_58%),radial-gradient(ellipse_55%_42%_at_100%_5%,hsl(var(--primary)/0.07),transparent_52%),radial-gradient(ellipse_50%_38%_at_0%_22%,hsl(220_35%_45%/0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.16),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_0%,hsl(var(--primary)/0.1),transparent_50%),radial-gradient(ellipse_50%_35%_at_0%_20%,hsl(262_40%_45%/0.08),transparent_50%)]"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 -z-10 cf-landing-grain" aria-hidden />
      <LandingNav />

      <section className="relative overflow-hidden border-b border-border/40 dark:border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_-25%,hsl(var(--primary)/0.14),transparent_58%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--border) / 0.4) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.4) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
          aria-hidden
        />
        <div className="cf-landing-grain pointer-events-none absolute inset-0 opacity-80" aria-hidden />

        <div className="relative mx-auto max-w-[1200px] px-4 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <motion.div {...fadeUp}>
            <p className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-border/60 bg-muted/45 px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.08)] backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.05]">
              <Sparkles className="size-3.5 shrink-0 text-primary" />
              {HERO_TRUST}
            </p>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-[3.15rem] dark:bg-gradient-to-br dark:from-white dark:via-zinc-100 dark:to-zinc-500 dark:bg-clip-text dark:text-transparent">
              {HERO_H1}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {HERO_SUB}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {HERO_PILLS.map((label) => (
                <li
                  key={label}
                  className="rounded-full border border-border/50 bg-background/80 px-3.5 py-1.5 text-[0.8125rem] font-medium text-foreground shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.12),0_2px_12px_-4px_hsl(0_0%_0%/0.2)] backdrop-blur-md dark:border-white/[0.12] dark:bg-white/[0.05] dark:shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.08),0_4px_24px_-8px_hsl(0_0%_0%/0.5)]"
                >
                  {label}
                </li>
              ))}
            </ul>
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
              className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/15 via-primary/[0.06] to-violet-500/[0.06] blur-3xl dark:-inset-6 dark:from-primary/22 dark:via-primary/10 dark:to-violet-500/10"
              aria-hidden
            />
            <div className="relative rounded-[1.35rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-[1px] shadow-[0_32px_80px_-48px_hsl(var(--primary)/0.55)] dark:border-white/[0.12] dark:from-white/[0.08]">
              <div className="overflow-hidden rounded-[1.3rem]">
                <HeroInboxMock />
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingPainCostSection />

      <motion.section
        id="hoe-het-werkt"
        className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/[0.05] via-muted/25 to-background py-16 md:py-24 dark:border-white/[0.06] dark:from-primary/[0.08] dark:via-[hsl(228_28%_7%/0.85)] dark:to-background"
        {...fadeUp}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_50%_-15%,hsl(var(--primary)/0.09),transparent_55%)] dark:bg-[radial-gradient(ellipse_65%_50%_at_50%_-15%,hsl(var(--primary)/0.12),transparent_55%)]" aria-hidden />
        <div className="cf-landing-grain pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div className="relative mx-auto max-w-[1200px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-foreground md:text-[2rem]">
            Zo werkt het — van aanvraag naar afspraak
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground md:text-base">
            Geen ingewikkelde trajecten: aanvraag binnen, snel antwoord, duidelijke volgende stap — ook als jij net op
            de klus staat.
          </p>

          <div className="mt-12 flex flex-col items-stretch md:mt-14 md:flex-row md:items-stretch md:justify-center md:gap-2 lg:gap-4">
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
                  body: "Via je site-chat en je kanalen: een eerste reactie in jouw branchetaal — geen uren stilte voor de klant.",
                  Icon: MessageCircle,
                },
                {
                  step: "3",
                  title: "Van vraag naar geboekt moment",
                  body: "Je ziet wie wat heeft gezegd en wat nog openstaat — minder vergeetmomenten.",
                  Icon: CalendarCheck,
                },
              ] as const
            ).map((item, index) => (
              <Fragment key={item.step}>
                <div
                  className={cn(
                    "group relative mx-auto flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl border px-7 pb-8 pt-9 text-center",
                    "border-border/45 bg-card/90 shadow-[0_4px_28px_-14px_hsl(222_48%_32%/0.18),inset_0_1px_0_0_hsl(0_0%_100%/0.55)]",
                    "backdrop-blur-md transition-all duration-300",
                    "hover:-translate-y-[5px] hover:border-primary/35 hover:shadow-[0_28px_56px_-28px_hsl(var(--primary)/0.28)]",
                    "dark:border-white/[0.1] dark:bg-[linear-gradient(165deg,hsl(228_26%_10%/0.85),hsl(228_28%_6%/0.92))] dark:shadow-[0_12px_48px_-28px_rgba(0,0,0,0.55)] dark:hover:border-primary/45 md:max-w-none md:flex-1",
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

      <LandingWithoutWithSection />

      <LandingDashboardPeek />

      <motion.section
        id="wat-je-krijgt"
        className="relative overflow-hidden border-b border-border/40 py-14 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_120%,hsl(var(--primary)/0.12),transparent_58%),radial-gradient(ellipse_45%_35%_at_10%_50%,hsl(262_45%_50%/0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_70%_55%_at_50%_120%,hsl(var(--primary)/0.14),transparent_58%)]"
          aria-hidden
        />
        <div className="cf-landing-grain pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-[960px] px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
              Wat je koopt — in gewone taal
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground md:text-[2rem]">
              Wat Zylmero voor je doet
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-[1.0625rem]">
              Je betaalt niet voor “een dashboard” alleen — je betaalt om minder klanten te missen en meer uit de aanvragen te halen die je al binnenkrijgt.
            </p>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:gap-5">
            {VALUE_BLOCKS.map(({ title, desc, Icon }) => (
              <li
                key={title}
                className="group relative flex gap-4 overflow-hidden rounded-2xl border border-border/45 bg-card/45 p-5 text-left shadow-[0_12px_40px_-28px_rgba(0,0,0,0.25)] backdrop-blur-md transition duration-300 hover:border-primary/30 hover:shadow-[0_20px_48px_-32px_hsl(var(--primary)/0.2)] dark:border-white/[0.09] dark:bg-[linear-gradient(145deg,hsl(228_26%_10%/0.55),hsl(228_28%_7%/0.72))]"
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-50 transition group-hover:opacity-100"
                  aria-hidden
                />
                <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/28 to-primary/10 text-primary shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.15)] ring-1 ring-primary/20 transition group-hover:scale-[1.05]">
                  <Icon className="size-5" strokeWidth={1.65} aria-hidden />
                </span>
                <div className="relative min-w-0">
                  <p className="text-[0.9375rem] font-semibold leading-snug text-foreground md:text-base">{title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
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

      <motion.section className="relative overflow-hidden border-b border-border/40 py-14 md:py-20 dark:border-white/[0.06]" {...fadeUp}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--primary)/0.07),transparent_55%)]" aria-hidden />
        <div className="relative mx-auto max-w-[1200px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-foreground md:text-[2rem]">
            Wat andere ondernemers merken
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">
            Voorbeeldreacties — geen echte klantquotes. Wel herkenbare situaties voor zzp en kleine zaken.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
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
              <blockquote
                key={t.name}
                className="relative flex gap-4 overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-b from-card/95 to-card/50 p-6 shadow-[0_24px_56px_-36px_rgba(0,0,0,0.5)] ring-1 ring-primary/[0.08] transition duration-300 hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-[0_28px_64px_-32px_hsl(var(--primary)/0.25)] dark:border-white/[0.1] dark:from-[hsl(228_26%_11%/0.92)] dark:to-[hsl(228_28%_7%/0.6)]"
              >
                <div
                  className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-primary/[0.14] blur-3xl"
                  aria-hidden
                />
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/12 text-sm font-bold tabular-nums text-primary ring-1 ring-primary/25 shadow-inner">
                  {testimonialInitials(t.name)}
                </div>
                <div className="relative min-w-0 flex-1">
                  <div className="mb-2 flex gap-0.5 text-primary" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-primary/25 text-primary/70" strokeWidth={1.5} />
                    ))}
                  </div>
                  <Quote
                    className="mb-2 size-5 text-primary/35 dark:text-primary/45"
                    aria-hidden
                  />
                  <p className="text-sm leading-relaxed text-foreground md:text-[0.9375rem]">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-4 border-t border-border/40 pt-4">
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.role}</p>
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
          <div id="indicatie" className="scroll-mt-28">
            <LandingMissedRevenueEstimator className="mb-2" />
          </div>

          <h2 className="mt-14 text-center text-2xl font-extrabold tracking-tight text-foreground md:text-[2rem]">
            Prijzen — je betaalt voor rust en resultaat
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-muted-foreground md:text-base">
            Start gratis. Kies een pakket als je klaar bent — klein beginnen kan, uitbreiden ook. Je betaalt voor minder gemiste aanvragen en snellere opvolging, niet voor “losse knopjes”.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {BILLING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 md:p-7",
                  plan.popular
                    ? "border-primary/50 bg-gradient-to-b from-primary/[0.14] via-primary/[0.06] to-transparent shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_32px_64px_-36px_hsl(var(--primary)/0.45)] ring-1 ring-primary/20 lg:scale-[1.03] dark:via-primary/[0.08]"
                    : "border-border/55 bg-card/50 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.35)] hover:border-primary/35 hover:shadow-[0_20px_48px_-32px_hsl(var(--primary)/0.15)] dark:border-white/[0.1] dark:bg-[hsl(228_26%_9%/0.55)]",
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

          <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-primary/20 bg-primary/[0.04] px-5 py-4 text-center text-xs leading-relaxed text-muted-foreground shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.06)] dark:border-primary/25 dark:bg-primary/[0.06] md:text-sm">
            Chatbot, inbox en extra modules kun je gefaseerd inzetten — zie{" "}
            <a href="#diensten-website" className="font-semibold text-foreground underline decoration-primary/60 underline-offset-4 transition hover:text-primary">
              diensten voor websites
            </a>{" "}
            hierboven.
          </div>
        </div>
      </motion.section>

      <motion.section
        id="faq"
        className="relative overflow-hidden border-b border-border/40 py-14 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_100%,hsl(var(--primary)/0.09),transparent_55%)]" aria-hidden />
        <div className="relative mx-auto max-w-2xl px-4 md:px-8">
          <div className="text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Veelgestelde vragen</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground md:text-[2rem]">FAQ</h2>
          </div>
          <div className="mt-8 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group overflow-hidden rounded-2xl border border-border/45 bg-card/50 shadow-[0_8px_32px_-24px_rgba(0,0,0,0.35)] backdrop-blur-md transition open:border-primary/35 open:bg-primary/[0.05] open:shadow-[0_16px_48px_-28px_hsl(var(--primary)/0.18)] hover:border-primary/28 dark:border-white/[0.09] dark:bg-[hsl(228_26%_9%/0.55)] dark:open:bg-primary/[0.08]"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 text-[0.9375rem] font-semibold text-foreground md:px-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 dark:bg-primary/18">
                    <item.Icon className="size-4" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">{item.q}</span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-border/35 px-4 pb-4 pt-3 dark:border-white/[0.06] md:px-5 md:pb-5">
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="relative overflow-hidden border-b border-border/40 py-14 md:py-20 dark:border-white/[0.06]" {...fadeUp}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_30%,hsl(var(--primary)/0.1),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-2xl px-4 text-center md:px-8">
          <div className="absolute inset-0 -z-10 rounded-[1.75rem] bg-gradient-to-br from-primary/[0.12] via-transparent to-violet-500/[0.08] blur-3xl" aria-hidden />
          <div className="rounded-[1.5rem] border border-border/50 bg-gradient-to-b from-card/80 to-card/40 px-6 py-10 shadow-[0_28px_72px_-40px_hsl(var(--primary)/0.35)] backdrop-blur-xl dark:border-white/[0.1] dark:from-[hsl(228_26%_11%/0.85)] dark:to-[hsl(228_28%_7%/0.55)]">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground md:text-[2rem]">
              Zelf proberen
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Probeer de chat hierboven of log in op de demo — zo voelt het als een klant wél snel antwoord krijgt.
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
