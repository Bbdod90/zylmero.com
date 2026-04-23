"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { fadeInView } from "@/components/home/home-motion";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    q: "Wat doet Zylmero precies?",
    a: "Het vangt aanvragen op, antwoordt meteen en zet serieuze leads om in afspraken — zonder dat jij 24/7 bereikbaar hoeft te zijn.",
  },
  {
    q: "Moet ik technisch zijn?",
    a: "Nee. Je koppelt je kanalen en gaat live. De rest regelt het systeem.",
  },
  {
    q: "Welke kanalen?",
    a: "Onder andere e-mail, website en WhatsApp — alles in één stroom.",
  },
  {
    q: "Kan ik opzeggen?",
    a: "Ja. Maandelijks opzegbaar — geen lange lock-in.",
  },
] as const;

export function FAQ() {
  const [open, setOpen] = useState<string | null>(ITEMS[0]!.q);

  return (
    <section id="faq" className="scroll-mt-28">
      <div className="mx-auto max-w-[720px] px-5 py-24 md:py-32 sm:px-8">
        <motion.div {...fadeInView} className="text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700/90 dark:text-blue-300/90">
            FAQ
          </p>
          <h2
            className={cn(
              "mt-3 text-3xl font-semibold tracking-tight md:text-5xl",
              "text-slate-900 dark:text-white",
            )}
          >
            Veelgestelde vragen
          </h2>
        </motion.div>

        <motion.div {...fadeInView} className="mt-10 space-y-2 md:mt-12">
          {ITEMS.map((item) => {
            const isOpen = open === item.q;
            return (
              <div
                key={item.q}
                className={cn(
                  "overflow-hidden rounded-2xl border backdrop-blur-xl transition-colors duration-200",
                  "border-slate-200/90 bg-white/80 hover:border-slate-300",
                  "dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-white/[0.16]",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.q)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors md:px-6 md:py-5",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40",
                    "hover:bg-slate-50/90 dark:hover:bg-white/[0.04]",
                  )}
                >
                  <span className="text-[15px] font-semibold leading-snug text-slate-900 md:text-base dark:text-white">
                    {item.q}
                  </span>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 border-slate-200/90 bg-white text-slate-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/50">
                    <motion.span
                      key={isOpen ? "m" : "p"}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isOpen ? <Minus className="size-4" strokeWidth={2} aria-hidden /> : <Plus className="size-4" strokeWidth={2} aria-hidden />}
                    </motion.span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p
                        className={cn(
                          "border-t px-5 pb-5 pt-3 text-sm leading-relaxed md:px-6 md:pb-6 md:text-[15px]",
                          "border-slate-100 text-slate-600",
                          "dark:border-white/[0.08] dark:text-white/65",
                        )}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
