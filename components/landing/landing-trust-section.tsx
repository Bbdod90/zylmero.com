"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

const PLACEHOLDERS = [
  {
    quote:
      "Voorheen bleven WhatsApp en mail liggen als ik op locatie was. Nu krijgt de klant meteen een helder antwoord en zie ik zelf wat ik nog moet afmaken.",
    name: "R. de Vries",
    role: "Installatiebedrijf · regio Utrecht",
  },
  {
    quote:
      "Het gaat bij ons om volume en snelheid. Als we een uur later reageren, is de klant al verder. Dit houdt de druk eraf zonder extra mensen aan te nemen.",
    name: "M. Jansen",
    role: "Garage · Randstad",
  },
  {
    quote:
      "Ik wil geen ingewikkeld systeem. Wel overzicht en rust in mijn inbox. Dat is precies wat we nu hebben.",
    name: "S. Öztürk",
    role: "Salon · Zuid-Nederland",
  },
] as const;

export function LandingTrustSection() {
  return (
    <motion.section
      id="vertrouwen"
      className="scroll-mt-28 border-b border-border/30 bg-gradient-to-b from-muted/15 to-transparent py-20 md:py-28 dark:border-white/[0.06] dark:from-white/[0.02] dark:to-transparent"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="cf-landing-eyebrow">Ervaring</p>
          <h2 className="cf-landing-h2 mt-4">Wat ondernemers zoeken: rust, snelheid, resultaat</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Voorbeelden ter illustratie — straks vul je hier echte reviews of cases van klanten in.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 md:grid-cols-3 md:gap-5">
          {PLACEHOLDERS.map((t) => (
            <li key={t.name} className="cf-landing-pro-card flex flex-col p-7 md:p-8">
              <Quote className="size-8 text-primary/35" aria-hidden strokeWidth={1.25} />
              <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-foreground md:text-[0.9375rem]">
                “{t.quote}”
              </blockquote>
              <footer className="mt-6 border-t border-border/40 pt-5 dark:border-white/[0.08]">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.role}</p>
              </footer>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-6 rounded-2xl border border-dashed border-border/50 px-6 py-5 text-center dark:border-white/[0.12]">
          <div>
            <p className="text-2xl font-semibold tabular-nums text-foreground md:text-3xl">24/7</p>
            <p className="mt-1 text-xs text-muted-foreground">Bereikbaar voor eerste antwoord</p>
          </div>
          <div className="hidden h-10 w-px bg-border/60 sm:block dark:bg-white/[0.1]" aria-hidden />
          <div>
            <p className="text-2xl font-semibold tabular-nums text-foreground md:text-3xl">1</p>
            <p className="mt-1 text-xs text-muted-foreground">Inbox voor al je kanalen</p>
          </div>
          <div className="hidden h-10 w-px bg-border/60 sm:block dark:bg-white/[0.1]" aria-hidden />
          <div>
            <p className="text-2xl font-semibold tabular-nums text-foreground md:text-3xl">0</p>
            <p className="mt-1 text-xs text-muted-foreground">Extra IT-beheer nodig</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
