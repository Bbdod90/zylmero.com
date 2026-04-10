"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { setDemoModeCookie } from "@/actions/demo";
import { Loader2 } from "lucide-react";

export function DemoModeToggle({
  active,
  forced,
}: {
  active: boolean;
  forced: boolean;
}) {
  const [pending, start] = useTransition();

  if (forced) {
    return (
      <p className="px-3 text-[11px] leading-snug text-amber-700 dark:text-amber-200">
        Demo-dataset vastgezet via omgeving.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2 border-t border-border/60 px-3 py-2">
      {pending ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : null}
      <Switch
        checked={active}
        disabled={pending}
        onCheckedChange={(v) => {
          start(async () => {
            await setDemoModeCookie(v);
          });
        }}
        id="demo-mode"
      />
      <label
        htmlFor="demo-mode"
        className="cursor-pointer text-[11px] font-medium text-muted-foreground"
      >
        Demo-data (screenshots)
      </label>
    </div>
  );
}
