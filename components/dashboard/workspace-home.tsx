import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookMarked,
  CalendarDays,
  FileText,
  Kanban,
  MessageCircle,
  Sparkles,
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

function nlGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}

function HubCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof MessageCircle;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-5 sm:p-6",
        "border-border/55 bg-card/80 shadow-sm backdrop-blur-sm",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_20px_50px_-28px_hsl(var(--primary)/0.35)]",
        "dark:border-white/[0.1] dark:bg-[hsl(222_28%_11%/0.85)] dark:hover:border-primary/35",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          "bg-[radial-gradient(ellipse_80%_60%_at_90%_0%,hsl(var(--primary)/0.14),transparent_55%)]",
          "dark:bg-[radial-gradient(ellipse_80%_60%_at_90%_0%,hsl(var(--primary)/0.22),transparent_55%)]",
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl border text-primary",
            "border-primary/20 bg-primary/[0.08] ring-1 ring-primary/10",
            "dark:border-primary/30 dark:bg-primary/[0.14] dark:ring-primary/20",
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition-all",
            "border-border/60 bg-background/80",
            "group-hover:border-primary/25 group-hover:text-primary",
            "dark:border-white/[0.1] dark:bg-white/[0.05]",
          )}
          aria-hidden
        >
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="relative space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}

function StatLink({
  href,
  label,
  value,
  pulse,
}: {
  href: string;
  label: string;
  value: number;
  pulse?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-2xl border px-3 py-3.5 sm:px-4 sm:py-4",
        "border-border/55 bg-gradient-to-b from-card/95 to-muted/[0.12] shadow-sm",
        "transition-all duration-200 hover:border-primary/35 hover:shadow-md",
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
      <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-foreground sm:text-2xl">
        {value}
      </p>
      <p className="mt-2 text-[0.65rem] font-medium text-primary/80 opacity-0 transition-opacity group-hover:opacity-100">
        Openen →
      </p>
    </Link>
  );
}

function QuickLink({
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
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-border/50 bg-background/60 px-3.5 py-3 transition-all",
        "hover:border-primary/30 hover:bg-muted/30 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]",
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-foreground/80 ring-1 ring-border/40 transition-colors group-hover:bg-primary/10 group-hover:text-primary group-hover:ring-primary/20 dark:bg-white/[0.06] dark:ring-white/[0.08]">
        <Icon className="size-[1.125rem]" strokeWidth={2} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold tracking-tight text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

export function WorkspaceHome({
  companyName,
  snapshot,
}: {
  companyName: string;
  snapshot: WorkspaceHomeSnapshot;
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
      subtitle="Overzicht, activiteit en snelle routes — alles wat je vandaag nodig hebt."
    >
      <DashboardWorkSurface>
        <section
          className={cn(
            "relative overflow-hidden rounded-[1.25rem] border border-border/50 p-5 sm:p-7",
            "bg-gradient-to-br from-card via-card/90 to-muted/15",
            "shadow-[0_28px_80px_-48px_rgb(0_0_0/0.45)] dark:border-white/[0.09] dark:from-[hsl(222_30%_13%/0.97)] dark:via-[hsl(222_28%_11%/0.95)] dark:to-[hsl(228_32%_8%/0.9)] dark:shadow-[0_32px_90px_-48px_rgb(0_0_0/0.65)]",
          )}
        >
          <div
            className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-primary/[0.11] blur-3xl dark:bg-primary/[0.16]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/4 size-48 rounded-full bg-primary/[0.06] blur-2xl"
            aria-hidden
          />

          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="space-y-3 lg:col-span-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
                Workspace
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {greeting}
                <span className="font-normal text-muted-foreground"> — </span>
                <span className="text-foreground">{companyName}</span>
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Hier zie je cijfers, laatste berichten en wat er op de planning staat. Start bij{" "}
                <Link
                  href="/dashboard/inbox"
                  className="font-medium text-foreground underline decoration-primary/35 underline-offset-2 hover:decoration-primary"
                >
                  Chat
                </Link>{" "}
                of werk je pijplijn bij via{" "}
                <Link
                  href="/dashboard/leads"
                  className="font-medium text-foreground underline decoration-primary/35 underline-offset-2 hover:decoration-primary"
                >
                  Klanten
                </Link>
                .
              </p>
              <p className="text-xs font-medium capitalize text-muted-foreground/90">{today}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:col-span-7 lg:grid-cols-4">
              <StatLink href="/dashboard/leads" label="Klanten" value={snapshot.leadCount} />
              <StatLink
                href="/dashboard/inbox"
                label="Gesprekken"
                value={snapshot.conversationCount}
              />
              <StatLink href="/dashboard/quotes" label="Offertes" value={snapshot.quoteCount} />
              <StatLink
                href="/dashboard/inbox"
                label="Meldingen"
                value={snapshot.unreadNotifications}
                pulse={snapshot.unreadNotifications > 0}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-6 lg:col-span-7">
            <div>
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Activiteit
              </p>
              <DashboardInboxPanel messages={snapshot.recentMessages} />
            </div>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div>
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
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

            <div>
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Snel naar
              </p>
              <div className="grid gap-2.5 rounded-2xl border border-border/50 bg-muted/[0.08] p-3 dark:border-white/[0.08] dark:bg-white/[0.02]">
                <QuickLink
                  href="/dashboard/ai-koppelingen"
                  title="AI & koppelingen"
                  hint="Kennis, WhatsApp, widget, e-mail"
                  icon={Sparkles}
                />
                <QuickLink
                  href="/dashboard/ai-knowledge"
                  title="AI-kennis"
                  hint="Website en vrije tekst"
                  icon={BookMarked}
                />
                <QuickLink
                  href="/dashboard/leads"
                  title="Klanten"
                  hint="Pipeline en opvolging"
                  icon={Users}
                />
                <QuickLink
                  href="/dashboard/pipeline"
                  title="Pipeline"
                  hint="Fases en prioriteit"
                  icon={Kanban}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Kernflows
          </p>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <HubCard
              href="/dashboard/inbox"
              title="Chat"
              description="Alle gesprekken — WhatsApp, e-mail en widget in één inbox."
              icon={MessageCircle}
            />
            <HubCard
              href="/dashboard/quotes"
              title="Offertes"
              description="Concepten en verzonden voorstellen — opvolgen en converteren."
              icon={FileText}
            />
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
            href="/dashboard/ai-koppelingen"
            className="font-medium text-foreground/80 underline decoration-border/70 underline-offset-4 transition hover:text-foreground hover:decoration-primary/50"
          >
            AI-hub
          </Link>
          <span className="hidden text-muted-foreground/50 sm:inline" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bell className="size-3.5 opacity-70" aria-hidden />
            Meldingen volg je in de rechterbalk of via Chat
          </span>
        </div>
      </DashboardWorkSurface>
    </PageFrame>
  );
}
