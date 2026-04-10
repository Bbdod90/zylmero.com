"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { completeValueMomentAction } from "@/actions/value-moment";
import { Sparkles } from "lucide-react";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="h-14 w-full rounded-xl text-base font-bold shadow-lg shadow-primary/25"
      disabled={pending}
    >
      {pending ? "Openen…" : "Naar dashboard"}
    </Button>
  );
}

const DEMO_INBOUND = "Ik heb morgen iemand nodig voor een klus";
const DEMO_REPLY = "Top, we kunnen helpen. Komt 10:00 of 14:30 uit?";

export function ValueMomentClient() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 600);
      return () => clearTimeout(t);
    }
    if (step === 1) {
      const t = setTimeout(() => setStep(2), 900);
      return () => clearTimeout(t);
    }
    if (step === 2) {
      const t = setTimeout(() => setStep(3), 1100);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-10">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">CloserFlow</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Dit is je eerste omzetmoment</h1>
        <p className="mt-3 text-muted-foreground">Zo reageert CloserFlow — snel, kort, richting afspraak.</p>
      </div>

      <Card className="overflow-hidden rounded-2xl border-primary/20 bg-card/80 shadow-lg">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            Inkomend bericht
          </div>
          <div
            className={`rounded-xl bg-muted/50 p-4 text-sm transition-opacity duration-500 ${
              step >= 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            {step >= 1 ? DEMO_INBOUND : "\u00a0"}
          </div>
          <div
            className={`rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm transition-opacity duration-500 ${
              step >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            {step >= 2 ? (
              <>
                <span className="text-[10px] font-semibold uppercase text-primary">Antwoord</span>
                <p className="mt-2 text-foreground">{DEMO_REPLY}</p>
              </>
            ) : (
              "\u00a0"
            )}
          </div>
          <div
            className={`flex flex-wrap items-center gap-2 transition-opacity duration-500 ${
              step >= 3 ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-2xs font-bold uppercase tracking-wide text-primary">
              Afspraak voorgesteld
            </span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-2xs font-bold uppercase tracking-wide text-amber-200">
              Potentiële waarde €240–€420
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <form action={completeValueMomentAction}>
          <Submit />
        </form>
        <Button variant="outline" asChild className="h-12 w-full rounded-xl border-2 border-primary/30 text-base font-bold">
          <Link href="/dashboard/upgrade">Upgrade — blijf verzilveren</Link>
        </Button>
      </div>
    </div>
  );
}
