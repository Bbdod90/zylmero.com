"use client";

import Link from "next/link";
import {
  AnimatedCurrency,
  AnimatedDecimal,
  AnimatedInteger,
} from "@/components/motion/animated-number";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaleReplyPulse } from "@/components/dashboard/stale-reply-pulse";
import { cn } from "@/lib/utils";

function KpiCard({
  label,
  children,
  hint,
  emphasize,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  emphasize?: boolean;
}) {
  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-2xl border-border/50 bg-gradient-to-b from-card to-card/90 shadow-[0_1px_0_0_hsl(220_16%_18%/0.25)] transition-all duration-200 hover:border-primary/25 hover:shadow-md dark:from-card dark:to-[hsl(222_26%_5.5%)] dark:shadow-[0_1px_0_0_hsl(220_16%_18%/0.4)]",
        emphasize && "border-primary/20 ring-1 ring-primary/10",
      )}
    >
      <CardHeader className="space-y-2 pb-3 pt-5 sm:pt-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <div
          className={cn(
            "font-bold tabular-nums tracking-tight text-foreground",
            emphasize ? "text-3xl sm:text-[2.15rem]" : "text-2xl sm:text-[1.8rem]",
          )}
        >
          {children}
        </div>
        {hint ? (
          <p className="text-2xs leading-relaxed text-muted-foreground">{hint}</p>
        ) : null}
      </CardHeader>
    </Card>
  );
}

export type DashboardInteractiveProps = {
  leadsCaptured: number;
  leadsThisWeek: number;
  missedRevenueTotal: number;
  conversionPct: number;
  avgResponseHours: number | null;
  leadsLostCount: number;
  dealsWonCount: number;
  countNew: number;
  countActive: number;
  countQuoteSent: number;
  upcomingAppts: number;
  hotLeadCount: number;
  potentialMonthlyRevenue: number;
  staleCount: number;
  firstStaleLeadId: string | null;
  wonRevenueEur: number;
  missedReplyRevenueEstimate: number;
  lostRevenueEstimate: number;
  acceptedQuotes: number;
  demo: boolean;
  staleLeadNames: { id: string; name: string; value: string }[];
};

export function DashboardInteractive(props: DashboardInteractiveProps) {
  return (
    <>
      <StaleReplyPulse
        count={props.staleCount}
        firstLeadId={props.firstStaleLeadId}
      />

      <div className="cf-dashboard-panel rounded-2xl p-6 md:p-8 lg:p-10">
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between md:gap-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Jouw omzet in één oogopslag
          </p>
          <p className="text-xs text-muted-foreground">
            Verwachte omzet · gemiste omzet · leads per week
          </p>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
          <div className="text-center md:text-left">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Verwachte omzet
            </p>
            <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-primary md:text-5xl">
              <AnimatedCurrency value={props.potentialMonthlyRevenue} />
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Pijplijn en tempo (schatting)
            </p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Gemiste omzet
            </p>
            <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-destructive md:text-5xl">
              <AnimatedCurrency value={props.missedRevenueTotal} />
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Trage antwoorden + verloren kansen
            </p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Leads per week
            </p>
            <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-foreground md:text-5xl">
              <AnimatedInteger value={props.leadsThisWeek} />
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Laatste 7 dagen binnengekomen
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Conversie"
          hint="Gewonnen t.o.v. afgeronde kansen"
          emphasize
        >
          <AnimatedInteger value={props.conversionPct} />%
        </KpiCard>
        <KpiCard
          label="Gem. reactietijd"
          hint="Na het laatste klantbericht"
        >
          {props.avgResponseHours != null ? (
            <>
              <AnimatedDecimal value={props.avgResponseHours} decimals={1} /> u
            </>
          ) : (
            "—"
          )}
        </KpiCard>
        <KpiCard label="Verloren leads" hint="In deze periode">
          <AnimatedInteger value={props.leadsLostCount} />
        </KpiCard>
        <KpiCard label="Gewonnen deals" hint="Succesvol afgesloten">
          <AnimatedInteger value={props.dealsWonCount} />
        </KpiCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Nieuwe leads" hint="Nog niet gekwalificeerd">
          <AnimatedInteger value={props.countNew} />
        </KpiCard>
        <KpiCard label="Actieve leads" hint="In gesprek">
          <AnimatedInteger value={props.countActive} />
        </KpiCard>
        <KpiCard label="Offertes verstuurd" hint="Wacht op beslissing">
          <AnimatedInteger value={props.countQuoteSent} />
        </KpiCard>
        <KpiCard label="Geplande afspraken" hint="Vanaf nu">
          <AnimatedInteger value={props.upcomingAppts} />
        </KpiCard>
        <KpiCard label="Hoge prioriteit" hint="Leads met hoge score">
          <span className="cf-hot-glow inline-flex rounded-md px-1.5 py-0.5 tabular-nums">
            <AnimatedInteger value={props.hotLeadCount} />
          </span>
        </KpiCard>
        <KpiCard label="Totaal leads" hint="In je workspace" emphasize>
          <AnimatedInteger value={props.leadsCaptured} />
        </KpiCard>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/50 bg-gradient-to-b from-card to-card/90 transition-colors hover:border-primary/25 dark:to-[hsl(222_26%_5.5%)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold tracking-tight">
              Waarde die CloserFlow hielp sluiten
            </CardTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Geaccepteerde offertes (EUR) — ruimte die je ontgrendelt met snelheid.
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tabular-nums tracking-tight text-primary sm:text-5xl">
              <AnimatedCurrency value={props.wonRevenueEur} />
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {props.acceptedQuotes} geaccepteerde offerte
              {props.acceptedQuotes === 1 ? "" : "s"}
              {props.demo ? " in deze demo" : ""} · tijdlijn in activiteitenfeed
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Zonder actief gebruik verlies je zicht op opvolging en automatisering.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-gradient-to-b from-card to-card/90 transition-colors hover:border-destructive/20 dark:to-[hsl(222_26%_5.5%)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold tracking-tight">
              Gemiste omzet (trage antwoorden)
            </CardTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Klanten wachten {">"}4 u op een antwoord van het team.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-4xl font-bold tabular-nums tracking-tight text-destructive sm:text-5xl">
              <AnimatedCurrency value={props.missedReplyRevenueEstimate} />
            </p>
            {props.staleLeadNames.length ? (
              <ul className="text-sm text-muted-foreground">
                {props.staleLeadNames.slice(0, 4).map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/dashboard/leads/${l.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {l.name}
                    </Link>
                    {" — "}
                    {l.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Geen achterstallige antwoorden op dit moment.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-gradient-to-b from-card to-card/90 transition-colors dark:to-[hsl(222_26%_5.5%)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold tracking-tight">
              Omzet verloren (verloren leads)
            </CardTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Geschatte waarde op leads gemarkeerd als verloren.
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tabular-nums tracking-tight sm:text-5xl">
              <AnimatedCurrency value={props.lostRevenueEstimate} />
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
