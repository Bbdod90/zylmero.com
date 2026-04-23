"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { fadeInView } from "@/components/home/home-motion";
import { useDelayedHover } from "@/components/home/use-delayed-hover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const STATS = ["Sneller reageren", "Meer afspraken", "Minder werk"] as const;

export function Results() {
  const { active, onPointerEnter, onPointerLeave } = useDelayedHover(620);

  return (
    <section id="resultaten" className="scroll-mt-28">
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:py-32 sm:px-8">
        <motion.div
          {...fadeInView}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          className={cn(
            "relative mx-auto max-w-3xl rounded-3xl border px-6 py-14 text-center backdrop-blur-xl transition-[box-shadow,transform] duration-500 md:px-12 md:py-20",
            "border-slate-200/90 bg-white/75 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.12)]",
            "dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none",
            active &&
              "shadow-[0_28px_90px_-36px_rgba(59,130,246,0.18)] ring-1 ring-blue-500/15 dark:shadow-[0_0_80px_-24px_rgba(99,102,241,0.35)] dark:ring-blue-400/20",
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(59,130,246,0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(59,130,246,0.2),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl shadow-[0_0_80px_-28px_rgba(99,102,241,0.2)] dark:shadow-[0_0_100px_-20px_rgba(99,102,241,0.45)]"
            aria-hidden
          />
          <p className="relative font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-white/50">
            Resultaat
          </p>
          <div className="relative mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
            <motion.p
              className={cn(
                "bg-gradient-to-br bg-clip-text text-6xl font-semibold tracking-[-0.06em] text-transparent sm:text-7xl md:text-8xl",
                "from-slate-900 via-blue-700 to-indigo-600",
                "dark:from-white dark:via-blue-100 dark:to-violet-300 dark:drop-shadow-[0_0_40px_rgba(99,102,241,0.45)]",
              )}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              +32%
            </motion.p>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "rounded-full p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
                    "text-slate-400 hover:bg-slate-200/80 hover:text-slate-600",
                    "dark:text-white/40 dark:hover:bg-white/[0.08] dark:hover:text-white/70",
                  )}
                  aria-label="Meer info over dit cijfer"
                >
                  <Info className="size-4 shrink-0" strokeWidth={2} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[220px] text-left text-xs leading-snug">
                Indicatief resultaat. Verschilt per branche en aanbod.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="relative mt-2 text-lg font-medium text-slate-700 dark:text-white/80 md:text-2xl">meer conversie</p>
          <div className="relative mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:mt-12 sm:flex-row sm:justify-center sm:gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-sm font-semibold text-slate-600 dark:text-white/70 md:text-base"
              >
                {s}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
