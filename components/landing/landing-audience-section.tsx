"use client";

import { motion } from "framer-motion";
import { Building2, Car, Hammer, Scissors, Stethoscope, Wrench } from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

const SEGMENTS = [
  {
    title: "Zzp en eenmanszaak",
    body: "Jij bent verkoper, planner én uitvoerder. Zylmero vangt aanvragen op en helpt de eerste reactie strak te houden.",
    Icon: Hammer,
  },
  {
    title: "Klein team (2–8 mensen)",
    body: "Geen aparte binnendienst nodig: één overzicht, duidelijke prioriteit, minder ruis tussen collega’s.",
    Icon: Building2,
  },
  {
    title: "Lokale dienstverlening",
    body: "Van loodgieter tot salon: als aanvragen binnenrollen via mail, WhatsApp of je site — past het.",
    Icon: Wrench,
  },
] as const;

const EXAMPLES = [
  { label: "Installatie & techniek", Icon: Wrench },
  { label: "Garage & mobiliteit", Icon: Car },
  { label: "Kapper & beauty", Icon: Scissors },
  { label: "Zorg & paramedisch", Icon: Stethoscope },
] as const;

export function LandingAudienceSection() {
  return (
    <motion.section
      id="voor-wie"
      className="scroll-mt-28 border-b border-border/30 py-20 md:py-28 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="cf-landing-eyebrow">Voor wie</p>
          <h2 className="cf-landing-h2 mt-4">Gebouwd voor ondernemers die het zelf druk hebben</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Geen enterprise-software. Wel grip op klanten die vandaag nog een antwoord verwachten.
          </p>
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {SEGMENTS.map(({ title, body, Icon }) => (
            <li key={title} className="cf-landing-pro-card p-7 md:p-8">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">{body}</p>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border/40 bg-muted/15 px-6 py-6 dark:border-white/[0.08] dark:bg-white/[0.03] md:px-8 md:py-7">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Voorbeelden van branches
          </p>
          <ul className="mt-5 flex flex-wrap justify-center gap-2.5">
            {EXAMPLES.map(({ label, Icon }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-3.5 py-2 text-xs font-medium text-foreground dark:border-white/[0.1]"
              >
                <Icon className="size-3.5 shrink-0 text-primary opacity-90" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
            Ook hoveniers, schoonmaak, schilders en andere lokale vakbedrijven — het gaat om aanvragen en snelheid, niet
            om je sectorlabel.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
