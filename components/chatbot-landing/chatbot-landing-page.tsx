"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  Filter,
  MessageCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { StickyConversionBar } from "@/components/landing/sticky-conversion-bar";
import { ChatDemo } from "@/components/chatbot-landing/chat-demo";
import { ChatbotFaq } from "@/components/chatbot-landing/chatbot-faq";
import { ChatbotNav } from "@/components/chatbot-landing/chatbot-nav";
import { ChatbotPricing } from "@/components/chatbot-landing/chatbot-pricing";
import { Button } from "@/components/ui/button";
import { BRAND_CONTACT_EMAIL, BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

export function ChatbotLandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background pb-28 text-foreground md:pb-24">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,hsl(var(--primary)/0.08),transparent_55%)] dark:bg-[radial-gradient(ellipse_85%_55%_at_50%_-18%,hsl(var(--primary)/0.1),transparent_58%)]"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 -z-10 cf-landing-grain opacity-75 dark:opacity-90" aria-hidden />

      <ChatbotNav />

      {/* 1. Hero */}
      <section className="relative overflow-hidden border-b border-border/30 dark:border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
        <div
          className="pointer-events-none absolute -left-1/3 top-0 h-[min(520px,70vh)] w-[70%] max-w-3xl rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12),transparent_68%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.16),transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-[1200px] px-4 pb-16 pt-10 md:px-8 md:pb-20 md:pt-14 lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-12 lg:pb-24">
          <motion.div {...fadeUp}>
            <span className="mb-5 inline-flex rounded-full border border-primary/25 bg-primary/[0.06] px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary">
              Chatbot · 5 minuten live
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-[1.06] tracking-tight text-foreground md:text-5xl lg:text-[3rem] dark:bg-gradient-to-b dark:from-white dark:to-zinc-400 dark:bg-clip-text dark:text-transparent">
              Binnen 5 minuten een chatbot op je website — die klanten voor je opvangt
            </h1>
            <p className="mt-6 max-w-xl text-base leading-[1.65] text-muted-foreground md:text-lg">
              Beantwoord vragen, plan afspraken en mis geen enkele bezoeker meer. Zonder technische kennis.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-12 rounded-xl px-7 text-base font-semibold sm:h-14">
                <Link href="/signup">Start gratis</Link>
              </Button>
              <AnonymousDemoForm className="w-full sm:w-auto">
                <Button
                  type="submit"
                  size="lg"
                  variant="demo"
                  className="h-12 w-full rounded-xl px-7 text-base font-semibold sm:h-14 sm:w-auto"
                >
                  Bekijk demo
                  <ArrowRight className="ml-2 size-4 opacity-90" />
                </Button>
              </AnonymousDemoForm>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Werkt op elke website · Geen code nodig
            </p>
          </motion.div>

          <div className="relative mt-14 lg:mt-0">
            <div
              className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-[radial-gradient(ellipse_at_45%_35%,hsl(var(--primary)/0.22),transparent_62%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_45%_30%,hsl(var(--primary)/0.28),transparent_65%)]"
              aria-hidden
            />
            <ChatDemo className="relative shadow-[0_34px_100px_-44px_rgb(0_0_0/0.72)]" />
          </div>
        </div>
      </section>

      {/* 2. Probleem */}
      <motion.section
        id="probleem"
        className="scroll-mt-28 border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[800px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Wat er nu gebeurt op jouw website
          </h2>
          <ul className="mt-10 space-y-4 text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base">
            {[
              "Bezoekers stellen vragen en krijgen geen antwoord",
              "Je bent niet altijd online",
              "Klanten klikken weg en komen niet terug",
              "Je mist aanvragen zonder dat je het doorhebt",
            ].map((line) => (
              <li key={line} className="flex gap-3 border-l-2 border-primary/25 pl-4 dark:border-primary/35">
                <span className="text-foreground">{line}</span>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-10 max-w-lg text-center text-base font-medium text-foreground">
            Dat kost je elke dag klanten.
          </p>
        </div>
      </motion.section>

      {/* 3. Oplossing */}
      <motion.section
        id="oplossing"
        className="scroll-mt-28 border-b border-border/30 bg-gradient-to-b from-muted/20 to-transparent py-16 md:py-20 dark:border-white/[0.06] dark:from-white/[0.02]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1180px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Dit doet jouw chatbot
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
            {[
              {
                title: "Beantwoord direct vragen",
                body: "Ook als jij offline bent — bezoekers krijgen meteen een bruikbaar antwoord.",
                Icon: MessageCircle,
              },
              {
                title: "Filter serieuze klanten",
                body: "Alleen relevante aanvragen komen bij jou terecht — minder ruis.",
                Icon: Filter,
              },
              {
                title: "Plant afspraken in",
                body: "Automatisch doorvragen naar dag en tijd — zonder heen-en-weer mailen.",
                Icon: CalendarClock,
              },
            ].map(({ title, body, Icon }) => (
              <div key={title} className="cf-landing-pro-card p-6 md:p-7">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 4. Live demo */}
      <motion.section
        id="demo"
        className="scroll-mt-28 border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="relative mx-auto max-w-[720px] px-4 md:px-8">
          <div
            className="pointer-events-none absolute inset-x-0 -top-8 mx-auto h-48 max-w-lg bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12),transparent_70%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.18),transparent_72%)]"
            aria-hidden
          />
          <div className="relative text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Live demo</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Probeer het zelf — zonder account
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-[1.65] text-muted-foreground">
              Kies een voorbeeld of typ zelf. Dit is hoe snel een bezoeker wordt geholpen.
            </p>
          </div>
          <div className="relative mx-auto mt-12 max-w-lg">
            <ChatDemo />
          </div>
        </div>
      </motion.section>

      {/* 5. Hoe het werkt */}
      <motion.section
        id="hoe-het-werkt"
        className="scroll-mt-28 border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[1180px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Zo staat jouw chatbot live
          </h2>
          <ol className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
            {[
              {
                step: "1",
                title: "Vertel kort wat je doet",
                body: "Branche, openingsuren, wat je aanbiedt — invullen, geen essay.",
              },
              {
                step: "2",
                title: "Wij maken je chatbot",
                body: `${BRAND_NAME} zet de juiste tonen en antwoorden voor jouw klanten.`,
              },
              {
                step: "3",
                title: "Plaats hem op je site",
                body: "In je account kopieer je één regel code vóór </body>. Live verkeer gaat als je proef- of betaalabonnement loopt — dan worden berichten ook echt verwerkt.",
              },
            ].map((item) => (
              <li key={item.step} className="cf-landing-pro-card p-6 md:p-7">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-1 ring-primary/20">
                  {item.step}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
            Na aanmelden: je vindt de embed onder{" "}
            <strong className="text-foreground">Instellingen → Widget</strong> en je verfijnt antwoorden onder{" "}
            <strong className="text-foreground">Bedrijf</strong> en <strong className="text-foreground">Kennis</strong>.
          </p>
        </div>
      </motion.section>

      {/* 6. Voor wie */}
      <motion.section
        id="voor-wie"
        className="scroll-mt-28 border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[720px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Voor wie is dit?
          </h2>
          <ul className="mt-10 space-y-4 text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base">
            {[
              "Bedrijven met afspraken (garage, salon, praktijk, monteur…)",
              "Websites met bezoekers die nu niets horen terug",
              "Ondernemers die niet de hele dag achter de chat willen zitten",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <Zap className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      {/* 7. Resultaat */}
      <motion.section
        id="resultaat"
        className="scroll-mt-28 border-b border-border/30 bg-muted/15 py-16 md:py-20 dark:border-white/[0.06] dark:bg-transparent"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[720px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Wat het je oplevert
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {["Meer aanvragen", "Minder gemiste klanten", "Sneller eerste contact", "Meer rust in je hoofd"].map(
              (label) => (
                <li
                  key={label}
                  className="cf-landing-pro-card flex items-center gap-3 px-5 py-4 text-sm font-medium text-foreground md:text-[0.9375rem]"
                >
                  <Sparkles className="size-5 shrink-0 text-primary/80" aria-hidden />
                  {label}
                </li>
              ),
            )}
          </ul>
        </div>
      </motion.section>

      {/* 8. Pricing */}
      <motion.section id="prijzen" className="scroll-mt-28 border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]" {...fadeUp}>
        <div className="mx-auto max-w-[1180px] px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Prijzen · chatbot</h2>
            <p className="mt-4 text-base leading-[1.65] text-muted-foreground">
              Kies wat bij je past. Start gratis — met een actieve proef of betaald plan kun je de widget op je site zetten
              en berichten laten binnenstromen.
            </p>
          </div>
          <ChatbotPricing />
        </div>
      </motion.section>

      {/* 9. Modules */}
      <motion.section
        id="modules"
        className="scroll-mt-28 border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]"
        {...fadeUp}
      >
        <div className="mx-auto max-w-[900px] px-4 md:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Uit te breiden met
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base leading-[1.65] text-muted-foreground">
            Later uitbreiden in hetzelfde account — geen nieuwe tools die naast elkaar leven.
          </p>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Inbox cleaner",
                body: "Mail, site en WhatsApp op één plek — minder zoekwerk.",
              },
              {
                title: "Lead dashboard",
                body: "Zie wat urgent is en wat nog wacht op jouw reactie.",
              },
              {
                title: "Automatische opvolging",
                body: "Herinneringen en vervolgstappen zonder losse briefjes.",
              },
            ].map(({ title, body }) => (
              <li key={title} className="cf-landing-pro-card p-6 text-center md:p-7">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-10 max-w-lg text-center text-sm text-muted-foreground">
            Volledige productpagina met alle modules:{" "}
            <Link href="/" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
              zylmero.com
            </Link>
          </p>
        </div>
      </motion.section>

      {/* 10. FAQ */}
      <motion.section id="faq" className="scroll-mt-28 border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]" {...fadeUp}>
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Veelgestelde vragen
          </h2>
          <ChatbotFaq />
        </div>
      </motion.section>

      {/* 11. Final CTA */}
      <motion.section id="cta" className="scroll-mt-28 py-16 md:py-20" {...fadeUp}>
        <div className="mx-auto max-w-2xl px-4 text-center md:px-8">
          <div className="cf-landing-pro-card px-6 py-10 md:px-10 md:py-12">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Laat geen bezoekers meer weggaan zonder reactie
            </h2>
            <p className="mt-4 text-base leading-[1.65] text-muted-foreground">
              Vandaag nog een werkende voorbeeldchat — morgen live op je eigen site.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="h-12 rounded-xl px-8 text-base font-semibold sm:h-14">
                <Link href="/signup">Start gratis</Link>
              </Button>
              <AnonymousDemoForm>
                <Button
                  type="submit"
                  size="lg"
                  variant="demo"
                  className="h-12 w-full rounded-xl px-8 text-base font-semibold sm:h-14 sm:w-auto"
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
            <Link href="/" className="flex items-center gap-2.5 text-foreground">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold">
                {BRAND_LOGO_MONOGRAM}
              </div>
              <span className="font-semibold">{BRAND_NAME}</span>
            </Link>
            <p className="text-xs text-muted-foreground">Chatbot · inbox · meer uit je aanvragen</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium">
            <Link href="/login" className="text-foreground transition-colors hover:text-primary">
              Inloggen
            </Link>
            <a href={`mailto:${BRAND_CONTACT_EMAIL}`} className="text-foreground transition-colors hover:text-primary">
              Contact
            </a>
            <Link href="/" className="text-foreground transition-colors hover:text-primary">
              Homepage
            </Link>
            <a href="#prijzen" className="text-foreground transition-colors hover:text-primary">
              Prijzen
            </a>
            <a href="#faq" className="text-foreground transition-colors hover:text-primary">
              FAQ
            </a>
          </nav>
        </div>
      </footer>

      <StickyConversionBar />
    </div>
  );
}
