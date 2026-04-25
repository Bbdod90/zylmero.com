import Link from "next/link";
import {
  ArrowUpRight,
  Brain,
  Inbox,
  MessageSquare,
  Sparkles,
  Users,
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
}: {
  demoMode: boolean;
  /** Beste lead voor “open in workspace” (AI-acties op de lead-pagina). */
  priorityLeadId: string | null;
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
      title: priorityLeadId ? "Top klant (AI-acties)" : "Klanten",
      description:
        "Samenvatting, score, AI-antwoord en slimme opvolging — per klant in het werkblad.",
      icon: Users,
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
