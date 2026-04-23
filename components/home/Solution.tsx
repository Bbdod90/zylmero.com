"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, CalendarCheck, Inbox } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { fadeInView, listItem, listParent } from "@/components/home/home-motion";

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
  return (
    <section id="oplossing" className="scroll-mt-28 border-y border-white/[0.06] bg-black/20">
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:py-32 sm:px-8">
        <div className="grid items-center gap-14 md:grid-cols-2 md:gap-16">
          <motion.div {...fadeInView}>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-300/90">Oplossing</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl">
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
                  className="flex items-center gap-3 border-b border-white/[0.08] pb-5 text-lg font-medium text-white last:border-0 last:pb-0 md:text-xl"
                >
                  <span className="flex size-2 shrink-0 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]" aria-hidden />
                  {line}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            {...fadeInView}
            transition={{ ...fadeInView.transition, delay: 0.08 }}
            className="relative"
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_70%_30%,rgba(139,92,246,0.18),transparent_55%)]"
              aria-hidden
            />
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl md:p-8">
              <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
                Jouw flow
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-2">
                {FLOW.flatMap((step, i) => {
                  const node = (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, scale: 0.94 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.08 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="flex w-full min-w-[140px] max-w-[200px] flex-col items-center rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-center md:w-auto md:max-w-none"
                    >
                      <step.Icon className="size-5 text-blue-300" strokeWidth={1.6} aria-hidden />
                      <p className="mt-2 text-sm font-semibold text-white">{step.label}</p>
                      <span className="mt-1.5 rounded-full bg-white/[0.08] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-white/55">
                        {step.badge}
                      </span>
                    </motion.div>
                  );
                  if (i === FLOW.length - 1) return [node];
                  const arrow = (
                    <div key={`a-${step.label}`} className="flex text-white/40 md:px-1">
                      <ArrowRight className="size-5 rotate-90 md:rotate-0" strokeWidth={1.5} aria-hidden />
                    </div>
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
