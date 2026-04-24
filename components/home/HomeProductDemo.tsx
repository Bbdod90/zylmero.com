"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useHomeDemo } from "@/components/home/home-demo-context";
import { ProductMockup } from "@/components/home/ProductMockup";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const steps = [
  "Aanvraag komt binnen op één plek",
  `${BRAND_NAME} antwoordt direct met context`,
  "Afspraak staat vast — jij ziet het in je overzicht",
];

export function HomeProductDemo() {
  const { demoOpen, setDemoOpen } = useHomeDemo();

  return (
    <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
      <DialogContent
        className={cn(
          "max-h-[90dvh] max-w-[min(100vw-1.5rem,560px)] gap-0 overflow-hidden border p-0 sm:max-w-xl",
          "border-slate-200/90 bg-white/98 text-slate-900 shadow-2xl backdrop-blur-xl",
          "dark:border-white/[0.14] dark:bg-[#0a0e16]/98 dark:text-white",
          "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_28px_90px_-16px_rgba(0,0,0,0.75)]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/55 to-transparent dark:via-blue-400/35"
          aria-hidden
        />
        <DialogHeader className="relative border-b border-slate-100 px-6 pb-5 pt-7 text-left dark:border-white/[0.08]">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/55">
            <Sparkles className="size-3.5 text-blue-600 opacity-90 dark:text-blue-400" aria-hidden />
            Product preview
          </div>
          <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Zo loopt een aanvraag af
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-slate-600 dark:text-white/65">
            Van binnenkomende aanvraag tot bevestigde afspraak — precies wat je klant merkt, zonder dat jij
            tussenkomt.
          </DialogDescription>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="max-h-[calc(90dvh-12rem)] overflow-y-auto px-5 pb-7 pt-5 sm:px-7"
        >
          <ProductMockup floating={false} variant="modal" />
          <ol className="mt-7 space-y-3">
            {steps.map((label, i) => (
              <li
                key={label}
                className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/90 px-3 py-2.5 text-sm font-medium leading-snug text-slate-800 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white/85"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-600/12 font-mono text-xs font-semibold text-blue-700 dark:bg-blue-400/15 dark:text-blue-300">
                  {i + 1}
                </span>
                <span className="pt-0.5">{label}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
