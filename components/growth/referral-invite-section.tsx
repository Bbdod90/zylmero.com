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
    <Card className="cf-dashboard-panel rounded-[1.35rem] border-primary/25 bg-gradient-to-br from-primary/[0.08] via-card to-card/90 dark:from-primary/[0.1] dark:via-card dark:to-[hsl(222_26%_6%)]">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 sm:p-8 sm:pb-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/8 text-primary shadow-inner-soft ring-1 ring-primary/15">
          <Gift className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="cf-eyebrow text-[0.625rem]">Referrals</p>
          <CardTitle className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Nodig andere garages uit
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
          <span className="rounded-full border border-border/60 bg-muted/30 px-3.5 py-1.5 text-xs font-semibold tabular-nums text-foreground shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
            {referralCount} doorverwijzing(en)
          </span>
        </div>
        {!code ? (
          <Button
            type="button"
            variant="secondary"
            className="h-11 rounded-xl px-6 text-sm font-bold shadow-sm"
            onClick={() => void ensure()}
          >
            Maak mijn link
          </Button>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <Input
              readOnly
              value={link}
              className="h-11 rounded-xl border-border/70 bg-background/50 font-mono text-xs shadow-inner-soft sm:flex-1 sm:text-sm"
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
