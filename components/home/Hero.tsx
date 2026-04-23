"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHomeDemo } from "@/components/home/home-demo-context";
import { fadeIn } from "@/components/home/home-motion";
import { ProductMockup } from "@/components/home/ProductMockup";
import { cn } from "@/lib/utils";

export function Hero() {
  const { openDemo } = useHomeDemo();

  return (
    <section
      id="hero"
      className={cn(
        "relative scroll-mt-28 border-b",
        "border-slate-200/70 bg-white/25 dark:border-white/[0.06] dark:bg-transparent",
      )}
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-20 pt-8 sm:px-8 sm:pt-10 md:grid-cols-2 md:gap-14 md:pb-28 md:pt-12 lg:gap-16 lg:pb-32 lg:pt-14">
        <motion.div {...fadeIn}>
          <h1
            className={cn(
              "text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl",
              "text-slate-900 dark:text-white",
            )}
          >
            Je mist klanten — zonder dat je het doorhebt
          </h1>
          <p
            className={cn(
              "mt-6 max-w-xl text-pretty text-base leading-relaxed sm:text-lg md:mt-8 md:text-xl",
              "text-slate-600 dark:text-white/70",
            )}
          >
            Zylmero reageert automatisch op elke aanvraag en zet ze om in afspraken. Jij hoeft niets meer te doen.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              asChild
              size="lg"
              className={cn(
                "h-12 rounded-full px-8 text-base font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1 sm:h-14 sm:px-10",
                "bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800",
                "dark:bg-white dark:text-[#05070D] dark:shadow-black/30 dark:hover:bg-white/95",
              )}
            >
              <Link href="/signup">Start gratis</Link>
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={openDemo}
              className={cn(
                "h-12 rounded-full border px-7 text-base font-semibold transition-all duration-300 hover:-translate-y-1 sm:h-14",
                "border-slate-300/90 bg-white/80 text-slate-900 hover:bg-white",
                "dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]",
              )}
            >
              Bekijk demo
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className={cn(
                "h-12 rounded-full px-4 text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 sm:h-14",
                "text-slate-700 hover:bg-slate-900/[0.06] dark:text-white/85 dark:hover:bg-white/[0.08]",
              )}
            >
              <a href="#oplossing" className="inline-flex items-center gap-2">
                Hoe het werkt
                <ArrowRight className="size-5 opacity-70" aria-hidden />
              </a>
            </Button>
          </div>
        </motion.div>

        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }} className="relative min-w-0">
          <ProductMockup floating />
        </motion.div>
      </div>
    </section>
  );
}
