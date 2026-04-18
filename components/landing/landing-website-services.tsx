"use client";

import { motion } from "framer-motion";
import {
  Bot,
  CalendarCheck,
  Gauge,
  Globe2,
  MailOpen,
  MessageCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Wat je als dienstverlener voor klanten-sites aanbiedt — chatbot eerst, daarna aanvullende opties. */
const SERVICES = [
  {
    title: "Website-chatbot",
    body:
      "AI op je eigen site die in jouw branche praat: afspraak, offerte, veelgestelde vragen — zonder dat jij 24/7 online hoeft.",
    Icon: Bot,
    emphasis: true,
  },
  {
    title: "Mailbox & inbox opruimen",
    body:
      "Minder rommel tussen mail, site en WhatsApp: urgentie zien, sneller antwoorden — een soort ‘inbox cleaner’ voor drukke ondernemers.",
    Icon: MailOpen,
    emphasis: false,
  },
  {
    title: "Widget op je merk",
    body:
      "Chatballon en kleuren die bij je site passen — geen generieke popup die niet bij je uitstraling hoort.",
    Icon: Globe2,
    emphasis: false,
  },
  {
    title: "WhatsApp · mail · site",
    body:
      "Bezoeker start op de site; het gesprek loopt door waar de klant wil — jij volgt alles op één plek.",
    Icon: MessageCircle,
    emphasis: false,
  },
  {
    title: "Offerte & afspraak-flow",
    body:
      "Van eerste vraag naar concrete volgende stap: datum, dienst, naam — minder halve gesprekken.",
    Icon: CalendarCheck,
    emphasis: false,
  },
  {
    title: "Zichtbaarheid & vertrouwen",
    body:
      "FAQ en korte teksten die zoekmachines en bezoekers helpen — plus duidelijke privacy en opt-in waar nodig.",
    Icon: Search,
    emphasis: false,
  },
  {
    title: "Snelheid & beschikbaarheid",
    body:
      "Eerste antwoord binnen seconden op de site — ook buiten kantooruren — zodat leads niet naar de concurrent gaan.",
    Icon: Gauge,
    emphasis: false,
  },
  {
    title: "Veilig omgaan met data",
    body:
      "Geen losse briefjes meer: gesprekken en gegevens netjes geborgd — belangrijk voor vertrouwen en AVG-bewustzijn.",
    Icon: ShieldCheck,
    emphasis: false,
  },
] as const;

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

export function LandingWebsiteServices({ className }: { className?: string }) {
  return (
    <motion.section
      id="diensten-website"
      className={cn(
        "scroll-mt-28 border-b border-border/40 py-14 md:py-20 dark:border-white/[0.06]",
        className,
      )}
      {...fade}
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Waar we mee beginnen
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Chatbots voor websites — en wat je er nog meer bij kunt doen
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Eerst zetten we een sterke{" "}
            <span className="font-medium text-foreground">website-chatbot</span> neer die past bij de branche van je
            klant. Daarna kun je uitbreiden met inbox-structuur, WhatsApp-koppeling, betere flows en meer — zonder meteen
            het keuken aan te leggen.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ title, body, Icon, emphasis }) => (
            <li
              key={title}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-card/60 p-5 shadow-sm transition duration-300",
                "hover:-translate-y-0.5 hover:shadow-md",
                emphasis
                  ? "border-primary/35 bg-gradient-to-b from-primary/[0.09] to-transparent ring-1 ring-primary/15 dark:from-primary/[0.12]"
                  : "border-border/45 hover:border-primary/28 dark:border-white/[0.08] dark:bg-[hsl(228_26%_9%/0.55)]",
              )}
            >
              {emphasis ? (
                <div
                  className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-primary/15 blur-2xl"
                  aria-hidden
                />
              ) : null}
              <div
                className={cn(
                  "relative flex size-10 items-center justify-center rounded-xl text-primary ring-1 ring-primary/15",
                  emphasis ? "bg-primary/20" : "bg-gradient-to-br from-primary/25 to-primary/5",
                )}
              >
                <Icon className="size-5" strokeWidth={1.65} aria-hidden />
              </div>
              <p className="relative mt-4 text-sm font-semibold text-foreground">{title}</p>
              <p className="relative mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground md:text-sm">
          De interactieve demo hieronder laat vooral de chatbot-kant zien; inbox, mailbox en andere modules schakel je in
          wanneer het voor jouw klant past — beschikbaarheid per module zie je straks in het account.
        </p>
      </div>
    </motion.section>
  );
}
