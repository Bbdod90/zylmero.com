"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Sparkles } from "lucide-react";
import { runAiSetupAction, type AiSetupState } from "@/actions/ai-setup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="h-14 w-full rounded-2xl text-base font-bold shadow-lg shadow-primary/25"
      disabled={pending}
    >
      {pending ? "AI wordt klaargezet…" : "Genereer mijn AI-profiel"}
    </Button>
  );
}

const initial: AiSetupState = {};

export function AiSetupClient({ companyName }: { companyName: string }) {
  const [state, action] = useFormState(runAiSetupAction, initial);

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card className="rounded-[1.35rem] border-primary/15 bg-card/80 shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Sparkles className="size-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Je AI wordt klaargezet
          </CardTitle>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Voor <span className="font-semibold text-foreground">{companyName}</span>{" "}
            maken we een dienstenoverzicht, FAQ, antwoordstijl, prijsindicaties en
            eerste automatiseringen — gebaseerd op je branche.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="mb-8 space-y-2 text-sm text-muted-foreground">
            {[
              "Diensten & FAQ op maat",
              "Toon en antwoordstijl",
              "3 opvolg-automatiseringen",
            ].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                {x}
              </li>
            ))}
          </ul>
          <form action={action} className="space-y-4">
            {state.error ? (
              <p className="text-sm text-destructive">{state.error}</p>
            ) : null}
            <Submit />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
