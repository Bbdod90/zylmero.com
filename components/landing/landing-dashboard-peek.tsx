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
      <div className="relative mx-auto max-w-[1180px] px-4 md:px-8">
        <motion.div className="mx-auto max-w-2xl text-center" {...fade}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Na inloggen</p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Wat je ziet zodra je inlogt
          </h2>
          <p className="mt-5 text-base leading-[1.65] text-muted-foreground md:text-lg">
            Eén werkplek voor aanvragen die je niet wilt missen — rustig overzicht, geen leeg dashboard.
          </p>
        </motion.div>

        <motion.div {...fade} transition={{ ...fade.transition, delay: 0.06 }} className="mt-12 cf-dashboard-panel">
          <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3.5 dark:border-white/[0.08]">
            <span className="size-2.5 rounded-full bg-red-500/75" aria-hidden />
            <span className="size-2.5 rounded-full bg-amber-400/85" aria-hidden />
            <span className="size-2.5 rounded-full bg-emerald-500/70" aria-hidden />
            <span className="ml-3 text-xs font-medium text-muted-foreground">Dashboard</span>
          </div>
          <div className="grid gap-px bg-border/35 p-px dark:bg-white/[0.06] sm:grid-cols-2">
            {ROWS.map(({ title, body }) => (
              <div
                key={title}
                className="bg-background/80 p-5 dark:bg-[hsl(228_26%_7%/0.88)] md:p-6"
              >
                <p className="font-semibold text-foreground">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
          De demo hieronder laat een eerste reactie zien; in het dashboard werk je door tot concrete afspraken.
        </p>
      </div>
    </section>
  );
}
