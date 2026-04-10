"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  requestPasswordResetAction,
  type AuthFormState,
} from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full rounded-xl" disabled={pending}>
      {pending ? "Verzenden…" : "Stuur resetlink"}
    </Button>
  );
}

const initial: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(requestPasswordResetAction, initial);
  if (state.success && state.message) {
    return (
      <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/[0.08] p-4 text-sm text-foreground">
        <p className="font-medium">E-mail onderweg</p>
        <p className="text-muted-foreground">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={formAction} className="space-y-4">
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
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Submit />
    </form>
  );
}
