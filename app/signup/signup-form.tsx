"use client";

import { useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { signUpAction, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full rounded-xl" disabled={pending}>
      {pending ? "Bezig…" : "Start gratis proefperiode"}
    </Button>
  );
}

const initial: AuthFormState = {};

export function SignupForm() {
  const searchParams = useSearchParams();
  const referral = searchParams.get("ref")?.trim().toUpperCase().slice(0, 12) ?? "";
  const [state, formAction] = useFormState(signUpAction, initial);
  if (state.success) {
    return (
      <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-5 text-sm">
        <p className="font-medium leading-relaxed text-foreground">
          Check je e-mail om je account te bevestigen.
        </p>
        <p className="text-muted-foreground">Geen mail ontvangen? Controleer je spam.</p>
      </div>
    );
  }
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="referral_code" value={referral} />
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Wachtwoord (min. 8 tekens)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="rounded-xl"
        />
        {state.error ? (
          <p className="pt-1 text-sm text-red-600 dark:text-red-400/90">{state.error}</p>
        ) : null}
      </div>
      <Submit />
    </form>
  );
}
