"use client";

import { motion } from "framer-motion";
import { fadeInView } from "@/components/home/home-motion";

const STATS = ["Sneller reageren", "Meer afspraken", "Minder werk"] as const;

export function Results() {
  return (
    <section id="resultaten" className="scroll-mt-28">
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:py-32 sm:px-8">
        <motion.div
          {...fadeInView}
          className="relative mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-16 text-center backdrop-blur-xl md:px-12 md:py-20"
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(59,130,246,0.2),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl shadow-[0_0_100px_-20px_rgba(99,102,241,0.45)]"
            aria-hidden
          />
          <p className="relative font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">Resultaat</p>
          <motion.p
            className="relative mt-6 bg-gradient-to-br from-white via-blue-100 to-violet-300 bg-clip-text text-7xl font-semibold tracking-[-0.06em] text-transparent drop-shadow-[0_0_40px_rgba(99,102,241,0.45)] md:text-8xl"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            +32%
          </motion.p>
          <p className="relative mt-3 text-xl font-medium text-white/80 md:text-2xl">meer conversie</p>
          <div className="relative mx-auto mt-12 flex max-w-lg flex-col gap-4 sm:flex-row sm:justify-center sm:gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-sm font-semibold text-white/70 md:text-base"
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
