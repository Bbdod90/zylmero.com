"use client";

import { motion } from "framer-motion";
import { Bot, Inbox, Workflow } from "lucide-react";

const MODULES = [
  {
    title: "Website-chatbot",
    body: "Bezoekers krijgen direct antwoord — ook als jij offline bent.",
    Icon: Bot,
  },
  {
    title: "Inbox / mailbox cleaner",
    body: "Orde in aanvragen zodat niemand tussen wal en schip valt.",
    Icon: Inbox,
  },
  {
    title: "Slimme opvolging",
    body: "Automatisering die past bij zzp en kleine teams — uitbreidbaar als je groeit.",
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
      className="scroll-mt-28 border-b border-border/30 py-16 md:py-24 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Uitbreidbaar</p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Extra modules — wanneer jij er klaar voor bent
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Klein starten, later uitbreiden. Je hoeft niet alles tegelijk te nemen — Zylmero groeit mee met je zaak.
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
