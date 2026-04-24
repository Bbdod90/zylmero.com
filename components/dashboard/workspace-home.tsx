import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  MessageCircle,
  Settings2,
} from "lucide-react";
import { PageFrame } from "@/components/layout/page-frame";
import { cn } from "@/lib/utils";
import type { WorkspaceHomeSnapshot } from "@/lib/queries/workspace-home-snapshot";

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
        "group relative flex flex-col gap-5 overflow-hidden rounded-2xl border p-6 sm:p-8",
        "border-slate-200/80 bg-white/60 shadow-[0_24px_70px_-40px_rgb(15_23_42/0.35)] backdrop-blur-md",
        "transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/90 hover:shadow-[0_28px_80px_-38px_rgb(15_23_42/0.45)]",
        "dark:border-white/[0.1] dark:bg-[hsl(222_28%_11%/0.72)] dark:shadow-[0_28px_80px_-40px_rgb(0_0_0/0.65),inset_0_1px_0_0_rgb(255_255_255/0.05)]",
        "dark:hover:border-white/[0.16] dark:hover:bg-[hsl(222_28%_12%/0.85)]",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          "bg-[radial-gradient(ellipse_90%_70%_at_80%_-10%,rgba(99,102,241,0.12),transparent_55%)]",
          "dark:bg-[radial-gradient(ellipse_90%_70%_at_80%_-10%,rgba(99,102,241,0.2),transparent_55%)]",
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl border text-slate-700",
            "border-slate-200/90 bg-gradient-to-br from-white to-slate-50 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.9)] ring-1 ring-black/[0.04]",
            "dark:border-white/[0.12] dark:from-white/[0.12] dark:to-white/[0.04] dark:text-white dark:ring-white/[0.06]",
          )}
        >
          <Icon className="size-6" strokeWidth={1.65} aria-hidden />
        </span>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full border text-slate-500 transition-all",
            "border-slate-200/85 bg-white/90 shadow-sm",
            "group-hover:border-slate-300 group-hover:text-slate-900 group-hover:shadow-md",
            "dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-white/55 dark:group-hover:border-white/[0.18] dark:group-hover:text-white",
          )}
          aria-hidden
        >
          <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="relative space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-slate-600 dark:text-white/62">
          {description}
        </p>
      </div>
    </Link>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border px-4 py-4 sm:px-5 sm:py-5",
        "border-border/55 bg-card/70 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)] backdrop-blur-sm",
        "dark:border-white/[0.09] dark:bg-[hsl(222_28%_10%/0.75)] dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.04)]",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent dark:via-primary/35"
        aria-hidden
      />
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
        {value}
      </p>
    </div>
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

  return (
    <PageFrame
      title={companyName}
      subtitle="Berichten en offertes — rustig overzicht, zonder ruis."
    >
      <div className="mx-auto w-full max-w-[960px] space-y-8 sm:space-y-10">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border px-5 py-6 sm:px-8 sm:py-7",
            "border-border/50 bg-gradient-to-br from-card/90 via-card/70 to-muted/20",
            "dark:border-white/[0.1] dark:from-[hsl(222_30%_12%/0.95)] dark:via-[hsl(222_28%_10%/0.9)] dark:to-[hsl(230_30%_8%/0.92)]",
            "shadow-[0_24px_80px_-48px_rgb(0_0_0/0.55)] dark:shadow-[0_32px_90px_-48px_rgb(0_0_0/0.75)]",
          )}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-primary/[0.12] blur-3xl dark:bg-primary/[0.18]"
            aria-hidden
          />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Workspace
              </p>
              <p className="mt-1.5 text-lg font-medium tracking-tight text-foreground sm:text-xl">
                Welkom terug
              </p>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Hier zie je in één oogopslag wat er speelt. Gebruik Chat voor
                antwoorden en Offertes om prijzen strak af te handelen.
              </p>
            </div>
            <p className="shrink-0 text-sm font-medium capitalize text-muted-foreground sm:text-right">
              {today}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Overzicht
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <StatTile label="Leads" value={snapshot.leadCount} />
            <StatTile label="Gesprekken" value={snapshot.conversationCount} />
            <StatTile label="Offertes" value={snapshot.quoteCount} />
            <StatTile
              label="Meldingen"
              value={snapshot.unreadNotifications}
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Snel naar
          </p>
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            <HubCard
              href="/dashboard/inbox"
              title="Chat"
              description="Alle gesprekken met leads en klanten — WhatsApp, e-mail en widget."
              icon={MessageCircle}
            />
            <HubCard
              href="/dashboard/quotes"
              title="Offertes"
              description="Concepten en verzonden offertes bekijken en opvolgen."
              icon={FileText}
            />
          </div>
        </div>

        <Link
          href="/dashboard/settings"
          className={cn(
            "group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border px-5 py-5 sm:px-7 sm:py-6",
            "border-border/50 bg-muted/25 transition-all duration-300 hover:border-primary/25 hover:bg-primary/[0.06]",
            "dark:border-white/[0.1] dark:bg-white/[0.03] dark:hover:border-primary/30 dark:hover:bg-primary/[0.08]",
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(ellipse 80% 80% at 0% 50%, hsl(var(--primary) / 0.1), transparent 55%)",
            }}
          />
          <div className="relative flex min-w-0 items-center gap-4">
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                "border-border/60 bg-background/80 text-foreground shadow-sm",
                "dark:border-white/[0.1] dark:bg-white/[0.06]",
              )}
            >
              <Settings2 className="size-5" strokeWidth={1.65} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                Instellingen & kanalen
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Bedrijfsprofiel, AI-kennis, WhatsApp, widget en facturatie.
              </p>
            </div>
          </div>
          <ArrowUpRight
            className="relative size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
            aria-hidden
          />
        </Link>
      </div>
    </PageFrame>
  );
}
