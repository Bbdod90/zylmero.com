"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeInView } from "@/components/home/home-motion";

export function CTA() {
  return (
    <section id="start" className="scroll-mt-28 border-t border-white/[0.08]">
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:py-32 sm:px-8">
        <motion.div
          {...fadeInView}
          className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] px-6 py-16 text-center backdrop-blur-xl md:px-12 md:py-20"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.25),transparent_60%)]"
            aria-hidden
          />
          <h2 className="relative text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Stop met klanten missen
          </h2>
          <p className="relative mx-auto mt-5 max-w-md text-lg text-white/70 md:text-xl">Binnen 5 minuten actief</p>
          <div className="relative mt-10">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-full bg-white px-12 text-base font-semibold text-[#05070D] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/95"
            >
              <Link href="/signup">Start gratis</Link>
            </Button>
          </div>
          <p className="relative mt-6 font-mono text-xs text-white/50">Geen creditcard nodig</p>
        </motion.div>
      </div>
    </section>
  );
}
