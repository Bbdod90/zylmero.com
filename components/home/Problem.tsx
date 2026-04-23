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
          <h2 className="max-w-[20ch] text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Dit kost je elke dag klanten
          </h2>
        </motion.div>
        <motion.ul
          className="mt-14 grid gap-5 md:grid-cols-3 md:gap-6"
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
                "group rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl transition-all duration-300",
                "hover:-translate-y-1 hover:border-blue-400/35 hover:shadow-[0_0_48px_-12px_rgba(59,130,246,0.35)]",
              )}
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20 transition-colors group-hover:bg-blue-500/25">
                <Icon className="size-5" strokeWidth={1.65} aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{body}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
