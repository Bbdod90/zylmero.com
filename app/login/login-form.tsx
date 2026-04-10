"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signInAction, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full rounded-xl font-semibold" disabled={pending}>
      {pending ? "Bezig met inloggen…" : "Inloggen"}
    </Button>
  );
}

const initial: AuthFormState = {};

export function LoginForm({ reason }: { reason?: string }) {
  const [state, formAction] = useFormState(signInAction, initial);

  const reasonHint =
    reason === "auth"
      ? "Link verlopen of ongeldig. Probeer opnieuw in te loggen of vraag een nieuwe bevestigingsmail aan."
      : reason === "config"
        ? "De app is nog niet goed geconfigureerd. Neem contact op met support."
        : null;

  return (
    <form action={formAction} className="space-y-5">
      {reasonHint ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{reasonHint}</p>
      ) : null}
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
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Wachtwoord</Label>
          <Link
            href="/login/wachtwoord"
            className="text-xs font-medium text-primary hover:underline"
          >
            Wachtwoord vergeten?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
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
