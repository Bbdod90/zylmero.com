"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/brand";

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

export function LandingFinalCtaSection() {
  return (
    <motion.section className="relative py-20 md:py-28" {...fade} id="start">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[min(440px,72vh)] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12),transparent_68%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.16),transparent_70%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[720px] px-4 text-center md:px-8">
        <p className="cf-landing-eyebrow">Volgende stap</p>
        <h2 className="cf-landing-h2 mt-4">Klaar om minder aanvragen te laten liggen?</h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
          {BRAND_NAME} is er voor zzp en kleine bedrijven die sneller willen reageren zonder extra personeel. Start gratis,
          bekijk je dashboard — pas daarna beslis je of je wilt uitbreiden.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-12 rounded-xl px-8 text-base font-semibold sm:h-14">
            <Link href="/signup">Gratis starten</Link>
          </Button>
          <AnonymousDemoForm className="w-full sm:w-auto">
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-xl border-2 border-primary/25 px-8 text-base font-semibold sm:h-14 sm:w-auto dark:border-primary/30"
            >
              Bekijk hoe het werkt
              <ArrowRight className="ml-2 size-4 opacity-80" aria-hidden />
            </Button>
          </AnonymousDemoForm>
        </div>
        <p className="mx-auto mt-8 max-w-md text-xs leading-relaxed text-muted-foreground">
          Geen creditcard verplicht om te beginnen · op elk moment opzegbaar · support in begrijpelijke taal
        </p>
      </div>
    </motion.section>
  );
}
