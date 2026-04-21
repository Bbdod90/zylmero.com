"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "Wat doet Zylmero precies?",
    a: "Het vangt aanvragen binnen (mail, WhatsApp, site), antwoordt meteen met context, en houdt serieuze leads warm tot jij overneemt of een afspraak staat.",
  },
  {
    q: "Moet ik technisch zijn om te starten?",
    a: "Nee. Kanalen koppelen, voorkeuren instellen en je eerste flow — dat is bewust eenvoudig gehouden. Support helpt als je wilt opschalen.",
  },
  {
    q: "Welke kanalen ondersteunt het?",
    a: "Onder andere e-mail, website-widget en WhatsApp — zodat alles in één stroom landt i.p.v. losse apps.",
  },
  {
    q: "Kan ik maandelijks opzeggen?",
    a: "Ja. Je zit niet vast aan lange contracten — schaal omhoog of omlaag wanneer jouw volume verandert.",
  },
] as const;

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
};

export function LandingFaqSection() {
  return (
    <motion.section
      id="faq"
      className="scroll-mt-28 border-t border-border/45 bg-muted/15 py-28 md:py-36 dark:border-white/[0.08] dark:bg-white/[0.02]"
      {...fade}
    >
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 lg:px-8">
        <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Veelgesteld</p>
        <h2 className="mt-4 text-center text-balance text-3xl font-semibold tracking-[-0.035em] text-foreground md:text-5xl">Antwoorden die je snel wilt</h2>
        <p className="mx-auto mt-5 max-w-lg text-center text-muted-foreground">
          Kort en eerlijk — geen enterprise-rompslomp.
        </p>
        <div className="mt-12 space-y-2">
          {ITEMS.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border/50 bg-card/60 open:bg-card/85 dark:border-white/[0.09] dark:open:bg-[hsl(222_28%_10%/0.95)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-foreground md:px-6 md:py-5">
                {item.q}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="border-t border-border/40 px-5 pb-5 pt-3 text-[15px] leading-relaxed text-muted-foreground md:px-6 md:pb-6 dark:border-white/[0.07]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
