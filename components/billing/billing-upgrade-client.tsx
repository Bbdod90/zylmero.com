"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { BillingPlanId } from "@/lib/types";
import { BILLING_PLANS } from "@/lib/billing/plans";

export function BillingUpgradeClient({
  planId,
  planLabel,
}: {
  planId: Exclude<BillingPlanId, "trial">;
  planLabel: string;
}) {
  const [pending, setPending] = useState(false);
  const plan = BILLING_PLANS.find((p) => p.id === planId);

  return (
    <div className="mt-6 grid gap-2">
      <p className="text-center text-xs font-medium text-primary">
        Gekozen: {planLabel} · €{plan?.priceEur ?? "—"}/mnd
      </p>
      <p className="text-center text-[11px] text-muted-foreground">
        Eén extra klus deze maand betaalt dit meestal — veel werkplaatsen zien
        +2–5 klussen per week door snellere antwoorden.
      </p>
      <Button
        type="button"
        className="w-full rounded-xl py-6 text-base font-semibold"
        disabled={pending}
        onClick={() => {
          setPending(true);
          void (async () => {
            try {
              const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
              });
              const data = (await res.json()) as { url?: string; error?: string };
              if (!res.ok || !data.url) {
                toast.error(data.error || "Checkout kon niet starten");
                return;
              }
              window.location.href = data.url;
            } catch {
              toast.error("Netwerkfout");
            } finally {
              setPending(false);
            }
          })();
        }}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          `Nu upgraden · ${planLabel}`
        )}
      </Button>
    </div>
  );
}
