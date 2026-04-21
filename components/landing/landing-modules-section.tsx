"use client";

import { motion } from "framer-motion";
import { Inbox, MessageSquare, Workflow } from "lucide-react";

const MODULES = [
  {
    title: "Widget op je site",
    body: "Bezoeker laat een aanvraag achter — jij ziet hem meteen bij de rest.",
    Icon: MessageSquare,
  },
  {
    title: "Inbox met overzicht",
    body: "Geen speurtocht meer door apps. Wat spoed heeft, staat vooraan.",
    Icon: Inbox,
  },
  {
    title: "Opvolging op ritme",
    body: "Herinneringen en stappen die passen bij een klein team — zonder dagelijks onderhoud.",
    Icon: Workflow,
  },
] as const;

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

export function LandingModulesSection() {
  return (
    <motion.section
      id="modules"
      className="scroll-mt-28 border-b border-border/30 py-20 md:py-24 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="cf-landing-eyebrow">Later uitbreiden</p>
          <h2 className="cf-landing-h2 mt-4">Alles hoeft niet vandaag</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Begin met snelheid en overzicht. Breid uit met widget en vaste opvolgritmes wanneer je daar klaar voor bent.
          </p>
        </div>
        <ul className="mt-14 grid gap-5 md:grid-cols-3 md:gap-6">
          {MODULES.map(({ title, body, Icon }) => (
            <li key={title} className="cf-landing-pro-card p-7 md:p-8">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
