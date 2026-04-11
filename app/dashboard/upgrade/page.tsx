import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { getAuth } from "@/lib/auth";
import { hasSubscriptionAccess, isDemoCompanyId } from "@/lib/billing/trial";
import { BILLING_PLANS } from "@/lib/billing/plans";
import type { BillingPlanId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { BillingUpgradeClient } from "@/components/billing/billing-upgrade-client";
import { PAYWALL_AI_LEADS } from "@/lib/billing/paywall";
import { BRAND_CONTACT_EMAIL, BRAND_NAME } from "@/lib/brand";

export default async function UpgradePage() {
  const auth = await getAuth();
  if (!auth.user) {
    redirect("/login");
  }
  if (!auth.company) {
    redirect("/dashboard/onboarding");
  }
  if (isDemoCompanyId(auth.company.id)) {
    redirect("/dashboard");
  }

  const expired = !hasSubscriptionAccess(auth.company);

  if (hasSubscriptionAccess(auth.company) && auth.company.plan !== "trial") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-secondary/20 px-safe py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {BRAND_NAME}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          {expired
            ? PAYWALL_AI_LEADS
            : "Upgrade om elke lead vast te houden"}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {expired
            ? "AI en nieuwe leads zijn geblokkeerd. Mis geen klanten meer — één extra klus verdient zichzelf terug."
            : "Kies een abonnement wanneer je klaar bent. Betaling verloopt via Stripe — je wordt doorgestuurd om veilig af te rekenen."}
        </p>
        {expired ? (
          <Button
            asChild
            size="lg"
            className="mt-8 rounded-2xl px-10 py-7 text-lg font-semibold shadow-lg"
          >
            <a href="#plans">Nu upgraden</a>
          </Button>
        ) : null}
      </div>

      <div id="plans" className="mx-auto mt-10 max-w-5xl scroll-mt-24">
        <div className="mb-6 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
          Gebruikt door servicebedrijven · snellere reactie levert vaker een geboekte klant
        </div>

        <div className="mb-8 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Wat je verliest als je stopt</p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {[
              "Automatische antwoorden terwijl jij bij klanten bent",
              "Lead-scoring en zicht op pipelinewaarde",
              "Offertekladen en opvolgingsduwtjes",
              "Eén berichtenoverzicht voor WhatsApp-achtige gesprekken",
            ].map((x) => (
              <li key={x} className="flex gap-2">
                <span className="text-destructive">×</span>
                {x}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {BILLING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                plan.popular
                  ? "border-primary/50 bg-primary/5 shadow-lg"
                  : "border-border/70 bg-card/40"
              }`}
            >
              {plan.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Meest gekozen
                </span>
              ) : null}
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.description}
              </p>
              <p className="mt-6">
                <span className="text-3xl font-semibold tabular-nums">
                  €{plan.priceEur}
                </span>
                <span className="text-muted-foreground">/mnd</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {plan.leadCapLabel}
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <BillingUpgradeClient
                planId={plan.id as Exclude<BillingPlanId, "trial">}
                planLabel={plan.name}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {!expired ? (
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/dashboard">Terug naar dashboard</Link>
            </Button>
          ) : (
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/">Terug naar home</Link>
            </Button>
          )}
          <Button variant="ghost" asChild className="rounded-xl">
            <a href={`mailto:${BRAND_CONTACT_EMAIL}`}>Contact verkoop</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
