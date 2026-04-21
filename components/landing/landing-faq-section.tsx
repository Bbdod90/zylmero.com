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
      className="scroll-mt-24 border-t border-border/45 bg-muted/15 py-12 md:py-14 dark:border-white/[0.08] dark:bg-white/[0.02]"
      {...fade}
    >
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 lg:px-8">
        <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">FAQ</p>
        <h2 className="mt-2 text-center text-balance text-2xl font-semibold tracking-[-0.035em] text-foreground md:text-3xl">Veelgestelde vragen</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">Kort antwoord.</p>
        <div className="mt-6 space-y-2">
          {ITEMS.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border/50 bg-card/60 open:bg-card/85 dark:border-white/[0.09] dark:open:bg-[hsl(222_28%_10%/0.95)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-left text-[14px] font-semibold text-foreground md:px-5 md:py-4">
                {item.q}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="border-t border-border/40 px-4 pb-4 pt-2 text-[14px] leading-relaxed text-muted-foreground md:px-5 md:pb-4 dark:border-white/[0.07]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
