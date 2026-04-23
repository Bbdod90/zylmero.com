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
      className="scroll-mt-24 border-t border-border/45 bg-muted/15 py-9 md:py-11 dark:border-white/[0.08] dark:bg-white/[0.02]"
      {...fade}
    >
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 lg:px-8">
        <p className="cf-landing-eyebrow text-center">FAQ</p>
        <h2 className="cf-landing-h2 mx-auto mt-2 max-w-2xl text-center">Veelgestelde vragen</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">Kort antwoord.</p>
        <div className="cf-landing-pro-card mx-auto mt-5 overflow-hidden p-0">
          {ITEMS.map((item) => (
            <details
              key={item.q}
              className="group border-b border-border/40 last:border-b-0 dark:border-white/[0.07]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-card/40 px-4 py-3.5 text-left text-[14px] font-semibold text-foreground transition-colors hover:bg-muted/25 md:px-5 md:py-4 dark:bg-transparent dark:hover:bg-white/[0.04]">
                {item.q}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="border-t border-border/35 bg-card/30 px-4 pb-4 pt-3 text-[14px] leading-relaxed text-muted-foreground md:px-5 md:pb-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
