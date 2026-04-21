"use client";

import { motion } from "framer-motion";

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export function LandingImpactSection() {
  return (
    <motion.section
      id="impact"
      className="relative scroll-mt-28 border-b border-border/30 bg-gradient-to-b from-background via-muted/30 to-background py-16 md:py-24 dark:border-white/[0.06] dark:via-white/[0.03]"
      {...fade}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-[1180px] px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Het netto-effect</p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
            Dit gebeurt er elke maand
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Voor een kleine zaak telt elke gemiste lead dubbel. Bij elkaar is het al snel{" "}
            <strong className="font-semibold text-foreground">honderden tot duizenden euro&apos;s</strong> per maand — zonder dat
            je het als aparte post ziet.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            { label: "2 gemiste klanten / wk", amount: "€400 – €2.000+", sub: "afhankelijk van je orderwaarde" },
            { label: "Trage reactie op leads", amount: "10 – 30%", sub: "minder conversie dan bij snelle opvolging" },
            { label: "Herstel met structuur", amount: "1 extra afspraak", sub: "betaalt vaak je tooling al terug" },
          ].map((card) => (
            <div
              key={card.label}
              className="cf-landing-pro-card flex flex-col items-center p-7 text-center md:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{card.label}</p>
              <p className="mt-4 font-mono text-2xl font-bold tabular-nums tracking-tight text-foreground md:text-3xl">
                {card.amount}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
