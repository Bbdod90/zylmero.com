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
    <motion.section className="py-24 md:py-32" {...fade} id="start">
      <div className="mx-auto max-w-[640px] px-4 text-center md:px-8">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
          Stop met klanten missen
        </h2>
        <Button asChild size="lg" className="mt-10 h-14 rounded-xl px-10 text-base font-semibold md:h-16 md:text-lg">
          <Link href="/signup">Start gratis</Link>
        </Button>
      </div>
    </motion.section>
  );
}
