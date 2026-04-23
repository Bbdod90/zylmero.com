"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { fadeInView } from "@/components/home/home-motion";

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
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-300/90">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">Veelgestelde vragen</h2>
        </motion.div>

        <motion.div {...fadeInView} className="mt-12 space-y-2">
          {ITEMS.map((item) => {
            const isOpen = open === item.q;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl transition-colors hover:border-white/[0.14]"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.q)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left md:px-6 md:py-5"
                >
                  <span className="text-[15px] font-semibold text-white md:text-base">{item.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown className="size-5 shrink-0 text-white/45" aria-hidden />
                  </motion.span>
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
                      <p className="border-t border-white/[0.08] px-5 pb-5 pt-3 text-sm leading-relaxed text-white/65 md:px-6 md:pb-6 md:text-[15px]">
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
