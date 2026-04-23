"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { fadeInView, listItem, listParent } from "@/components/home/home-motion";
import { cn } from "@/lib/utils";

export function Pricing() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section
      id="prijzen"
      className={cn(
        "scroll-mt-28 border-t",
        "border-slate-200/70 bg-slate-50/80",
        "dark:border-white/[0.06] dark:bg-black/25",
      )}
    >
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:py-32 sm:px-8">
        <motion.div {...fadeInView} className="text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700/90 dark:text-blue-300/90">
            Prijzen
          </p>
          <h2
            className={cn(
              "mx-auto mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-5xl",
              "text-slate-900 dark:text-white",
            )}
          >
            Start klein. Schaal mee.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 dark:text-white/60 md:text-base">
            Start klein. Schaal wanneer nodig. Geen verborgen kosten.
          </p>
        </motion.div>

        <motion.div
          className="mt-14 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-5"
          variants={listParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {BILLING_PLANS.map((plan) => {
            const isHover = hovered === plan.id;
            const isDim = hovered !== null && hovered !== plan.id;
            return (
              <motion.div
                key={plan.id}
                variants={listItem}
                onMouseEnter={() => setHovered(plan.id)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "flex flex-col rounded-2xl border p-7 backdrop-blur-xl transition-all duration-300",
                  "border-slate-200/90 bg-white/85 shadow-md shadow-slate-900/5",
                  "dark:border-white/10 dark:bg-white/[0.05] dark:shadow-none",
                  "hover:-translate-y-1",
                  isDim && "scale-[0.98] opacity-70 md:scale-[0.99]",
                  plan.popular &&
                    "border-blue-400/35 shadow-[0_20px_60px_-28px_rgba(59,130,246,0.2)] ring-1 ring-blue-500/15 dark:border-blue-400/40 dark:shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_32px_80px_-32px_rgba(59,130,246,0.35)]",
                  isHover &&
                    "border-blue-400/50 shadow-[0_24px_70px_-30px_rgba(59,130,246,0.22)] dark:shadow-[0_0_56px_-20px_rgba(59,130,246,0.4)]",
                )}
              >
                {plan.popular ? (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-blue-600/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-800 ring-1 ring-blue-500/25 dark:bg-blue-500/20 dark:text-blue-200 dark:ring-blue-400/30">
                    Meest gekozen
                  </span>
                ) : (
                  <span className="mb-4 block h-6" aria-hidden />
                )}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/45",
                          "text-slate-400 hover:text-slate-600",
                          "dark:text-white/35 dark:hover:text-white/60",
                        )}
                        aria-label="Over prijzen"
                      >
                        <Info className="size-3.5" strokeWidth={2} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] text-xs">
                      Maandelijks opzegbaar. Geen creditcard om te starten.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-5xl">
                    €{plan.priceEur}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-white/50">/mnd</span>
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500 dark:text-white/45">{plan.leadCapLabel}</p>
                <ul className="mt-8 flex-1 space-y-2.5 text-sm leading-snug text-slate-700 dark:text-white/85">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" strokeWidth={2} aria-hidden />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={cn(
                    "mt-10 h-12 w-full rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5",
                    plan.popular
                      ? "bg-slate-900 text-white shadow-lg hover:bg-slate-800 dark:bg-white dark:text-[#05070D] dark:hover:bg-white/95"
                      : cn(
                          "border shadow-sm",
                          "border-slate-300/90 bg-white text-slate-900 hover:bg-slate-50",
                          "dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]",
                        ),
                  )}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/signup">Start gratis</Link>
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
