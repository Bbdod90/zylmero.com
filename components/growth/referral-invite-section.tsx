"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Gift } from "lucide-react";
import { ensureReferralCodeAction } from "@/actions/referrals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/growth/copy-button";

export function ReferralInviteSection({
  siteUrl,
  initialCode,
  referralCount,
  creditPerReferralEur,
}: {
  siteUrl: string;
  initialCode: string | null;
  referralCount: number;
  creditPerReferralEur: number;
}) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);

  async function ensure() {
    const res = await ensureReferralCodeAction();
    if (res.ok && res.code) {
      setCode(res.code);
      toast.success("Uitnodigingslink klaar");
      router.refresh();
    } else if (res.error) {
      toast.error(res.error);
    }
  }

  const base = siteUrl.replace(/\/$/, "");
  const link = code ? `${base}/signup?ref=${encodeURIComponent(code)}` : "";

  return (
    <Card className="cf-dashboard-panel overflow-hidden rounded-2xl border-primary/22 bg-gradient-to-br from-primary/[0.07] via-card to-card dark:from-primary/[0.1] dark:via-card dark:to-[hsl(222_26%_6%)]">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/40 pb-5 sm:p-8 sm:pb-5 dark:border-white/[0.06]">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/15">
          <Gift className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Referrals
          </p>
          <CardTitle className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Nodig andere ondernemers uit
          </CardTitle>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Deel je unieke link. Per nieuwe klant die via jou start, tellen we{" "}
            <span className="font-semibold text-foreground">
              €{creditPerReferralEur} tegoed
            </span>{" "}
            (intern bijgehouden — uitbetaling volgt via facturatie).
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 sm:px-8 sm:pb-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-lg border border-border/55 bg-muted/25 px-3 py-1.5 text-xs font-semibold tabular-nums text-foreground shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
            {referralCount} doorverwijzing(en)
          </span>
        </div>
        {!code ? (
          <Button
            type="button"
            variant="secondary"
            className="h-11 rounded-lg px-6 text-sm font-semibold shadow-sm"
            onClick={() => void ensure()}
          >
            Maak mijn link
          </Button>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <Input
              readOnly
              value={link}
              className="h-11 rounded-lg border-border/70 bg-background/60 font-mono text-xs shadow-inner-soft sm:flex-1 sm:text-sm"
            />
            <CopyButton text={link} label="Kopieer link" />
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Tip: combineer met{" "}
          <Link href="/dashboard" className="font-medium text-primary hover:underline">
            je dashboard
          </Link>{" "}
          om snelheid te laten zien.
        </p>
      </CardContent>
    </Card>
  );
}
