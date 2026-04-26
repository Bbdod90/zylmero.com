import Link from "next/link";
import { ArrowUpRight, Bot, Inbox, Link2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/brand";

type HubLink = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

/** Centrale springplank: chatbot, kennis en kanalen — antwoorden op echte aanvragen (WhatsApp, site, mail). */
export function DashboardAiHub({ demoMode }: { demoMode: boolean }) {
  const links: HubLink[] = [
    {
      href: "/dashboard/chatbot",
      title: "Je chatbot",
      description:
        "Koppel je website; daarna weet je bot wat er op je site staat — voor WhatsApp, site en mail.",
      icon: Bot,
    },
    {
      href: "/dashboard/ai-koppelingen",
      title: "Kanalen",
      description:
        "WhatsApp, mail en site-widget op één plek. Geen gemiste appjes terwijl je op de klus zit.",
      icon: Link2,
    },
    {
      href: "/dashboard/inbox",
      title: "Berichten",
      description:
        "Alles binnen in één wachtrij: zelf antwoorden of een AI-concept gebruiken en doorsturen.",
      icon: Inbox,
    },
  ];

  return (
    <section
      className="cf-dashboard-panel overflow-hidden p-5 sm:p-6 lg:p-7"
      aria-labelledby="dashboard-ai-hub-heading"
    >
      <div className="flex flex-col gap-4 border-b border-border/45 pb-5 sm:flex-row sm:items-start sm:justify-between dark:border-white/[0.06]">
        <div className="min-w-0 space-y-1.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            AI & antwoorden
          </p>
          <h2
            id="dashboard-ai-hub-heading"
            className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            Mis geen klant omdat je het druk hebt
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {BRAND_NAME} is gebouwd voor zelfstandigen en kleine teams:{" "}
            <strong className="font-medium text-foreground">
              eerste reacties op mail en WhatsApp
            </strong>
            , op basis van jouw kennis — jij houdt de regie over wat er de deur uit gaat. Geen
            eindeloos scenario-bouwen; wel sneller antwoord en minder weggelekte aanvragen.
            {demoMode ? (
              <span className="mt-1 block text-2xs text-amber-800 dark:text-amber-200/90">
                Demo: voorbeelddata waar dat zo staat ingesteld.
              </span>
            ) : null}
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 rounded-lg" asChild>
          <Link href="/dashboard/ai-koppelingen">
            Kanalen koppelen
            <ArrowUpRight className="ml-1.5 size-3.5 opacity-80" aria-hidden />
          </Link>
        </Button>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex h-full flex-col gap-2 rounded-xl border border-border/50 bg-card/60 p-4 transition-all hover:border-primary/25 hover:shadow-[0_12px_40px_-28px_hsl(var(--primary)/0.25)] dark:border-white/[0.09] dark:bg-[hsl(222_28%_10%/0.5)] dark:hover:border-primary/35"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/12 transition-transform group-hover:scale-[1.02]">
                  <Icon className="size-4 shrink-0" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary">
                  {item.title}
                </span>
                <span className="text-2xs leading-relaxed text-muted-foreground">{item.description}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
