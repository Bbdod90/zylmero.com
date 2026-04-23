"use client";

import Link from "next/link";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CTA } from "@/components/home/CTA";
import { FAQ } from "@/components/home/FAQ";
import { Hero } from "@/components/home/Hero";
import { HomeDemoProvider } from "@/components/home/home-demo-context";
import { HomeNav } from "@/components/home/HomeNav";
import { HomeProductDemo } from "@/components/home/HomeProductDemo";
import { HomeStickyCta } from "@/components/home/HomeStickyCta";
import { Pricing } from "@/components/home/Pricing";
import { Problem } from "@/components/home/Problem";
import { Results } from "@/components/home/Results";
import { Solution } from "@/components/home/Solution";
import { BRAND_CONTACT_EMAIL, BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function HomePage() {
  return (
    <HomeDemoProvider>
      <TooltipProvider delayDuration={280} skipDelayDuration={0}>
        <div
          className={cn(
            "relative min-h-dvh overflow-x-hidden pb-28 selection:bg-blue-500/25 md:pb-24",
            "bg-gradient-to-b from-[#f4f7fb] via-[#eef2f9] to-[#e6ecf6] text-slate-900",
            "dark:from-[#0B1220] dark:via-[#080c14] dark:to-[#05070D] dark:text-white",
          )}
        >
          <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
            <div
              className={cn(
                "absolute inset-0",
                "bg-[radial-gradient(ellipse_95%_75%_at_50%_-8%,rgba(59,130,246,0.14),transparent_58%)]",
                "dark:bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(59,130,246,0.28),transparent_55%)]",
              )}
            />
            <div
              className={cn(
                "absolute inset-0",
                "bg-[radial-gradient(ellipse_55%_45%_at_85%_55%,rgba(99,102,241,0.08),transparent_50%)]",
                "dark:bg-[radial-gradient(ellipse_60%_50%_at_80%_60%,rgba(139,92,246,0.12),transparent_50%)]",
              )}
            />
            <div
              className={cn(
                "absolute inset-0 mix-blend-multiply dark:mix-blend-overlay",
                "opacity-[0.028]",
                "dark:opacity-[0.04]",
              )}
              style={{ backgroundImage: NOISE_SVG }}
            />
          </div>

          <HomeProductDemo />

          <div className="relative z-10">
            <HomeNav />
            <main>
              <Hero />
              <Problem />
              <Solution />
              <Results />
              <Pricing />
              <FAQ />
              <CTA />
            </main>

            <footer
              className={cn(
                "border-t py-12 backdrop-blur-md",
                "border-slate-200/80 bg-white/55",
                "dark:border-white/[0.08] dark:bg-black/35",
              )}
            >
              <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-[11px] font-bold text-white shadow-md ring-1 ring-slate-900/10 dark:from-blue-500 dark:to-indigo-600 dark:ring-white/15">
                    {BRAND_LOGO_MONOGRAM}
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{BRAND_NAME}</span>
                </div>
                <nav className="flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm font-medium text-slate-600 dark:text-white/55">
                  <Link href="/login" className="transition-colors hover:text-slate-900 dark:hover:text-white">
                    Inloggen
                  </Link>
                  <a
                    href={`mailto:${BRAND_CONTACT_EMAIL}`}
                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                  >
                    Contact
                  </a>
                </nav>
              </div>
            </footer>

            <HomeStickyCta />
          </div>
        </div>
      </TooltipProvider>
    </HomeDemoProvider>
  );
}
