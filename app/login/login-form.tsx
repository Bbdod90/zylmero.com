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

export function LoginForm({
  reason,
  notice,
  detail,
}: {
  reason?: string;
  notice?: string;
  detail?: string;
}) {
  const [state, formAction] = useFormState(signInAction, initial);

  const reasonHint =
    reason === "auth"
      ? `Link verlopen of ongeldig. Probeer opnieuw in te loggen of vraag een nieuwe bevestigingsmail aan.${detail ? ` (${detail})` : ""}`
      : reason === "config"
        ? "De app is nog niet goed geconfigureerd. Neem contact op met support."
        : null;

  const noticeOk =
    notice === "wachtwoord-gewijzigd"
      ? "Je wachtwoord is gewijzigd. Log nu in met je nieuwe wachtwoord."
      : null;

  const verifyHint =
    reason === "verify" ? (
      <p className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm leading-relaxed text-foreground">
        Geen geldige sessie na de link uit je mail? Controleer of je de nieuwste bevestigingsmail
        gebruikt, of log hier in met e-mail en wachtwoord als je account al actief is.
      </p>
    ) : null;

  const pkceHint =
    reason === "pkce" ? (
      <p className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm leading-relaxed text-foreground">
        Deze link hoort bij een <strong>oudere</strong> bevestigingsmail (PKCE). Vraag een nieuwe
        registratie aan of gebruik &quot;Wachtwoord vergeten&quot;, of log in als je account al
        bevestigd is. Nieuwe mails gebruiken een link die op elk apparaat werkt.
      </p>
    ) : null;

  return (
    <form action={formAction} className="space-y-5">
      {noticeOk ? (
        <p className="rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-foreground">
          {noticeOk}
        </p>
      ) : null}
      {verifyHint}
      {pkceHint}
      {reasonHint ? (
        <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm leading-relaxed text-destructive">
          {reasonHint}
        </p>
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
