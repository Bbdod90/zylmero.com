"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export function LandingFinalCtaSection() {
  return (
    <motion.section
      className="relative border-t border-border/45 py-36 md:py-44 dark:border-white/[0.09]"
      {...fade}
      id="start"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,hsl(var(--primary)/0.08),transparent_65%)] dark:bg-[radial-gradient(ellipse_65%_55%_at_50%_100%,hsl(var(--primary)/0.14),transparent_68%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[680px] px-4 text-center sm:px-6">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Nu starten</p>
        <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.035em] text-foreground md:text-5xl md:leading-[1.06]">
          Stop met klanten missen
        </h2>
        <Button
          asChild
          size="lg"
          className="mt-12 h-[3.25rem] rounded-full px-12 text-[15px] font-semibold shadow-md md:h-14 md:px-14 md:text-base"
        >
          <Link href="/signup">Start gratis</Link>
        </Button>
        <p className="mt-7 font-mono text-sm font-medium text-muted-foreground md:text-[15px]">Binnen 5 minuten actief</p>
      </div>
    </motion.section>
  );
}
