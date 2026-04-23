"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeInView } from "@/components/home/home-motion";
import { cn } from "@/lib/utils";

export function CTA() {
  return (
    <section
      id="start"
      className={cn(
        "scroll-mt-28 border-t",
        "border-slate-200/70",
        "dark:border-white/[0.08]",
      )}
    >
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:py-32 sm:px-8">
        <motion.div
          {...fadeInView}
          className={cn(
            "relative mx-auto max-w-2xl overflow-hidden rounded-3xl border px-6 py-14 text-center backdrop-blur-xl md:px-12 md:py-20",
            "border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.15)] ring-1 ring-slate-900/[0.04]",
            "dark:border-white/10 dark:from-white/[0.1] dark:to-white/[0.02] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_40px_100px_-48px_rgba(0,0,0,0.75)] dark:ring-white/[0.08]",
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.14),transparent_60%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.28),transparent_60%)]"
            aria-hidden
          />
          <h2
            className={cn(
              "relative text-balance text-3xl font-semibold tracking-tight md:text-5xl",
              "text-slate-900 dark:text-white",
            )}
          >
            Stop met klanten missen
          </h2>
          <p className="relative mx-auto mt-5 max-w-md text-lg text-slate-600 dark:text-white/70 md:text-xl">
            Binnen 5 minuten actief
          </p>
          <div className="relative mt-10">
            <Button
              asChild
              size="lg"
              className={cn(
                "h-14 rounded-full px-12 text-base font-semibold shadow-xl transition-all duration-300 hover:-translate-y-1",
                "bg-slate-900 text-white hover:bg-slate-800",
                "dark:bg-white dark:text-[#05070D] dark:hover:bg-white/95",
              )}
            >
              <Link href="/signup">Start gratis</Link>
            </Button>
          </div>
          <p className="relative mt-6 font-mono text-xs text-slate-500 dark:text-white/50">Geen creditcard nodig</p>
        </motion.div>
      </div>
    </section>
  );
}
