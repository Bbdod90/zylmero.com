"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";

const ROWS = [
  { without: "Te laat reageren = klant weg", with: "Eerste antwoord binnen seconden" },
  { without: "Chaos tussen mailbox, WhatsApp en site", with: "Eén inbox, één waarheid" },
  { without: "Geen structuur in opvolging", with: "AI houdt het gesprek gaande tot jij overneemt" },
  { without: "Jij bent de bottleneck", with: "Jij pakt alleen deals die de moeite waard zijn" },
] as const;

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
};

export function LandingComparisonSection() {
  return (
    <motion.section
      id="verschil"
      className="scroll-mt-28 border-t border-border/45 py-28 md:py-36 dark:border-white/[0.08]"
      {...fade}
    >
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8">
        <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Contrast</p>
        <h2 className="mt-4 text-balance text-center text-3xl font-semibold tracking-[-0.035em] text-foreground md:text-5xl md:leading-[1.05]">
          Zonder vs. met {BRAND_NAME}
        </h2>
        <div className="mt-14 overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-[var(--shadow-md)] backdrop-blur-sm dark:border-white/[0.1] dark:bg-[hsl(222_30%_8%/0.5)]">
          <div className="grid grid-cols-2 border-b border-border/45 text-center dark:border-white/[0.08]">
            <div className="border-r border-border/45 py-4 dark:border-white/[0.08]">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Minus className="size-3.5" aria-hidden />
                Zo nu
              </span>
            </div>
            <div className="py-4">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                <Plus className="size-3.5" aria-hidden />
                Met Zylmero
              </span>
            </div>
          </div>
          <div className="divide-y divide-border/40 dark:divide-white/[0.06]">
            {ROWS.map((row) => (
              <div key={row.without} className="grid grid-cols-2">
                <p className="border-r border-border/45 p-5 text-[14px] leading-snug text-muted-foreground md:p-6 md:text-[15px] dark:border-white/[0.06]">
                  {row.without}
                </p>
                <p className="p-5 text-[14px] font-medium leading-snug text-foreground md:p-6 md:text-[15px]">{row.with}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
