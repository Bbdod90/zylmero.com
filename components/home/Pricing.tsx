"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { fadeInView, listItem, listParent } from "@/components/home/home-motion";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="prijzen" className="scroll-mt-28 border-t border-white/[0.06] bg-black/25">
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:py-32 sm:px-8">
        <motion.div {...fadeInView} className="text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-300/90">Prijzen</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Start klein. Schaal mee.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/60">Eén duidelijk pakket per fase — geen verborgen kosten.</p>
        </motion.div>

        <motion.div
          className="mt-16 grid gap-6 md:grid-cols-3 md:gap-5"
          variants={listParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {BILLING_PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              variants={listItem}
              className={cn(
                "flex flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur-xl transition-all duration-300",
                "hover:-translate-y-1",
                plan.popular &&
                  "scale-[1.02] border-blue-400/40 bg-white/[0.07] shadow-[0_0_0_1px_rgba(59,130,246,0.25),0_32px_80px_-32px_rgba(59,130,246,0.35)] md:scale-[1.04] md:-translate-y-0.5",
              )}
            >
              {plan.popular ? (
                <span className="mb-4 inline-flex w-fit rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-200 ring-1 ring-blue-400/30">
                  Meest gekozen
                </span>
              ) : (
                <span className="mb-4 block h-6" aria-hidden />
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-white md:text-5xl">€{plan.priceEur}</span>
                <span className="text-sm text-white/50">/mnd</span>
              </p>
              <p className="mt-1 font-mono text-xs text-white/45">{plan.leadCapLabel}</p>
              <ul className="mt-8 flex-1 space-y-3 text-sm text-white/85">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-blue-400" strokeWidth={2} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={cn(
                  "mt-10 h-12 w-full rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5",
                  plan.popular
                    ? "bg-white text-[#05070D] shadow-lg hover:bg-white/95"
                    : "border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.1]",
                )}
                variant={plan.popular ? "default" : "outline"}
              >
                <Link href="/signup">Start gratis</Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
