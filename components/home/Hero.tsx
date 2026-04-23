"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/components/home/home-motion";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section id="hero" className="relative scroll-mt-28 border-b border-white/[0.06]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-24 md:grid-cols-2 md:gap-16 md:py-32 sm:px-8">
        <motion.div {...fadeIn}>
          <h1 className="text-balance text-5xl font-semibold tracking-tight text-white md:text-6xl lg:text-7xl">
            Je mist klanten — zonder dat je het doorhebt
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">
            Zylmero reageert automatisch op elke aanvraag en zet ze om in afspraken. Jij hoeft niets meer te doen.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-full bg-white px-10 text-base font-semibold text-[#05070D] shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:bg-white/95"
            >
              <Link href="/signup">Start gratis</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-14 rounded-full border border-white/15 bg-white/[0.04] px-8 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.08]"
            >
              <a href="#oplossing" className="inline-flex items-center gap-2">
                Bekijk hoe het werkt
                <ArrowRight className="size-5 opacity-80" aria-hidden />
              </a>
            </Button>
          </div>
        </motion.div>

        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.12 }} className="relative">
          <div
            className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.22),transparent_65%)] blur-2xl"
            aria-hidden
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div
              className={cn(
                "overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl",
                "ring-1 ring-white/[0.06]",
              )}
            >
              {/* Window chrome */}
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-black/20 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-red-400/90" aria-hidden />
                  <span className="size-2.5 rounded-full bg-amber-400/90" aria-hidden />
                  <span className="size-2.5 rounded-full bg-emerald-400/90" aria-hidden />
                  <span className="ml-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                    Inbox
                  </span>
                </div>
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Live
                </span>
              </div>

              {/* Inbox rows */}
              <div className="divide-y divide-white/[0.06] px-1">
                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">Nieuwe aanvraag</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/40">Website · zojuist</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-300 ring-1 ring-blue-400/30">
                    Nieuw
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">Offerte aanvraag</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/40">WhatsApp · 11:42</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90 ring-1 ring-amber-400/25">
                    Warm
                  </span>
                </div>
              </div>

              {/* Chat */}
              <div className="border-t border-white/[0.06] bg-black/15 px-4 py-4">
                <p className="mb-3 text-center font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/35">
                  Vandaag 14:02
                </p>
                <div className="flex justify-end">
                  <div className="max-w-[88%] rounded-2xl rounded-br-md bg-gradient-to-br from-blue-500 to-indigo-600 px-3.5 py-2.5 text-[13px] leading-snug text-white shadow-lg">
                    Kan ik morgen om 14:00 langskomen?
                  </div>
                </div>
                <div className="mt-2 flex justify-start">
                  <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.08] px-3.5 py-2.5 text-[13px] leading-relaxed text-white/90">
                    Ja — ik check de agenda en bevestig meteen zodra het past.
                  </div>
                </div>
              </div>

              {/* Appointment */}
              <div className="border-t border-white/[0.06] p-4">
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] p-3.5">
                  <CalendarCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" strokeWidth={1.75} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-400" strokeWidth={2} aria-hidden />
                      <p className="text-sm font-semibold text-white">Afspraak bevestigd</p>
                    </div>
                    <p className="mt-1 text-xs text-white/60">Woensdag 14:00 · bevestiging verstuurd</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
