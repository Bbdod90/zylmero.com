"use client";

import { motion } from "framer-motion";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductMockupProps = {
  /** Langzame float-animatie (hero) */
  floating?: boolean;
  className?: string;
};

export function ProductMockup({ floating = false, className }: ProductMockupProps) {
  const shell = cn(
    "overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ring-1 transition-shadow duration-500",
    "border-slate-200/90 bg-white/90 text-slate-900 shadow-slate-900/10 ring-slate-900/[0.04]",
    "dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:shadow-black/60 dark:ring-white/[0.06]",
  );

  const chrome = cn(
    "flex items-center justify-between border-b px-4 py-3",
    "border-slate-200/80 bg-slate-50/90",
    "dark:border-white/[0.08] dark:bg-black/20",
  );

  const monoMuted = "font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-white/45";

  const rowBorder = "divide-y divide-slate-100 dark:divide-white/[0.06]";

  const inner = (
    <div className={shell}>
      <div className={chrome}>
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-red-400/90" aria-hidden />
          <span className="size-2.5 rounded-full bg-amber-400/90" aria-hidden />
          <span className="size-2.5 rounded-full bg-emerald-400/90" aria-hidden />
          <span className={cn("ml-2", monoMuted)}>Inbox</span>
        </div>
        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Live
        </span>
      </div>

      <div className={cn("px-1", rowBorder)}>
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">Nieuwe aanvraag</p>
            <p className={cn("mt-0.5 uppercase tracking-wider", monoMuted)}>Website · zojuist</p>
          </div>
          <span className="shrink-0 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 ring-1 ring-blue-500/25 dark:bg-blue-500/20 dark:text-blue-300 dark:ring-blue-400/30">
            Nieuw
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">Offerte aanvraag</p>
            <p className={cn("mt-0.5 uppercase tracking-wider", monoMuted)}>WhatsApp · 11:42</p>
          </div>
          <span className="shrink-0 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-amber-500/25 dark:text-amber-200/90 dark:ring-amber-400/25">
            Warm
          </span>
        </div>
      </div>

      <div
        className={cn(
          "border-t px-4 py-4",
          "border-slate-100 bg-slate-50/50",
          "dark:border-white/[0.06] dark:bg-black/15",
        )}
      >
        <p className="mb-3 text-center font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-white/35">
          Vandaag 14:02
        </p>
        <div className="flex justify-end">
          <div className="max-w-[88%] rounded-2xl rounded-br-md bg-gradient-to-br from-blue-600 to-indigo-600 px-3.5 py-2.5 text-[13px] leading-snug text-white shadow-lg dark:from-blue-500 dark:to-indigo-600">
            Kan ik morgen om 14:00 langskomen?
          </div>
        </div>
        <div className="mt-2 flex justify-start">
          <div
            className={cn(
              "max-w-[90%] rounded-2xl rounded-bl-md border px-3.5 py-2.5 text-[13px] leading-relaxed",
              "border-slate-200/90 bg-white text-slate-800 shadow-sm",
              "dark:border-white/10 dark:bg-white/[0.08] dark:text-white/90",
            )}
          >
            Ja — ik check de agenda en bevestig meteen zodra het past.
          </div>
        </div>
      </div>

      <div className={cn("border-t p-4", "border-slate-100 dark:border-white/[0.06]")}>
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border p-3.5",
            "border-emerald-200/80 bg-emerald-50/80",
            "dark:border-emerald-500/25 dark:bg-emerald-500/[0.08]",
          )}
        >
          <CalendarCheck className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} aria-hidden />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Afspraak bevestigd</p>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-white/60">Woensdag 14:00 · bevestiging verstuurd</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!floating) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.18),transparent_65%)] blur-2xl dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.22),transparent_65%)]"
        aria-hidden
      />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {inner}
      </motion.div>
    </div>
  );
}
