import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Brain,
  ClipboardList,
  Inbox,
  MessageSquare,
  Sparkles,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/brand";

type HubLink = {
  href: string;
  title: string;
  description: string;
  icon: typeof Brain;
};

export function DashboardAiHub({
  demoMode,
  priorityLeadId,
  websiteChatHref,
}: {
  demoMode: boolean;
  /** Beste lead voor “open in workspace” (AI-acties op de lead-pagina). */
  priorityLeadId: string | null;
  /** Wizard of eerste bot. */
  websiteChatHref: string;
}) {
  const leadHref = priorityLeadId
    ? `/dashboard/leads/${priorityLeadId}`
    : "/dashboard/leads";

  const links: HubLink[] = [
    {
      href: "/dashboard/ai-koppelingen",
      title: "AI & koppelingen",
      description: `Train ${BRAND_NAME}, koppel WhatsApp, mail en widget — alles in Berichten.`,
      icon: Brain,
    },
    {
      href: "/dashboard/ai",
      title: "Toon & antwoordstijl",
      description: "Hoe klinkt je AI in concepten en auto-antwoorden.",
      icon: Sparkles,
    },
    {
      href: "/dashboard/settings?tab=knowledge",
      title: "Kennis voor AI",
      description: "FAQ, prijshints en snippets die antwoorden scherper maken.",
      icon: MessageSquare,
    },
    {
      href: "/dashboard/inbox",
      title: "Berichten",
      description: "Open een thread en gebruik het AI-concept voor je antwoord.",
      icon: Inbox,
    },
    {
      href: leadHref,
      title: priorityLeadId ? "Top lead (AI-acties)" : "Leads",
      description:
        "Samenvatting, score, AI-antwoord en slimme opvolging — per lead in het werkblad.",
      icon: Users,
    },
    {
      href: "/dashboard/automations",
      title: "Automatiseringen",
      description: "Opvolgingsritmes en regels, inclusief optie AI-antwoord.",
      icon: Zap,
    },
    {
      href: websiteChatHref,
      title: "Website-chat",
      description: "Embeddable assistent met wizard en test.",
      icon: Bot,
    },
    {
      href: "/dashboard/playbooks",
      title: "Playbooks",
      description: "Korte werkwijzen: snel antwoorden, offerte-flow, AI als voorstel.",
      icon: Wand2,
    },
    {
      href: "/dashboard/templates",
      title: "Snelle antwoorden",
      description: "Vaste stukken tekst om in de inbox te plakken.",
      icon: ClipboardList,
    },
  ];

  return (
    <section
      className="cf-dashboard-panel overflow-hidden p-5 sm:p-6 lg:p-7"
      aria-labelledby="dashboard-ai-hub-heading"
    >
      <div className="flex flex-col gap-4 border-b border-border/45 pb-5 sm:flex-row sm:items-start sm:justify-between dark:border-white/[0.06]">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            AI-assistent
          </p>
          <h2
            id="dashboard-ai-hub-heading"
            className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            Waar AI je al helpt
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {BRAND_NAME} stuurt <strong className="font-medium text-foreground">concepten en inzichten</strong>; jij
            blijft beslissen over verzenden, status en offertes. Gebruik deze plekken om snel naar de juiste plek te
            springen.
            {demoMode ? (
              <span className="mt-1 block text-2xs text-amber-800 dark:text-amber-200/90">
                Demo: acties gebruiken voorbeelddata waar dat zo is ingesteld.
              </span>
            ) : null}
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 rounded-lg" asChild>
          <Link href="/dashboard/ai-koppelingen">
            Volledig stappenplan
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
                className="group flex h-full flex-col gap-2 rounded-xl border border-border/50 bg-gradient-to-b from-card/80 to-muted/[0.08] p-4 transition-colors hover:border-primary/30 hover:from-primary/[0.04] hover:to-card dark:border-white/[0.06] dark:from-card/60 dark:to-card/20 dark:hover:border-primary/25"
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
