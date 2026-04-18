"use client";

import { motion } from "framer-motion";
import { AlertCircle, Clock, Inbox, MessageSquareOff, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    title: "Je ziet aanvragen te laat",
    body: "Na je werk pas mail openen — en dan is de klant al bij iemand anders geweest.",
    Icon: Clock,
  },
  {
    title: "Berichten liggen verspreid",
    body: "WhatsApp hier, mail daar, een formulier ergens anders. Geen één plek waar je rustig prioriteit kunt geven.",
    Icon: Inbox,
  },
  {
    title: "Offertes en terugbellen blijven liggen",
    body: "Je bedoelde het goed — maar tussen twee klussen schiet opvolgen er vaak bij in.",
    Icon: MessageSquareOff,
  },
  {
    title: "Je concurrent reageert eerder",
    body: "De klant vergelijkt niet alleen prijs — maar ook wie eerst serieus antwoord geeft.",
    Icon: AlertCircle,
  },
  {
    title: "Het voelt minder erg dan het is",
    body: "Losse aanvragen lijken klein — bij elkaar is het maandelijks gemiste omzet waar je niet van slaapt als je het een keer uitrekent.",
    Icon: Wallet,
  },
] as const;

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

export function LandingPainCostSection({ className }: { className?: string }) {
  return (
    <section
      id="wat-het-kost"
      className={cn(
        "relative overflow-hidden border-b border-border/40 py-16 md:py-20 lg:py-24 dark:border-white/[0.06]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--muted)/0.35)_0%,transparent_42%),radial-gradient(ellipse_55%_45%_at_100%_30%,hsl(var(--destructive)/0.06),transparent_55%),radial-gradient(ellipse_50%_40%_at_0%_70%,hsl(var(--primary)/0.06),transparent_52%)] dark:bg-[linear-gradient(180deg,hsl(228_28%_7%/0.85)_0%,transparent_45%),radial-gradient(ellipse_55%_45%_at_100%_25%,hsl(var(--destructive)/0.08),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1100px] px-4 md:px-8">
        <motion.div className="mx-auto max-w-2xl text-center" {...fade}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Dit herken je vast
          </p>
          <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-[2rem]">
            Wat het je nu kost — zonder dat je het altijd doorhebt
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Geen verwijt: als kleine ondernemer ben je met je werk bezig. Maar elke gemiste of trage reactie is een opening voor een ander — en dat raakt je omzet.
          </p>
        </motion.div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-12 lg:gap-5">
          {ITEMS.map(({ title, body, Icon }, i) => {
            const featured = i === ITEMS.length - 1;
            return (
            <motion.li
              key={title}
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.05 }}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl border bg-card/75 p-5 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.35)] backdrop-blur-[2px] transition duration-300",
                "border-border/50 hover:border-primary/30 hover:shadow-[0_20px_48px_-32px_hsl(var(--primary)/0.22)]",
                "dark:border-white/[0.08] dark:bg-[hsl(228_26%_8%/0.55)] dark:shadow-black/40",
                featured
                  ? "lg:col-span-12 lg:flex-row lg:items-start lg:gap-6 lg:p-7"
                  : "lg:col-span-3",
              )}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent opacity-0 transition group-hover:opacity-100"
                aria-hidden
              />
              {!featured ? (
                <div className="mb-3 flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-destructive/15 to-destructive/5 text-destructive ring-1 ring-destructive/20 dark:from-destructive/25 dark:to-destructive/10 dark:text-red-300">
                  <Icon className="size-5" strokeWidth={1.65} aria-hidden />
                </div>
              ) : (
                <div className="mb-4 flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 text-primary ring-1 ring-primary/25 lg:mb-0">
                  <Icon className="size-6" strokeWidth={1.65} aria-hidden />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3
                  className={cn(
                    "text-sm font-semibold leading-snug text-foreground md:text-base",
                    featured && "text-base md:text-lg",
                  )}
                >
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">{body}</p>
                {featured ? (
                  <p className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.05] px-4 py-3 text-sm leading-relaxed text-foreground dark:border-primary/30 dark:bg-primary/[0.08]">
                    <span className="font-semibold text-primary">Gevolg:</span> omzet die je niet ziet verdwijnen — tot je het bij elkaar optelt. Zylmero pakt tempo en overzicht zodat minder aanvragen tussen wal en schip verdwijnen.
                  </p>
                ) : null}
              </div>
            </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
