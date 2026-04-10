"use client";

import { useFormState, useFormStatus } from "react-dom";
import { joinWaitlistAction, type WaitlistState } from "@/actions/waitlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="shrink-0 rounded-xl px-6"
      disabled={pending}
    >
      {pending ? "…" : "Hou me op de hoogte"}
    </Button>
  );
}

const initial: WaitlistState = {};

export function WaitlistForm({ className }: { className?: string }) {
  const [state, formAction] = useFormState(joinWaitlistAction, initial);

  if (state.ok) {
    return (
      <p className={`text-sm font-medium text-primary ${className ?? ""}`}>
        Je staat op de lijst — we nemen contact op.
      </p>
    );
  }

  return (
    <form action={formAction} className={`flex flex-col gap-2 sm:flex-row ${className ?? ""}`}>
      <Input
        name="email"
        type="email"
        required
        placeholder="Zakelijk e-mailadres"
        className="h-11 rounded-xl border-white/10 bg-white/5"
      />
      <Submit />
      {state.error ? (
        <p className="text-sm text-red-400 sm:w-full">{state.error}</p>
      ) : null}
    </form>
  );
}
