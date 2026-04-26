import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Bot,
  CalendarDays,
  FileText,
  Kanban,
  Link2,
  MessageCircle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageFrame } from "@/components/layout/page-frame";
import { DashboardWorkSurface } from "@/components/layout/dashboard-work-surface";
import { DashboardInboxPanel } from "@/components/dashboard/dashboard-inbox-panel";
import { ProDashboardCard } from "@/components/dashboard/pro-dashboard-card";
import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";
import type { WorkspaceHomeSnapshot } from "@/lib/queries/workspace-home-snapshot";
import type { CustomerReadiness } from "@/lib/dashboard/readiness";
import { CustomerReadinessHero } from "@/components/dashboard/customer-readiness-hero";
import { DashboardAiHub } from "@/components/dashboard/dashboard-ai-hub";
import { OnboardingStepsStrip } from "@/components/dashboard/onboarding-steps-strip";
import { SetupHintBar } from "@/components/dashboard/setup-hint-bar";

function nlGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}

/** Chat + Offertes als één strak paneel met middenlijn (desktop). */
function PrimaryFlowDuo() {
  const cells = [
    {
      href: "/dashboard/inbox",
      title: "Berichten",
      description:
        "Mail, WhatsApp en site in één wachtrij — zelf antwoorden of een AI-concept als start.",
      icon: MessageCircle,
    },
    {
      href: "/dashboard/quotes",
      title: "Offertes",
      description: "Stuur voorstellen en rond opdrachten af.",
      icon: FileText,
    },
  ] as const;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.35rem] border border-border/50 shadow-sm",
        "bg-gradient-to-br from-card via-card/95 to-muted/[0.12]",
        "dark:border-white/[0.1] dark:from-[hsl(222_30%_13%/0.98)] dark:via-[hsl(222_28%_11%/0.95)] dark:to-[hsl(228_32%_9%/0.88)]",
      )}
    >
      <div className="grid divide-y divide-border/55 md:grid-cols-2 md:divide-x md:divide-y-0 dark:divide-white/[0.08]">
        {cells.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "group relative flex min-h-[7.5rem] flex-col justify-between gap-4 p-5 sm:p-6 md:min-h-[8.25rem]",
              "transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/[0.045] hover:shadow-md dark:hover:bg-primary/[0.07]",
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                "bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,hsl(var(--primary)/0.12),transparent_55%)]",
                "dark:bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,hsl(var(--primary)/0.18),transparent_55%)]",
              )}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3.5">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-2xl border text-primary",
                    "border-primary/20 bg-primary/[0.08] ring-1 ring-primary/10",
                    "dark:border-primary/35 dark:bg-primary/[0.12] dark:ring-primary/15",
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {title}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </div>
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition-all",
                  "border-border/55 bg-background/70 group-hover:border-primary/30 group-hover:text-primary",
                  "dark:border-white/[0.1] dark:bg-white/[0.05]",
                )}
                aria-hidden
              >
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatLink({
  href,
  label,
  value,
  pulse,
  compact,
}: {
  href: string;
  label: string;
  value: number;
  pulse?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-2xl border px-3 py-3.5 sm:px-4 sm:py-4",
        "border-border/55 bg-gradient-to-b from-card/95 to-muted/[0.12] shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md active:scale-[0.99]",
        "dark:border-white/[0.1] dark:from-[hsl(222_28%_12%/0.92)] dark:to-[hsl(222_32%_9%/0.5)]",
        pulse && "ring-1 ring-primary/30",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-80"
        aria-hidden
      />
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 font-semibold tabular-nums tracking-tight text-foreground",
          compact ? "text-base sm:text-lg" : "text-xl sm:text-2xl",
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-[0.65rem] font-medium text-primary/80 opacity-0 transition-opacity group-hover:opacity-100">
        Openen →
      </p>
    </Link>
  );
}

/** Compacte route-tegel voor de onderste rij (4 kolommen). */
function RouteTile({
  href,
  title,
  hint,
  icon: Icon,
}: {
  href: string;
  title: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      title={hint}
      className={cn(
        "group flex flex-col items-center gap-2.5 rounded-2xl border border-border/50 bg-background/70 px-3 py-4 text-center transition-all",
        "hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/25 hover:shadow-md active:scale-[0.98]",
        "dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]",
      )}
    >
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-2xl border text-primary transition-colors",
          "border-primary/15 bg-primary/[0.07] ring-1 ring-primary/5",
          "group-hover:border-primary/30 group-hover:bg-primary/[0.11]",
          "dark:border-primary/25 dark:bg-primary/[0.12] dark:ring-primary/10",
        )}
      >
        <Icon className="size-[1.125rem]" strokeWidth={2} aria-hidden />
      </span>
      <span className="text-xs font-semibold leading-tight tracking-tight text-foreground sm:text-[0.8125rem]">
        {title}
      </span>
      <span className="line-clamp-2 text-[0.65rem] leading-snug text-muted-foreground">{hint}</span>
    </Link>
  );
}

export function WorkspaceHome({
  companyName,
  snapshot,
  readiness,
  demoMode,
}: {
  companyName: string;
  snapshot: WorkspaceHomeSnapshot;
  readiness: CustomerReadiness;
  demoMode: boolean;
}) {
  const today = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const greeting = nlGreeting();

  return (
    <PageFrame
      title={companyName}
      subtitle="AI die mail en WhatsApp voor je opvangt als je druk bent — minder gemiste aanvragen, dezelfde persoonlijke toon."
    >
      <DashboardWorkSurface>
        <div className="space-y-5">
          <CustomerReadinessHero readiness={readiness} demoMode={demoMode} />
          <OnboardingStepsStrip onboarding={readiness.onboarding} />
          <SetupHintBar readiness={readiness} demoMode={demoMode} />
        </div>

        <div className="mt-6 sm:mt-8">
          <DashboardAiHub demoMode={demoMode} />
        </div>

        <div className="mt-6 space-y-6 sm:mt-8 sm:space-y-7">
          <div>
            <p className="mb-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Inbox & offertes
            </p>
            <PrimaryFlowDuo />
          </div>

          <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-8">
              <p className="mb-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Laatste berichten
              </p>
              <DashboardInboxPanel messages={snapshot.recentMessages} />
            </div>

            <div className="lg:col-span-4">
              <p className="mb-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Agenda
              </p>
              <ProDashboardCard
                eyebrow="Afspraken"
                title="Komende momenten"
                action={
                  <Button variant="ghost" size="sm" className="h-8 rounded-full px-2 text-2xs" asChild>
                    <Link href="/dashboard/appointments">
                      Alles
                      <ArrowRight className="ml-1 size-3.5" aria-hidden />
                    </Link>
                  </Button>
                }
              >
                {snapshot.upcomingAppointments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/50 bg-muted/[0.06] px-4 py-8 text-center dark:border-white/[0.08]">
                    <CalendarDays className="mx-auto size-9 text-muted-foreground/60" aria-hidden />
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      Nog geen geplande afspraken. Plan een follow-up of intake vanuit een klant.
                    </p>
                    <Button variant="secondary" size="sm" className="mt-4 rounded-lg" asChild>
                      <Link href="/dashboard/appointments">Naar agenda</Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {snapshot.upcomingAppointments.map((a) => (
                      <li key={a.id}>
                        <Link
                          href="/dashboard/appointments"
                          className="flex flex-col gap-0.5 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-border/60 hover:bg-muted/25 dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04]"
                        >
                          <span className="text-xs font-medium text-muted-foreground">
                            {formatDateTime(a.starts_at, "EEE d MMM · HH:mm")}
                          </span>
                          <span className="text-sm font-medium text-foreground">{a.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </ProDashboardCard>
            </div>
          </div>

          <section
            className={cn(
              "relative overflow-hidden rounded-2xl border border-border/50 p-4 sm:p-5",
              "bg-gradient-to-br from-card/95 via-card/90 to-muted/12",
              "dark:border-white/[0.09] dark:from-[hsl(222_30%_13%/0.96)] dark:via-[hsl(222_28%_11%/0.94)] dark:to-[hsl(228_32%_9%/0.88)]",
            )}
            aria-label="Overzicht vandaag"
          >
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <div className="min-w-0 space-y-2">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Overzicht
                </p>
                <h2
                  className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
                  title={`${greeting} — ${companyName}`}
                >
                  <span className="block truncate">
                    {greeting}
                    <span className="font-normal text-muted-foreground"> — </span>
                    <span className="text-foreground">{companyName}</span>
                  </span>
                </h2>
                <p className="max-w-md text-xs font-medium leading-relaxed text-muted-foreground sm:text-sm">
                  Cijfers ter referentie —{" "}
                  <Link
                    href="/dashboard/chatbot"
                    className="font-semibold text-foreground underline decoration-primary/35 underline-offset-2 hover:decoration-primary"
                  >
                    stel eerst je chatbot in
                  </Link>{" "}
                  zodat binnenkomende vragen niet blijven liggen.
                </p>
                <p className="text-[0.65rem] font-medium capitalize text-muted-foreground/85">{today}</p>
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5 lg:max-w-xl">
                <StatLink href="/dashboard/leads" label="Klanten" value={snapshot.leadCount} compact />
                <StatLink
                  href="/dashboard/inbox"
                  label="Gesprekken"
                  value={snapshot.conversationCount}
                  compact
                />
                <StatLink href="/dashboard/quotes" label="Offertes" value={snapshot.quoteCount} compact />
                <StatLink
                  href="/dashboard/inbox"
                  label="Meldingen"
                  value={snapshot.unreadNotifications}
                  pulse={snapshot.unreadNotifications > 0}
                  compact
                />
              </div>
            </div>
          </section>

          <div>
            <p className="mb-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Snel verder
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <RouteTile
                href="/dashboard/chatbot"
                title="Chatbot & kennis"
                hint="Site, teksten, toon"
                icon={Bot}
              />
              <RouteTile
                href="/dashboard/pipeline"
                title="Pipeline"
                hint="Zie waar het geld ligt"
                icon={Kanban}
              />
              <RouteTile
                href="/dashboard/ai-koppelingen"
                title="Kanalen"
                hint="WhatsApp, mail, widget"
                icon={Link2}
              />
              <RouteTile
                href="/dashboard/leads"
                title="Klanten"
                hint="Contacten en opvolging"
                icon={Users}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border/40 pt-6 text-center text-2xs text-muted-foreground dark:border-white/[0.06]">
          <Link
            href="/dashboard/settings"
            className="font-medium text-foreground/80 underline decoration-border/70 underline-offset-4 transition hover:text-foreground hover:decoration-primary/50"
          >
            Instellingen
          </Link>
          <span className="hidden text-muted-foreground/50 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href="/dashboard/chatbot"
            className="font-medium text-foreground/80 underline decoration-border/70 underline-offset-4 transition hover:text-foreground hover:decoration-primary/50"
          >
            Chatbot & kennis
          </Link>
          <span className="hidden text-muted-foreground/50 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href="/dashboard/ai-koppelingen"
            className="font-medium text-foreground/80 underline decoration-border/70 underline-offset-4 transition hover:text-foreground hover:decoration-primary/50"
          >
            Kanalen
          </Link>
          <span className="hidden text-muted-foreground/50 sm:inline" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bell className="size-3.5 opacity-70" aria-hidden />
            Meldingen volg je in de rechterbalk of bij Berichten
          </span>
        </div>
      </DashboardWorkSurface>
    </PageFrame>
  );
}
