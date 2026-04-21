import { HeartHandshake, LineChart, MessageCircle, Rocket } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { BRAND_NAME } from "@/lib/brand";

const STEPS = [
  {
    icon: HeartHandshake,
    title: "Wie wij zijn",
    body: "We bouwen voor zzp'ers en echt kleine bedrijven: geen sales-afdeling, geen IT-team — wél elke aanvraag serieus nemen.",
  },
  {
    icon: MessageCircle,
    title: "Het probleem",
    body: "Berichten verdwijnen in apps, concurrenten antwoorden sneller, en jij bent op de werkvloer. Als je klein bent, merk je dat direct in de agenda. Gemiste chats zijn euro’s die je nooit terugziet.",
  },
  {
    icon: Rocket,
    title: `Wat ${BRAND_NAME} doet`,
    body: "Eén rustige inbox, AI die jouw toon volgt, offertes en afspraken in één pijplijn. Van eerste bericht tot geboekt moment — zonder chaos.",
  },
  {
    icon: LineChart,
    title: "Wat jij merkt",
    body: "Sneller antwoord, meer geboekte afspraken, en cijfers die laten zien waar je euro’s pakt — en waar je ze nog laat liggen.",
  },
];

export function BrandStorySection() {
  return (
    <section
      id="verhaal"
      className="relative border-b border-border/50 py-16 dark:border-white/5 md:py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <ScrollReveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Ons verhaal
          </p>
          <h2 className="mt-3 text-center text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Van ruis in je inbox naar rust in je planning
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground md:text-base">
            Geen corporate praatje — gewoon waar we vandaan komen, wat we bouwen, en waarom het voor jou werkt.
          </p>
        </ScrollReveal>

        <div className="relative mt-14 md:mt-16">
          <div
            className="pointer-events-none absolute left-[1.35rem] top-2 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-primary/40 via-primary/15 to-transparent md:block"
            aria-hidden
          />
          <ul className="space-y-10 md:space-y-12">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.title}>
                  <ScrollReveal delayMs={i * 100} className="flex gap-5 md:gap-8">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/20 to-primary/5 shadow-[0_12px_40px_-24px_hsl(var(--primary)/0.5)]">
                      <Icon className="size-5 text-primary" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-foreground md:text-xl">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
                        {s.body}
                      </p>
                    </div>
                  </ScrollReveal>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
