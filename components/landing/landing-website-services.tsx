"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Samengevat — geen raster van losse kaarten. */
const BLOCKS = [
  {
    title: "Website-chatbot",
    body:
      "AI op je site die in jouw branche praat: afspraak, offerte, veelgestelde vragen — zonder dat jij 24/7 online hoeft.",
  },
  {
    title: "Inbox, mail & WhatsApp",
    body:
      "Minder rommel tussen kanalen: urgentie zien, sneller antwoorden. Bezoeker start op de site; jij volgt alles op één plek.",
  },
  {
    title: "Merk, vertrouwen & data",
    body:
      "Widget die bij je uitstraling past, duidelijke FAQ en privacy — en gesprekken netjes geborgd i.p.v. losse briefjes.",
  },
  {
    title: "Offertes, snelheid, beschikbaarheid",
    body:
      "Van eerste vraag naar volgende stap, ook buiten kantooruren — zodat leads niet naar de concurrent gaan.",
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
      className={cn("scroll-mt-28 border-b border-border/30 py-16 md:py-20 dark:border-white/[0.06]", className)}
      {...fade}
    >
      <div className="mx-auto max-w-[1180px] px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Waar we mee beginnen</p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Chatbot op je website — en wat je er nog bij kunt doen
          </h2>
          <p className="mt-5 text-base leading-[1.65] text-muted-foreground">
            Eerst een sterke chatbot die past bij de branche van je klant. Daarna kun je gericht uitbreiden — niet alles tegelijk.
          </p>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 sm:gap-5">
          {BLOCKS.map(({ title, body }, i) => (
            <li
              key={title}
              className={cn(
                "cf-landing-pro-card p-6 md:p-7",
                i === 0 && "sm:col-span-2 sm:flex sm:gap-8 sm:p-8",
              )}
            >
              {i === 0 ? (
                <>
                  <div className="mb-5 shrink-0 sm:mb-0 sm:w-40">
                    <span className="inline-flex rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-primary">
                      Kern
                    </span>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:mt-6">
                      Dit is waar het begint: een assistent op je site die in jouw branche praat.
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base">{body}</p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">{body}</p>
                </>
              )}
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
          De demo hieronder laat vooral de chatbot zien. Overige onderdelen schakel je in wanneer het past.
        </p>
      </div>
    </motion.section>
  );
}
