"use client";

import { motion } from "framer-motion";
import { Clock, Inbox, MessageSquareX, Split, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    title: "Je reageert te laat",
    body: "De klant is al verder terwijl jij nog op de klus staat of rijdt.",
    Icon: Clock,
  },
  {
    title: "Je vergeet opvolging",
    body: "Vandaag druk, morgen weer vol. Ondertussen stopt de klant met wachten.",
    Icon: MessageSquareX,
  },
  {
    title: "Aanvragen verdwijnen tussen WhatsApp en mail",
    body: "Alles op losse plekken. Geen overzicht. Geen prioriteit.",
    Icon: Split,
  },
  {
    title: "Niets voelt urgent — tot het te laat is",
    body: "Wat geld had opgeleverd, zakt weg zonder dat je het op de bank ziet.",
    Icon: Inbox,
  },
  {
    title: "Jij moet overal tegelijk zijn",
    body: "Er is geen tweede persoon die meeleest. Toch verwacht de klant een snel antwoord.",
    Icon: UserX,
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
      id="probleem"
      className={cn(
        "relative overflow-hidden border-b border-border/30 py-20 md:py-28 dark:border-white/[0.06]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[min(380px,55%)] bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--primary)/0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--primary)/0.1),transparent_72%)]" aria-hidden />
      <div className="relative mx-auto max-w-[1180px] px-4 md:px-8">
        <motion.div className="mx-auto max-w-3xl text-center" {...fade}>
          <p className="cf-landing-eyebrow">Het probleem</p>
          <h2 className="cf-landing-h2 mt-4">Zo verlies je klanten zonder het te merken</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Geen moraalpredikant: dit is hoe het bij veel zzp’ers en kleine bedrijven misgaat. Herken je dit, dan lekt
            er omzet.
          </p>
        </motion.div>

        <motion.ul
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          {...fade}
          transition={{ ...fade.transition, delay: 0.06 }}
        >
          {ITEMS.map(({ title, body, Icon }) => (
            <li key={title} className="cf-landing-pro-card flex gap-4 p-7 md:gap-5 md:p-8">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold leading-snug text-foreground">{title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
