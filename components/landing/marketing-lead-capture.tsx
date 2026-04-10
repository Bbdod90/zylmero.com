"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import {
  submitMarketingLeadAction,
  type MarketingLeadState,
} from "@/actions/marketing-leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enterAnonymousDemo } from "@/actions/demo";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="h-14 w-full rounded-2xl text-base font-bold shadow-lg shadow-primary/25"
      disabled={pending}
    >
      {pending ? "Versturen…" : "Bereken je gemiste omzet"}
    </Button>
  );
}

const initial: MarketingLeadState = {};

export function MarketingLeadCapture() {
  const [state, action] = useFormState(submitMarketingLeadAction, initial);

  if (state.ok) {
    return (
      <div className="rounded-[1.35rem] border border-primary/25 bg-primary/[0.08] p-8 text-center">
        <p className="text-lg font-bold text-foreground">Bedankt!</p>
        <p className="mt-2 text-sm text-muted-foreground">
          We nemen contact met je op — check ook je e-mail voor tips om geen aanvragen meer te missen.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="h-12 rounded-2xl font-bold">
            <Link href="/signup">Start — pak je eerste klant</Link>
          </Button>
          <form action={enterAnonymousDemo}>
            <Button
              type="submit"
              variant="outline"
              className="h-12 w-full rounded-2xl border-2 font-bold sm:w-auto"
            >
              Zie hoe het werkt
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.35rem] border border-white/[0.08] bg-gradient-to-b from-card to-secondary/[0.03] p-6 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.35)] sm:p-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Gratis check
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Ontdek hoeveel klanten je mist
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Laat je gegevens achter — we sturen je een eerlijke inschatting en geen spam.
        </p>
      </div>
      <form action={action} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ml-name">Naam</Label>
            <Input
              id="ml-name"
              name="full_name"
              required
              className="h-12 rounded-xl"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ml-co">Bedrijf</Label>
            <Input
              id="ml-co"
              name="company_name"
              required
              className="h-12 rounded-xl"
              autoComplete="organization"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ml-em">E-mail</Label>
            <Input
              id="ml-em"
              name="email"
              type="email"
              className="h-12 rounded-xl"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ml-ph">Telefoon</Label>
            <Input
              id="ml-ph"
              name="phone"
              type="tel"
              className="h-12 rounded-xl"
              autoComplete="tel"
            />
          </div>
        </div>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        <Submit />
        <p className="text-center text-xs text-muted-foreground">
          Door te versturen ga je akkoord met contact over CloserFlow. Geen nieuwsbrief zonder
          toestemming.
        </p>
      </form>
    </div>
  );
}
