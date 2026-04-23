"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LandingHeroFlowVisual } from "@/components/landing/landing-hero-flow-visual";
import { LandingNav } from "@/components/landing/landing-nav";
import { StickyConversionBar } from "@/components/landing/sticky-conversion-bar";
import { Button } from "@/components/ui/button";
import { BRAND_CONTACT_EMAIL, BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

const LANDING_MAX = "mx-auto w-full max-w-[1100px] px-5 sm:px-8";

function SectionShell({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-28", className)}>
      <div className={cn(LANDING_MAX, "py-20 md:py-28")}>{children}</div>
    </section>
  );
}

export function ZylmeroLanding() {
  return (
    <div className="relative min-h-dvh zm-landing-atmosphere overflow-x-hidden pb-28 text-foreground md:pb-24">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 zm-landing-spotlight opacity-90 dark:opacity-100" />
        <div className="absolute inset-0 zm-landing-edge-glow opacity-60 dark:opacity-85" />
        <div className="absolute inset-0 zm-landing-radial-fade opacity-70" />
        <div className="absolute inset-0 zm-landing-dots opacity-[0.45] dark:opacity-[0.35]" />
      </div>
      <div className="zm-landing-grain-fixed" aria-hidden />

      <div className="relative z-10">
        <LandingNav />

        {/* 1 — Hero */}
        <header className="border-b border-border/40 dark:border-white/[0.08]">
          <div
            className={cn(
              LANDING_MAX,
              "grid gap-14 py-20 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-16 md:py-24 lg:py-28",
            )}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="max-w-[22ch] text-balance text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.045em] text-foreground sm:text-5xl md:text-[3.25rem] lg:text-[3.5rem]">
                Je mist klanten — zonder dat je het doorhebt
              </h1>
              <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
                Zylmero reageert automatisch op elke aanvraag en zet ze om in afspraken. Jij hoeft niets meer te doen.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full px-10 text-base font-semibold shadow-[0_4px_24px_-8px_hsl(var(--primary)/0.5)]"
                >
                  <Link href="/signup">Start gratis</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-14 rounded-full px-6 text-base font-semibold text-foreground hover:bg-foreground/[0.06]"
                >
                  <a href="#oplossing" className="inline-flex items-center gap-2">
                    Bekijk hoe het werkt
                    <ArrowRight className="size-5 opacity-70" aria-hidden />
                  </a>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <LandingHeroFlowVisual />
            </motion.div>
          </div>
        </header>

        {/* 2 — Probleem */}
        <SectionShell id="probleem">
          <motion.div {...fade}>
            <h2 className="max-w-[18ch] text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl md:text-5xl md:leading-[1.08]">
              Dit kost je elke dag klanten
            </h2>
            <ul className="mt-14 max-w-2xl space-y-8 text-xl font-medium leading-snug tracking-tight text-foreground md:text-2xl md:leading-snug">
              <li className="border-b border-border/30 pb-8 dark:border-white/[0.08]">
                Je reageert te laat → klant kiest iemand anders
              </li>
              <li className="border-b border-border/30 pb-8 dark:border-white/[0.08]">Je mist berichten buiten werktijd</li>
              <li>Je verliest overzicht in WhatsApp / mail</li>
            </ul>
            <p className="mt-14 text-xl font-semibold tracking-tight text-foreground md:text-2xl">En dat zie je terug in je omzet.</p>
          </motion.div>
        </SectionShell>

        {/* 3 — Oplossing */}
        <SectionShell id="oplossing" className="bg-muted/20 dark:bg-white/[0.02]">
          <motion.div {...fade}>
            <h2 className="max-w-[20ch] text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl md:text-5xl md:leading-[1.08]">
              {BRAND_NAME} lost dit volledig voor je op
            </h2>
            <ul className="mt-14 max-w-2xl space-y-8 text-xl font-medium leading-snug tracking-tight text-foreground md:text-2xl md:leading-snug">
              <li className="border-b border-border/30 pb-8 dark:border-white/[0.08]">Reageert direct op elke aanvraag</li>
              <li className="border-b border-border/30 pb-8 dark:border-white/[0.08]">Filtert alleen serieuze klanten</li>
              <li>Plant automatisch afspraken in</li>
            </ul>
          </motion.div>
        </SectionShell>

        {/* 4 — Resultaat */}
        <SectionShell id="resultaat">
          <motion.div {...fade}>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl md:text-5xl">Wat dit je oplevert</h2>
            <ul className="mt-14 max-w-3xl space-y-6 text-lg font-medium leading-snug text-foreground md:space-y-7 md:text-xl">
              <li>+ Meer aanvragen die klant worden</li>
              <li>+ Minder tijd kwijt aan reageren</li>
              <li>+ Altijd direct antwoord</li>
              <li>+ Meer omzet zonder extra werk</li>
            </ul>
            <div className="mt-16 rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.12] via-card to-card px-8 py-14 text-center dark:from-primary/[0.14] dark:via-[hsl(222_28%_10%)] dark:to-[hsl(222_32%_7%)] md:mt-20 md:px-12 md:py-16">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Indicatief</p>
              <p className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-foreground sm:text-6xl md:text-7xl">+32%</p>
              <p className="mt-2 text-lg font-medium text-foreground md:text-xl">meer conversie</p>
            </div>
          </motion.div>
        </SectionShell>

        {/* 5 — CTA */}
        <motion.section id="start" className="scroll-mt-28" {...fade}>
          <div className="relative overflow-hidden bg-[hsl(222_44%_9%)] py-20 text-white md:py-28 dark:bg-[hsl(222_36%_6%)]">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-20%,hsl(218_55%_42%/0.4),transparent_55%)]"
              aria-hidden
            />
            <div className="cf-landing-grain pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden />
            <div className={cn(LANDING_MAX, "relative text-center")}>
              <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl md:text-5xl">Stop met klanten missen</h2>
              <p className="mx-auto mt-6 max-w-md text-lg text-white/75 md:text-xl">Binnen 5 minuten actief</p>
              <div className="mt-10">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full bg-white px-12 text-base font-semibold text-[hsl(222_44%_9%)] shadow-lg shadow-black/30 hover:bg-white/95"
                >
                  <Link href="/signup">Start gratis</Link>
                </Button>
              </div>
              <p className="mt-6 font-mono text-xs text-white/55">Geen creditcard nodig</p>
            </div>
          </div>
        </motion.section>

        <footer className="border-t border-border/45 bg-background/80 py-10 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[hsl(222_38%_6%/0.7)]">
          <div className={cn(LANDING_MAX, "flex flex-col items-center justify-between gap-6 sm:flex-row")}>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-[11px] font-bold text-primary-foreground shadow-md ring-1 ring-black/10 dark:ring-white/15">
                {BRAND_LOGO_MONOGRAM}
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">{BRAND_NAME}</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm font-medium text-muted-foreground">
              <Link href="/login" className="transition-colors hover:text-foreground">
                Inloggen
              </Link>
              <a href={`mailto:${BRAND_CONTACT_EMAIL}`} className="transition-colors hover:text-foreground">
                Contact
              </a>
            </nav>
          </div>
        </footer>

        <StickyConversionBar />
      </div>
    </div>
  );
}
