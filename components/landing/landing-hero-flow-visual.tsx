"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Klant", sub: "Aanvraag" },
  { label: "Reactie", sub: "Direct" },
  { label: "Afspraak", sub: "Ingeboekt" },
] as const;

export function LandingHeroFlowVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full", className)}>
      <div
        className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,hsl(var(--primary)/0.12),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,hsl(var(--primary)/0.18),transparent_72%)]"
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto flex max-w-xl flex-col rounded-[1.75rem] border border-border/40 bg-background/60 px-6 py-10 shadow-[0_32px_80px_-48px_rgb(0_0_0/0.35)] backdrop-blur-xl dark:border-white/[0.1] dark:bg-[hsl(222_32%_8%/0.55)] md:px-10 md:py-12"
      >
        <p className="mb-8 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Zo loopt het bij jou
        </p>
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-center md:gap-2">
          {steps.flatMap((s, i) => {
            const card = (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex w-full min-w-[140px] max-w-[220px] flex-col items-center rounded-2xl border border-border/50 bg-card/80 px-6 py-5 text-center dark:border-white/[0.1] dark:bg-white/[0.04] md:w-auto md:max-w-none"
              >
                <span className="text-lg font-semibold tracking-tight text-foreground md:text-xl">{s.label}</span>
                <span className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-primary">{s.sub}</span>
              </motion.div>
            );
            if (i === steps.length - 1) return [card];
            const arrow = (
              <div
                key={`arrow-${s.label}`}
                className="flex shrink-0 items-center justify-center py-1 text-muted-foreground/80 md:px-2 md:py-0"
              >
                <ArrowRight className="size-5 rotate-90 md:rotate-0" strokeWidth={1.75} aria-hidden />
              </div>
            );
            return [card, arrow];
          })}
        </div>
      </motion.div>
    </div>
  );
}
