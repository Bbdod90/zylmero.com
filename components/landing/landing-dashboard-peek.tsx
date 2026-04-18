"use client";

import { motion } from "framer-motion";
import { Flame, Kanban, LineChart, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

const BLOCKS = [
  {
    title: "Wat eerst moet",
    body: "Urgent en warm bovenaan — geen gok meer welke chat je nu opent.",
    Icon: Flame,
    step: "01",
  },
  {
    title: "Alle aanvragen op één plek",
    body: "Inkomend werk uit mail, site en berichten — geen losse lijstjes meer.",
    Icon: Kanban,
    step: "02",
  },
  {
    title: "Status en opvolging",
    body: "Gezien, beantwoord, afspraak gepland — je team ziet hetzelfde overzicht.",
    Icon: ListTodo,
    step: "03",
  },
  {
    title: "Waar je omzet vandaan komt",
    body: "Welke aanvragen interessant zijn en wat er nog openstaat — minder gissen.",
    Icon: LineChart,
    step: "04",
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
      className={cn(
        "relative overflow-hidden border-b border-border/40 py-16 md:py-20 lg:py-24 dark:border-white/[0.06]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-muted/20 to-background dark:from-primary/[0.06] dark:via-transparent dark:to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1100px] px-4 md:px-8">
        <motion.div className="mx-auto max-w-2xl text-center" {...fade}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Na inloggen
          </p>
          <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Wat je ziet zodra je inlogt
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Geen leeg scherm — een werkplek voor ondernemers die aanvragen krijgen en die niet willen missen. Dit is waar je dagelijks grip op houdt.
          </p>
        </motion.div>

        <motion.div
          {...fade}
          transition={{ ...fade.transition, delay: 0.08 }}
          className="relative mx-auto mt-12 max-w-[960px] lg:mt-14"
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-[1.25rem] border border-border/55 bg-card/60 shadow-[0_28px_70px_-44px_hsl(var(--primary)/0.35)] backdrop-blur-[2px]",
              "dark:border-white/[0.1] dark:bg-[linear-gradient(165deg,hsl(228_26%_10%/0.72),hsl(228_28%_6%/0.88))]",
            )}
          >
            <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3 dark:border-white/[0.07]">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-red-500/75" aria-hidden />
                <span className="size-2.5 rounded-full bg-amber-400/85" aria-hidden />
                <span className="size-2.5 rounded-full bg-emerald-500/70" aria-hidden />
              </div>
              <div className="h-2 flex-1 rounded-full bg-muted/50 dark:bg-white/[0.06]" aria-hidden />
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:gap-5">
              {BLOCKS.map(({ title, body, Icon, step }) => (
                <div
                  key={title}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border/45 bg-background/70 p-5 transition duration-300",
                    "hover:border-primary/25 hover:shadow-[0_16px_40px_-28px_hsl(var(--primary)/0.25)]",
                    "dark:border-white/[0.07] dark:bg-[hsl(228_26%_8%/0.55)]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground">
                      {step}
                    </span>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/22 to-primary/8 text-primary ring-1 ring-primary/18 transition group-hover:scale-[1.03]">
                      <Icon className="size-5" strokeWidth={1.65} aria-hidden />
                    </div>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  <div
                    className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/[0.07] blur-2xl transition group-hover:bg-primary/[0.12]"
                    aria-hidden
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
          De live demo hieronder laat zien hoe een eerste reactie eruit kan zien — in het dashboard werk je dat verder uit tot geboekte afspraken en opvolging.
        </p>
      </div>
    </section>
  );
}
