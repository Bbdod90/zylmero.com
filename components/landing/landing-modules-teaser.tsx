"use client";

import { motion } from "framer-motion";
import { Blocks, Bot, Inbox, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const MODULES = [
  {
    title: "Website-chat",
    body: "Bezoekers op je site direct helpen — antwoorden en doorzetten naar je inbox.",
    Icon: Bot,
  },
  {
    title: "Inbox-rust",
    body: "Orde in mail en berichten — minder zoeken, meer actie.",
    Icon: Inbox,
  },
  {
    title: "Automatisering",
    body: "Herinneringen en slimme vervolgstappen — minder handmatig nagmailen.",
    Icon: Zap,
  },
  {
    title: "Branche & maatwerk",
    body: "Flows die passen bij jouw soort zaak — uitbreidbaar als je groeit.",
    Icon: Blocks,
  },
] as const;

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

export function LandingModulesTeaser({ className }: { className?: string }) {
  return (
    <motion.div className={cn("mx-auto max-w-[1100px] px-4 md:px-8", className)} {...fade}>
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-primary/25 bg-gradient-to-br from-muted/25 via-background/80 to-primary/[0.04] px-5 py-9 md:px-10 md:py-11 dark:border-primary/35 dark:from-white/[0.04] dark:via-transparent dark:to-primary/[0.06]">
        <div
          className="pointer-events-none absolute -right-24 top-0 size-[18rem] rounded-full bg-primary/[0.08] blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Groeien wanneer jij wilt
          </p>
          <h3 className="mt-3 text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Later uit te breiden — niet alles tegelijk nodig
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Je start met het hoofdproduct: overzicht en opvolging van aanvragen. Daarna kun je modules bijzetten die bij jouw zaak passen — geen vol pakket verplicht op dag één.
          </p>
        </div>

        <ul className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map(({ title, body, Icon }, i) => (
            <li
              key={title}
              className={cn(
                "group rounded-2xl border border-border/45 bg-card/70 p-5 shadow-sm transition duration-300",
                "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
                "dark:border-white/[0.08] dark:bg-[hsl(228_26%_9%/0.65)]",
              )}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary ring-1 ring-primary/15">
                <Icon className="size-5" strokeWidth={1.65} aria-hidden />
              </div>
              <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>

        <p className="relative mt-8 text-center text-xs text-muted-foreground">
          Beschikbaarheid per module kan verschillen — in het account zie je wat je kunt activeren.
        </p>
      </div>
    </motion.div>
  );
}
