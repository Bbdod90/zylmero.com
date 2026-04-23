"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bot, CalendarCheck, Inbox } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { fadeInView, listItem, listParent } from "@/components/home/home-motion";
import { cn } from "@/lib/utils";

const BULLETS = [
  "Reageert direct op elke aanvraag",
  "Filtert serieuze klanten",
  "Plant automatisch afspraken in",
] as const;

const FLOW = [
  { label: "Inbox", badge: "Centraal", Icon: Inbox },
  { label: "AI reactie", badge: "Direct", Icon: Bot },
  { label: "Afspraak", badge: "Automatisch", Icon: CalendarCheck },
] as const;

export function Solution() {
  const [flowHover, setFlowHover] = useState<number | null>(null);

  return (
    <section
      id="oplossing"
      className={cn(
        "scroll-mt-28 border-y",
        "border-slate-200/70 bg-slate-100/50",
        "dark:border-white/[0.06] dark:bg-black/20",
      )}
    >
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:py-32 sm:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16 lg:gap-20">
          <motion.div {...fadeInView}>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700/90 dark:text-blue-300/90">
              Oplossing
            </p>
            <h2
              className={cn(
                "mt-3 text-balance text-3xl font-semibold tracking-tight md:text-5xl",
                "text-slate-900 dark:text-white",
              )}
            >
              {BRAND_NAME} lost dit voor je op
            </h2>
            <motion.ul
              className="mt-10 space-y-5"
              variants={listParent}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {BULLETS.map((line) => (
                <motion.li
                  key={line}
                  variants={listItem}
                  className={cn(
                    "flex items-center gap-3 border-b pb-5 text-lg font-medium last:border-0 last:pb-0 md:text-xl",
                    "border-slate-200/90 text-slate-900",
                    "dark:border-white/[0.08] dark:text-white",
                  )}
                >
                  <span
                    className="flex size-2 shrink-0 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.55)] dark:shadow-[0_0_12px_rgba(96,165,250,0.8)]"
                    aria-hidden
                  />
                  {line}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div {...fadeInView} transition={{ ...fadeInView.transition, delay: 0.08 }} className="relative min-w-0">
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.12),transparent_55%)] dark:bg-[radial-gradient(circle_at_70%_30%,rgba(139,92,246,0.18),transparent_55%)]"
              aria-hidden
            />
            <div
              className={cn(
                "relative rounded-2xl border p-6 backdrop-blur-xl md:p-8",
                "border-slate-200/90 bg-white/80 shadow-lg shadow-slate-900/5",
                "dark:border-white/10 dark:bg-white/[0.05] dark:shadow-none",
              )}
            >
              <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-white/45">
                Jouw flow
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 md:flex-row md:justify-center md:gap-1">
                {FLOW.flatMap((step, i) => {
                  const active = flowHover === null || flowHover === i;
                  const node = (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, scale: 0.94 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.08 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      onMouseEnter={() => setFlowHover(i)}
                      onMouseLeave={() => setFlowHover(null)}
                      className={cn(
                        "flex w-full min-w-[140px] max-w-[200px] flex-col items-center rounded-2xl border px-5 py-4 text-center transition-all duration-300 md:w-auto md:max-w-none",
                        "border-slate-200/80 bg-white/90 shadow-sm",
                        "dark:border-white/10 dark:bg-black/30",
                        active ? "opacity-100" : "opacity-45 md:opacity-50",
                        flowHover === i &&
                          "scale-[1.02] border-blue-400/45 shadow-[0_12px_40px_-20px_rgba(59,130,246,0.25)] dark:border-blue-400/40 dark:shadow-[0_0_36px_-12px_rgba(59,130,246,0.35)]",
                      )}
                    >
                      <step.Icon
                        className={cn(
                          "size-5 transition-transform duration-300",
                          flowHover === i ? "scale-110 text-blue-600 dark:text-blue-300" : "text-blue-600/90 dark:text-blue-300",
                        )}
                        strokeWidth={1.6}
                        aria-hidden
                      />
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{step.label}</p>
                      <span
                        className={cn(
                          "mt-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider transition-colors",
                          "bg-slate-100 text-slate-500",
                          "dark:bg-white/[0.08] dark:text-white/55",
                          flowHover === i && "bg-blue-500/15 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200",
                        )}
                      >
                        {step.badge}
                      </span>
                    </motion.div>
                  );
                  if (i === FLOW.length - 1) return [node];
                  const arrow = (
                    <motion.div
                      key={`a-${step.label}`}
                      animate={{ opacity: flowHover === null || flowHover === i || flowHover === i + 1 ? 1 : 0.35 }}
                      className="flex text-slate-400 dark:text-white/40 md:px-1"
                    >
                      <ArrowRight className="size-5 rotate-90 md:rotate-0" strokeWidth={1.5} aria-hidden />
                    </motion.div>
                  );
                  return [node, arrow];
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
