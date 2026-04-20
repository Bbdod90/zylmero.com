import Link from "next/link";
import type { Company } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/brand";
import { CreditCard, Gauge } from "lucide-react";

const planLabel: Record<string, string> = {
  trial: "Proefperiode",
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
};

export function BillingSettings({
  company,
  leadsThisMonth,
  leadCap,
}: {
  company: Company;
  leadsThisMonth: number;
  leadCap: number;
}) {
  const cap = leadCap;
  const period = company.current_period_end
    ? new Date(company.current_period_end).toLocaleDateString("nl-NL")
    : "—";

  return (
    <div className="cf-dashboard-panel space-y-8 p-6 sm:p-8 lg:p-9">
      <header className="flex gap-4 border-b border-border/50 pb-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <CreditCard className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Facturatie</h2>
          <p className="text-sm text-muted-foreground">
            Abonnement, gebruik en Stripe-gegevens. Wijzig je plan wanneer je klaar bent om op te schalen.
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-muted/[0.08] p-5 dark:border-white/[0.08]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Huidig abonnement</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {planLabel[company.plan] ?? company.plan}
          </p>
          <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between gap-4 border-t border-border/40 pt-3 dark:border-white/[0.06]">
              <dt>Status</dt>
              <dd className="font-medium text-foreground">{company.subscription_status ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Verlenging / einde</dt>
              <dd className="font-medium tabular-nums text-foreground">{period}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-muted/[0.08] p-5 dark:border-white/[0.08]">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-border/50 dark:bg-card">
              <Gauge className="size-4" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Leads deze maand</p>
              <p className="mt-1 text-xs text-muted-foreground">Reset per factuurperiode volgens je plan.</p>
            </div>
          </div>
          <p className="mt-6 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {leadsThisMonth}
            <span className="text-lg font-medium text-muted-foreground">
              {" "}
              / {cap === 1_000_000 ? "∞" : cap}
            </span>
          </p>
        </div>
      </div>

      {company.subscription_status === "past_due" ? (
        <div className="rounded-lg border border-amber-500/35 bg-amber-500/[0.08] p-5 text-sm dark:border-amber-500/30">
          <p className="font-semibold text-amber-950 dark:text-amber-100">Betaling mislukt</p>
          <p className="mt-2 leading-relaxed text-amber-950/85 dark:text-amber-50/90">
            Automatisering en routing kunnen worden beperkt. Werk je betaalmethode bij via Stripe (link in je mail) of
            kies hieronder een nieuw abonnement.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/60 bg-muted/15 p-5 text-sm leading-relaxed text-muted-foreground dark:border-white/[0.08]">
          <p className="font-semibold text-foreground">Voordat je opzegt</p>
          <p className="mt-2">
            Zonder actief abonnement verlies je automatisering en leads die {BRAND_NAME} voor je opvangt terwijl jij aan
            het werk bent.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-border/40 pt-6">
        <Button asChild className="rounded-lg px-6 font-semibold shadow-sm">
          <Link href="/dashboard/upgrade">Abonnement wijzigen</Link>
        </Button>
      </div>

      <p className="text-[0.6875rem] leading-relaxed text-muted-foreground">
        Stripe-klant:{" "}
        <span className="font-mono text-foreground/80">{company.stripe_customer_id ?? "—"}</span> · Abonnement:{" "}
        <span className="font-mono text-foreground/80">{company.stripe_subscription_id ?? "—"}</span>
      </p>
    </div>
  );
}
