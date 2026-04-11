import Link from "next/link";
import type { Company } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/brand";

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
    <div className="cf-dashboard-panel space-y-6 p-6 sm:p-8">
      <div>
        <p className="text-sm font-medium">Huidig abonnement</p>
        <p className="mt-1 text-2xl font-semibold capitalize">
          {planLabel[company.plan] ?? company.plan}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Abonnement: {company.subscription_status ?? "—"} · Verlenging / einde periode:{" "}
          {period}
        </p>
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm">
        <p className="font-medium">Leads deze maand</p>
        <p className="mt-1 tabular-nums text-lg">
          {leadsThisMonth} / {cap === 1_000_000 ? "∞" : cap}
        </p>
      </div>
      {company.subscription_status === "past_due" ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium text-amber-950 dark:text-amber-100">
            Betaling mislukt
          </p>
          <p className="mt-1 text-muted-foreground">
            Als je stopt, verlies je automatisering, WhatsApp-routing en
            geprioriteerde antwoorden. Werk je betaalpas bij in het Stripe
            factuurportaal (link per e-mail van Stripe) of kies hieronder een nieuw
            abonnement.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Voordat je opzegt</p>
          <p className="mt-1">
            Als je stopt, verlies je automatisering en leads die {BRAND_NAME} voor je
            opving terwijl jij met je werk bezig was.
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button asChild className="rounded-xl">
          <Link href="/dashboard/upgrade">Abonnement wijzigen</Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Stripe-klant: {company.stripe_customer_id ?? "—"} · Abonnement:{" "}
        {company.stripe_subscription_id ?? "—"}
      </p>
    </div>
  );
}
