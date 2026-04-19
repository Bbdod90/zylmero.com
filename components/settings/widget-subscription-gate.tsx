"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Als er geen actief abonnement / proefperiode is: widget mag niet live (API blokkeert leads).
 */
export function WidgetSubscriptionGate({
  trialExpiredHint,
}: {
  /** Bij verlopen proef: extra zinnetje */
  trialExpiredHint?: boolean;
}) {
  return (
    <div className="cf-dashboard-panel rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.1] text-primary ring-1 ring-primary/15">
          <CreditCard className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Website-chat live zetten</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Je chatbot vul je met kennis onder <strong className="text-foreground">Kennis</strong> en je profiel onder{" "}
              <strong className="text-foreground">Bedrijf</strong>. Om het chatvenster op je eigen site te laten werken
              (bezoekers bericht laten sturen naar jouw inbox), hoort een{" "}
              <strong className="text-foreground">actieve proefperiode of betaald abonnement</strong>.
            </p>
            {trialExpiredHint ? (
              <p className="mt-3 text-sm font-medium text-amber-600 dark:text-amber-400">
                Je proefperiode is voorbij — activeer een plan om de widget weer aan te zetten.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="rounded-xl font-semibold">
              <Link href="/dashboard/upgrade">Plannen bekijken & activeren</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/dashboard/settings?tab=billing">Facturatie</Link>
            </Button>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Zonder actief abonnement worden berichten via de widget niet verwerkt — zo voorkom je dat je site bezoekers
            een lege belofte toont.
          </p>
        </div>
      </div>
    </div>
  );
}
