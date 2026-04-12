"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Sparkles } from "lucide-react";
import { AnonymousDemoForm, useDemoRole } from "@/components/landing/demo-role-context";
import { HeroInboxMock } from "@/components/landing/hero-inbox-mock";
import { LandingInteractiveChat } from "@/components/landing/landing-interactive-chat";
import { LandingNav } from "@/components/landing/landing-nav";
import { StickyConversionBar } from "@/components/landing/sticky-conversion-bar";
import { Button } from "@/components/ui/button";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { heroSubtitleForRole } from "@/lib/demo/hero-mock-copy";
import { BRAND_CONTACT_EMAIL, BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const HERO_H1 = "Je reageert te laat — en dat kost je klanten";

const HERO_TRUST = "Vaak al terugverdiend met één extra afspraak";

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
    <div className="relative min-h-dvh overflow-x-hidden bg-background pb-32 text-foreground md:pb-24">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.14),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_0%,hsl(var(--primary)/0.08),transparent_50%),radial-gradient(ellipse_50%_35%_at_0%_20%,hsl(220_40%_50%/0.06),transparent_50%)]"
        aria-hidden
      />
      <LandingNav />

      <section className="relative overflow-hidden border-b border-border/40 dark:border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_-25%,hsl(var(--primary)/0.14),transparent_58%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />

        <div className="relative mx-auto max-w-[1200px] px-4 pb-20 pt-12 md:px-8 md:pb-28 md:pt-16 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <motion.div {...fadeUp}>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 shrink-0 text-primary" />
              {HERO_TRUST}
            </p>
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-[3rem]">
              {HERO_H1}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {heroSub}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 min-h-[48px] rounded-xl px-8 text-base font-semibold sm:h-14 sm:min-h-[52px]"
              >
                <Link href="/signup">Start gratis proefperiode</Link>
              </Button>
              <AnonymousDemoForm className="w-full sm:w-auto">
                <Button
                  type="submit"
                  size="lg"
                  variant="outline"
                  className="h-12 min-h-[48px] w-full rounded-xl border-border/80 px-8 text-base font-semibold sm:h-14 sm:min-h-[52px] sm:w-auto"
                >
                  Bekijk hoe het werkt
                  <ArrowRight className="ml-2 size-4 opacity-80" />
                </Button>
              </AnonymousDemoForm>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              Geen creditcard. Je stopt wanneer je wilt.
            </p>
          </motion.div>
          <div className="relative mt-16 lg:mt-0">
            <HeroInboxMock />
          </div>
        </div>
      </section>

      <section
        id="herkenning"
        className="border-b border-border/40 bg-muted/[0.35] py-14 dark:border-white/[0.06] dark:bg-white/[0.02] md:py-16"
      >
        <div className="mx-auto max-w-[720px] px-4 text-center md:px-8">
          <p className="text-lg font-medium leading-relaxed text-foreground md:text-xl">
            Herken je dit? Aanvragen via WhatsApp, mail of je site — en jij zit midden in het werk.
          </p>
        </div>
      </section>

      <motion.section
        id="probleem"
        className="border-b border-border/40 py-16 md:py-24 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[720px] px-4 md:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Wat er misgaat
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Je ziet het bericht te laat. Of je reageert wel, maar de klant is al verder. Dat kost je omzet.
          </p>
          <ul className="mt-10 space-y-3">
            {[
              "Je reageert niet op tijd",
              "Berichten staan op drie plekken",
              "Opvolgen schuift naar morgen",
              "Je weet niet wat een aanvraag waard is",
            ].map((line) => (
              <li
                key={line}
                className="rounded-xl border border-border/50 bg-card/80 px-5 py-4 text-base text-foreground transition-colors duration-200 hover:border-primary/25 hover:bg-card"
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      <motion.section
        id="oplossing"
        className="border-b border-border/40 py-16 md:py-24 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[720px] px-4 md:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Wat {BRAND_NAME} doet
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Iemand stuurt een aanvraag. {BRAND_NAME} antwoordt meteen, stelt korte vragen en helpt door naar een
            afspraak. Jij hoeft niet constant je telefoon te checken.
          </p>
        </div>
      </motion.section>

      <motion.section
        id="hoe-het-werkt"
        className="border-b border-border/40 py-16 md:py-24 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Hoe het werkt
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base text-muted-foreground">
            Drie stappen. Geen handleiding van twintig pagina’s.
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-10">
            {[
              { step: "1", title: "Aanvraag komt binnen", body: "Via je site, mail of WhatsApp — alles op één plek." },
              {
                step: "2",
                title: `${BRAND_NAME} reageert direct`,
                body: "Korte, duidelijke antwoorden. Geen uren stilte.",
              },
              { step: "3", title: "Afspraak wordt ingepland", body: "De klant kiest een moment. Jij ziet het in je agenda." },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-border/50 bg-card/60 p-8 shadow-sm shadow-black/5 transition duration-300 dark:border-white/[0.08] dark:shadow-black/30 dark:hover:border-primary/25 dark:hover:bg-card/80"
              >
                <div className="mb-6 flex size-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-1 ring-primary/20 transition group-hover:bg-primary/20">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="resultaat"
        className="border-b border-border/40 py-16 md:py-24 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[720px] px-4 md:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Wat dit je oplevert
          </h2>
          <ul className="mt-10 space-y-4">
            {[
              "Sneller reageren dan je concurrent",
              "Meer afspraken",
              "Meer omzet uit dezelfde aanvragen",
              "Overzicht in je pipeline",
            ].map((t) => (
              <li key={t} className="flex gap-3 text-lg text-foreground">
                <Check className="mt-1 size-5 shrink-0 text-primary" />
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
        className="border-b border-border/40 py-16 md:py-24 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Wat anderen merken
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-base text-muted-foreground">
            Voorbeelden uit de praktijk (demo).
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Marco van den Berg",
                role: "Autoservice, Rotterdam",
                quote:
                  "Ik mis veel minder aanvragen. Vroeger zat ik ’s avonds alles in te halen — nu staat de afspraak er vaak al.",
              },
              {
                name: "Linda Visser",
                role: "Salon, Utrecht",
                quote: "Klanten krijgen meteen antwoord. Ik hoef niet meer te stressen of ik te laat ben.",
              },
              {
                name: "Tom Jansen",
                role: "Installatiebedrijf, Eindhoven",
                quote:
                  "Ik zie in één oogopslag welke aanvragen geld opleveren. Scheelt me uren zoekwerk.",
              },
            ].map((t) => (
              <blockquote
                key={t.name}
                className="rounded-2xl border border-border/50 bg-card/50 p-8 shadow-sm shadow-black/5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md dark:border-white/[0.08] dark:shadow-black/25"
              >
                <p className="text-base leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-6 border-t border-border/40 pt-6">
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="prijzen"
        className="relative border-b border-border/40 py-16 md:py-24 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl border border-border/50 bg-muted/25 p-8 text-center shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.35)] dark:border-white/[0.08] md:p-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Wat trage reactie je kost
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Als aanvragen blijven liggen, loop je omzet mis. Bij veel lokale bedrijven loopt dat snel op.
            </p>
            <p className="mt-8 text-3xl font-bold tabular-nums text-foreground md:text-4xl">
              €2.000 – €5.000
            </p>
            <p className="mt-2 text-sm text-muted-foreground">per maand gemiste omzet (richting)</p>
            <p className="mt-6 text-sm font-medium text-foreground">
              Eén extra klant betaalt je abonnement vaak al terug.
            </p>
          </div>

          <h2 className="mt-20 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Prijzen
          </h2>
          <p className="mx-auto mt-4 max-w-md text-center text-base text-muted-foreground">
            Start gratis. Pas daarna beslis je of je door wilt.
          </p>
          <div className="mt-14 grid gap-8 lg:grid-cols-3 lg:items-stretch">
            {BILLING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-8 transition duration-300 hover:-translate-y-0.5",
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
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-6">
                  <span className="text-4xl font-bold tabular-nums md:text-5xl">€{plan.priceEur}</span>
                  <span className="text-muted-foreground">/mnd</span>
                </p>
                <ul className="mt-8 flex-1 space-y-3 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={cn("mt-8 h-12 w-full rounded-xl text-base font-semibold")}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/signup">Start gratis proefperiode</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="faq"
        className="border-b border-border/40 py-16 md:py-24 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-2xl px-4 md:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">FAQ</h2>
          <div className="mt-12 space-y-2">
            {[
              {
                q: "Hoe snel kan ik starten?",
                a: "Meestal binnen een paar minuten. Je hebt geen creditcard nodig om te proberen.",
              },
              {
                q: "Wat merk ik er van?",
                a: "Minder aanvragen die blijven liggen. Meer afspraken uit hetzelfde aantal berichten.",
              },
              {
                q: "Past dit bij mijn bedrijf?",
                a: "Als je aanvragen binnenkrijgt en niet altijd meteen kunt antwoorden: waarschijnlijk wel.",
              },
              {
                q: "Kan ik weer stoppen?",
                a: "Ja. Je zit nergens aan vast.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border/50 bg-card/40 px-5 backdrop-blur-[2px] transition open:bg-muted/25 hover:border-primary/20 dark:border-white/[0.08]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 font-semibold text-foreground">
                  {item.q}
                  <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-4 text-base leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="border-b border-border/40 py-16 md:py-24 dark:border-white/[0.06]" {...fadeUp}>
        <div className="mx-auto max-w-2xl px-4 text-center md:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Probeer het zelf
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Zie hoe snel een aanvraag kan worden opgepakt.
          </p>
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="h-12 rounded-xl px-8 text-base font-semibold sm:h-14">
              <Link href="/signup">Start gratis proefperiode</Link>
            </Button>
            <AnonymousDemoForm>
              <Button
                type="submit"
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-xl px-8 text-base font-semibold sm:h-14 sm:w-auto"
              >
                Bekijk hoe het werkt
              </Button>
            </AnonymousDemoForm>
          </div>
        </div>
      </motion.section>

      <footer className="border-t border-border/40 py-14 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-4 md:flex-row md:justify-between md:px-8">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">
                {BRAND_LOGO_MONOGRAM}
              </div>
              <span className="font-semibold text-foreground">{BRAND_NAME}</span>
            </div>
            <p className="text-sm text-muted-foreground">Minder te laat, meer geboekt</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm font-medium text-muted-foreground">
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
