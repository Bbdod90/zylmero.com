"use client";

import { motion } from "framer-motion";
import { CalendarClock, Inbox, MessageCircle, Route } from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

const BLOCKS = [
  {
    title: "Meteen een goed eerste antwoord",
    body: "Klanten horen snel iets degelijks — ook als jij op locatie bent of je telefoon niet ziet.",
    Icon: MessageCircle,
  },
  {
    title: "Alles op één rustige plek",
    body: "Mail, WhatsApp en je site: je ziet wat binnenkomt, wat wacht en wat spoed heeft.",
    Icon: Inbox,
  },
  {
    title: "Opvolging die niet stilvalt",
    body: "Serieuze leads blijven in beeld. Jij bepaalt waar het naartoe gaat — richting offerte of afspraak.",
    Icon: Route,
  },
  {
    title: "Meer uit dezelfde aanvragen",
    body: "Minder zoeken, minder vergeten, minder gemiste kansen. Dat vertaalt zich in concrete afspraken.",
    Icon: CalendarClock,
  },
] as const;

export function LandingSolutionSection() {
  return (
    <motion.section
      id="oplossing"
      className="scroll-mt-28 border-b border-border/30 py-20 md:py-28 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="cf-landing-eyebrow">De aanpak</p>
          <h2 className="cf-landing-h2 mt-4">Zylmero vangt aanvragen op en houdt ze in beweging</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Een AI-assistent voor zzp en kleine bedrijven: hij reageert direct op klantaanvragen, helpt serieuze leads
            opvolgen en haalt meer uit de aanvragen die je al binnenkrijgt — zonder dat jij overal achteraan hoeft te
            zitten.
          </p>
        </div>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {BLOCKS.map(({ title, body, Icon }) => (
            <li key={title} className="cf-landing-pro-card p-7 md:p-8">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mt-6 text-base font-semibold leading-snug text-foreground md:text-lg">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">{body}</p>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
          Jij houdt de regie: toon, kennis en grenzen stel je zelf in. Zylmero voert het eerste contact strak uit zodat
          jij kunt focussen op het werk dat je factureert.
        </p>
      </div>
    </motion.section>
  );
}
