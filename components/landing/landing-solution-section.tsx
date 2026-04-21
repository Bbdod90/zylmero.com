"use client";

import { motion } from "framer-motion";
import { CalendarClock, Filter, Inbox, MessageCircle } from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

const BLOCKS = [
  {
    title: "Reageert direct",
    body: "Eerste antwoord gaat eruit zodra de aanvraag binnenkomt. Strak. Professioneel. In jouw woorden.",
    Icon: MessageCircle,
  },
  {
    title: "Vangt aanvragen op",
    body: "Mail, WhatsApp, site: alles op één plek. Geen gezoek meer tussen apps.",
    Icon: Inbox,
  },
  {
    title: "Houdt serieuze klanten vast",
    body: "Wat telt, blijft bovenaan. De rest verdwijnt niet in een mapje ergens onderaan.",
    Icon: Filter,
  },
  {
    title: "Helpt opvolgen",
    body: "Niets blijft stilletjes liggen. Jij ziet wat wacht — en pakt verkopen af waar het moet.",
    Icon: CalendarClock,
  },
] as const;

export function LandingSolutionSection() {
  return (
    <motion.section
      id="oplossing"
      className="scroll-mt-28 border-b border-border/30 py-20 md:py-28 dark:border-white/[0.06]"
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="cf-landing-eyebrow">De oplossing</p>
          <h2 className="cf-landing-h2 mt-4">Zylmero lost dat op</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Minder gemiste aanvragen. Sneller contact. Betere opvolging. Meer omzet uit wat er al binnenkomt — zonder
            dat jij er een nachtbaan bij neemt.
          </p>
        </div>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {BLOCKS.map(({ title, body, Icon }) => (
            <li key={title} className="cf-landing-pro-card p-7 md:p-8">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mt-6 text-base font-semibold leading-snug text-foreground md:text-lg">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">{body}</p>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
          Jij stelt grenzen en toon in. Zylmero voert uit wat jij wilt laten lopen.
        </p>
      </div>
    </motion.section>
  );
}
