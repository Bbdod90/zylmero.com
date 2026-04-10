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
    <Card className="rounded-[1.35rem] border-primary/20 bg-gradient-to-br from-primary/[0.07] to-transparent">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Gift className="size-5" />
        </div>
        <div>
          <CardTitle className="text-lg font-bold tracking-tight">
            Nodig andere garages uit
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Deel je unieke link. Per nieuwe klant die via jou start, tellen we{" "}
            <span className="font-semibold text-foreground">
              €{creditPerReferralEur} tegoed
            </span>{" "}
            (intern bijgehouden — uitbetaling volgt via facturatie).
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full border border-white/[0.08] bg-card/40 px-3 py-1 font-semibold tabular-nums">
            {referralCount} doorverwijzing(en)
          </span>
        </div>
        {!code ? (
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl font-bold"
            onClick={() => void ensure()}
          >
            Maak mijn link
          </Button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              readOnly
              value={link}
              className="font-mono text-xs sm:text-sm"
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
