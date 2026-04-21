"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
};

export function LandingFinalCtaSection() {
  return (
    <motion.section {...fade} id="start" className="relative border-t border-border/45 dark:border-white/[0.1]">
      <div className="relative overflow-hidden bg-[hsl(222_44%_9%)] py-28 text-white md:py-36 dark:bg-[hsl(222_38%_7%)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-30%,hsl(218_55%_45%/0.35),transparent_55%)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-[760px] px-4 text-center sm:px-6">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.26em] text-white/65">Nu starten</p>
          <h2 className="mt-6 text-balance text-3xl font-semibold tracking-[-0.045em] text-white md:text-5xl md:leading-[1.06]">
            Stop met klanten missen
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-white/75 md:text-lg">
            Zet aanvragen om in afspraken — met een systeem dat er 24/7 voor je staat.
          </p>
          <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-14 min-w-[220px] rounded-full bg-white px-10 text-[15px] font-semibold text-[hsl(222_44%_9%)] shadow-lg shadow-black/25 hover:bg-white/95"
            >
              <Link href="/signup">Start gratis</Link>
            </Button>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition-colors hover:text-white"
            >
              Bekijk product tour <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <p className="mt-10 font-mono text-[13px] font-medium text-white/55 md:text-sm">Binnen 5 minuten actief · geen creditcard nodig om te beginnen</p>
        </div>
      </div>
    </motion.section>
  );
}
