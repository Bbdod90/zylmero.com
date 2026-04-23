"use client";

import Link from "next/link";
import { CTA } from "@/components/home/CTA";
import { FAQ } from "@/components/home/FAQ";
import { Hero } from "@/components/home/Hero";
import { HomeNav } from "@/components/home/HomeNav";
import { HomeStickyCta } from "@/components/home/HomeStickyCta";
import { Pricing } from "@/components/home/Pricing";
import { Problem } from "@/components/home/Problem";
import { Results } from "@/components/home/Results";
import { Solution } from "@/components/home/Solution";
import { BRAND_CONTACT_EMAIL, BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function HomePage() {
  return (
    <div className="dark relative min-h-dvh overflow-x-hidden bg-[#05070D] pb-28 text-foreground selection:bg-blue-500/35 md:pb-24">
      {/* Elite background */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220] to-[#05070D]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(59,130,246,0.28),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_60%,rgba(139,92,246,0.12),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{ backgroundImage: NOISE_SVG }}
        />
      </div>

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

        <footer className="border-t border-white/[0.08] bg-black/30 py-12 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white ring-1 ring-white/20">
                {BRAND_LOGO_MONOGRAM}
              </div>
              <span className="text-sm font-semibold text-white">{BRAND_NAME}</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm font-medium text-white/55">
              <Link href="/login" className="transition-colors hover:text-white">
                Inloggen
              </Link>
              <a href={`mailto:${BRAND_CONTACT_EMAIL}`} className="transition-colors hover:text-white">
                Contact
              </a>
            </nav>
          </div>
        </footer>

        <HomeStickyCta />
      </div>
    </div>
  );
}
