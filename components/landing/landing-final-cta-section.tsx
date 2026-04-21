"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
};

export function LandingFinalCtaSection() {
  return (
    <motion.section className="border-t border-border/40 py-28 md:py-36 dark:border-white/[0.06]" {...fade} id="start">
      <div className="mx-auto max-w-[640px] px-4 text-center md:px-8">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
          Stop met klanten missen
        </h2>
        <Button asChild size="lg" className="mt-10 h-14 rounded-xl px-10 text-base font-semibold md:h-16 md:text-lg">
          <Link href="/signup">Start gratis</Link>
        </Button>
        <p className="mt-6 text-base font-medium text-muted-foreground md:text-lg">Binnen 5 minuten actief</p>
      </div>
    </motion.section>
  );
}
