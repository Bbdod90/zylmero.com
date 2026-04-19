"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ROWS = [
  {
    title: "Wat eerst moet",
    body: "Urgent en warm bovenaan — geen gok meer welke chat je nu opent.",
  },
  {
    title: "Alle aanvragen op één plek",
    body: "Mail, site en berichten — geen losse lijstjes meer.",
  },
  {
    title: "Status en opvolging",
    body: "Gezien, beantwoord, afspraak gepland — je team ziet hetzelfde overzicht.",
  },
  {
    title: "Waar je omzet vandaan komt",
    body: "Welke aanvragen tellen mee — minder gissen.",
  },
] as const;

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

export function LandingDashboardPeek({ className }: { className?: string }) {
  return (
    <section
      id="wat-je-ziet"
      className={cn("border-b border-border/30 py-16 md:py-20 lg:py-24 dark:border-white/[0.06]", className)}
    >
      <div className="relative mx-auto max-w-[640px] px-4 md:px-8">
        <motion.div className="text-center" {...fade}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Na inloggen</p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Wat je ziet zodra je inlogt
          </h2>
          <p className="mt-5 text-base leading-[1.65] text-muted-foreground md:text-lg">
            Eén werkplek voor aanvragen die je niet wilt missen — rustig overzicht, geen leeg dashboard.
          </p>
        </motion.div>

        <motion.div
          {...fade}
          transition={{ ...fade.transition, delay: 0.06 }}
          className="mt-12 overflow-hidden rounded-xl border border-border/40 bg-card/30 dark:border-white/[0.08] dark:bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 border-b border-border/35 px-4 py-3 dark:border-white/[0.07]">
            <span className="size-2 rounded-full bg-red-500/70" aria-hidden />
            <span className="size-2 rounded-full bg-amber-400/80" aria-hidden />
            <span className="size-2 rounded-full bg-emerald-500/65" aria-hidden />
          </div>
          <ul className="divide-y divide-border/35 dark:divide-white/[0.06]">
            {ROWS.map(({ title, body }) => (
              <li key={title} className="px-5 py-5 md:px-6">
                <p className="font-medium text-foreground">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="mx-auto mt-10 max-w-lg text-center text-sm leading-relaxed text-muted-foreground">
          De demo hieronder laat een eerste reactie zien; in het dashboard werk je door tot concrete afspraken.
        </p>
      </div>
    </section>
  );
}
