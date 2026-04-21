"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { Button } from "@/components/ui/button";

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

export function LandingFinalCtaSection() {
  return (
    <motion.section className="relative py-16 md:py-24" {...fade}>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[min(420px,70vh)] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.14),transparent_68%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.18),transparent_70%)]" aria-hidden />
      <div className="relative mx-auto max-w-[720px] px-4 text-center md:px-8">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Stop met klanten missen
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
          Start gratis en zie in je dashboard wat er binnenkomt — gemaakt voor zzp en kleine teams, geen creditcard nodig
          om te beginnen.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-12 rounded-xl px-8 text-base font-semibold sm:h-14">
            <Link href="/signup">Start gratis</Link>
          </Button>
          <AnonymousDemoForm className="w-full sm:w-auto">
            <Button type="submit" variant="demo" size="lg" className="h-12 w-full rounded-xl px-8 text-base font-semibold sm:h-14 sm:w-auto">
              Bekijk demo
              <ArrowRight className="ml-2 size-4 opacity-90" />
            </Button>
          </AnonymousDemoForm>
        </div>
      </div>
    </motion.section>
  );
}
