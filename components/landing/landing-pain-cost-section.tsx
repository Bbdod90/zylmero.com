"use client";

import { motion } from "framer-motion";
import { Inbox, MessageSquareX, Timer, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { title: "Te laat reageren", body: "Klant weg.", Icon: Timer },
  { title: "Geen opvolging", body: "Klant weg.", Icon: MessageSquareX },
  { title: "Alles verspreid", body: "Chaos.", Icon: Inbox },
  { title: "Jij doet alles zelf", body: "Geen buffer.", Icon: User },
] as const;

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
};

export function LandingPainCostSection({ className }: { className?: string }) {
  return (
    <section
      id="probleem"
      className={cn("border-b border-border/30 py-20 md:py-28 dark:border-white/[0.06]", className)}
    >
      <div className="mx-auto max-w-[900px] px-4 md:px-8">
        <motion.div className="text-center" {...fade}>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
            Hier verlies je geld
          </h2>
        </motion.div>
        <motion.ul
          className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-2"
          {...fade}
          transition={{ ...fade.transition, delay: 0.04 }}
        >
          {ITEMS.map(({ title, body, Icon }) => (
            <li
              key={title}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border/40 bg-card/50 px-5 py-5 dark:border-white/[0.08]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Icon className="size-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
                <span className="text-base font-semibold text-foreground md:text-lg">{title}</span>
              </div>
              <span className="shrink-0 text-sm font-medium text-muted-foreground">{body}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
