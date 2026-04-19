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
        "relative overflow-hidden border-b border-border/30 py-16 md:py-20 lg:py-24 dark:border-white/[0.06]",
        className,
      )}
    >
      <div className="relative mx-auto max-w-[640px] px-4 md:px-8">
        <motion.div className="text-center" {...fade}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Dit herken je vast
          </p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Wat het je nu kost — zonder dat je het altijd doorhebt
          </h2>
          <p className="mt-5 text-base leading-[1.65] text-muted-foreground md:text-lg">
            Geen verwijt: als kleine ondernemer ben je met je werk bezig. Maar elke gemiste of trage reactie is een opening voor een ander — en dat raakt je omzet.
          </p>
        </motion.div>

        <motion.ul
          className="mt-14 space-y-0 divide-y divide-border/35 border-y border-border/35 dark:divide-white/[0.08] dark:border-white/[0.08]"
          {...fade}
          transition={{ ...fade.transition, delay: 0.06 }}
        >
          {ITEMS.map(({ title, body, Icon }) => (
            <li key={title} className="flex gap-4 py-7 first:pt-8 last:pb-8 md:gap-5">
              <Icon
                className="mt-0.5 size-5 shrink-0 text-primary/70"
                strokeWidth={1.5}
                aria-hidden
              />
              <div>
                <h3 className="font-medium leading-snug text-foreground">{title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{body}</p>
                {title === "Het voelt minder erg dan het is" ? (
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Gevolg:</span> omzet die je niet ziet verdwijnen — tot je
                    het bij elkaar optelt. Met tempo en overzicht verdwijnen minder aanvragen tussen wal en schip.
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
