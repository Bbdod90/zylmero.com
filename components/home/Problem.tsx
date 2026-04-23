"use client";

import { motion } from "framer-motion";
import { Inbox, Moon, Timer } from "lucide-react";
import { fadeInView, listItem, listParent } from "@/components/home/home-motion";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    title: "Je reageert te laat → klant weg",
    body: "Elke minuut telt. Wie eerst reageert, wint de deal.",
    Icon: Timer,
  },
  {
    title: "Je mist berichten buiten werktijd",
    body: "Aanvragen komen binnen wanneer jij er niet bent.",
    Icon: Moon,
  },
  {
    title: "Je verliest overzicht in WhatsApp / mail",
    body: "Threads verspreid over apps — niemand houdt het bij.",
    Icon: Inbox,
  },
] as const;

export function Problem() {
  return (
    <section id="probleem" className="scroll-mt-28">
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:py-32 sm:px-8">
        <motion.div {...fadeInView}>
          <h2
            className={cn(
              "max-w-[20ch] text-balance text-3xl font-semibold tracking-tight md:text-5xl",
              "text-slate-900 dark:text-white",
            )}
          >
            Dit kost je elke dag klanten
          </h2>
        </motion.div>
        <motion.ul
          className="mt-12 grid gap-5 md:mt-14 md:grid-cols-3 md:gap-6"
          variants={listParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {CARDS.map(({ title, body, Icon }) => (
            <motion.li
              key={title}
              variants={listItem}
              className={cn(
                "group rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300",
                "border-slate-200/90 bg-white/70 shadow-sm shadow-slate-900/5",
                "hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-[0_20px_50px_-28px_rgba(59,130,246,0.2)]",
                "dark:border-white/10 dark:bg-white/[0.05] dark:shadow-none",
                "dark:hover:border-blue-400/35 dark:hover:shadow-[0_0_48px_-12px_rgba(59,130,246,0.35)]",
              )}
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl ring-1 transition-all duration-300 group-hover:scale-105",
                  "bg-blue-500/10 text-blue-700 ring-blue-500/15",
                  "dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/20 dark:group-hover:bg-blue-500/25",
                )}
              >
                <Icon className="size-5" strokeWidth={1.65} aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-slate-800 dark:text-white/60 dark:group-hover:text-white/75">
                {body}
              </p>
              <div className="mt-4 h-px w-8 rounded-full bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-blue-400/60" />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
