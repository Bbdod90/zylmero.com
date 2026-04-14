"use client";

import { useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { setDemoNicheAction } from "@/actions/demo";
import { LANDING_DEMO_ROLES } from "@/lib/demo/landing-demo-roles";
import { cn } from "@/lib/utils";

export function DemoNichePicker({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const currentLabel =
    LANDING_DEMO_ROLES.find((r) => r.id === current)?.label ?? "Algemeen";

  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:max-w-xl sm:items-end">
      <button
        type="button"
        className={cn(
          "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors sm:w-auto sm:justify-between sm:gap-3 sm:pl-3 sm:pr-2",
          "border-border/70 bg-background/70 text-foreground shadow-sm hover:bg-muted/60 dark:border-white/[0.12] dark:bg-white/[0.05] dark:hover:bg-white/[0.08]",
          open && "border-primary/30 bg-primary/[0.06] dark:bg-primary/[0.08]",
        )}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-2xs shrink-0 font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Demo-rol
        </span>
        <span className="min-w-0 flex-1 truncate sm:flex-none sm:text-left">{currentLabel}</span>
        {open ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </button>
      {open ? (
        <div
          id={panelId}
          className="flex flex-wrap justify-center gap-2 rounded-xl border border-border/50 bg-card/80 p-3 dark:border-white/[0.1] dark:bg-white/[0.03] sm:justify-end"
        >
          {LANDING_DEMO_ROLES.map((o) => (
            <form key={o.id} action={setDemoNicheAction} className="inline">
              <input type="hidden" name="niche" value={o.id} />
              <button
                type="submit"
                className={cn(
                  "min-h-[40px] rounded-full border px-3 py-2 text-xs font-semibold transition-all duration-200",
                  current === o.id
                    ? "border-primary/45 bg-primary/15 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.25),0_2px_8px_-2px_hsl(var(--primary)/0.3)]"
                    : "border-border/70 bg-background/50 text-muted-foreground hover:border-primary/25 hover:bg-primary/[0.04] hover:text-foreground dark:border-white/[0.1] dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
                )}
              >
                {o.label}
              </button>
            </form>
          ))}
        </div>
      ) : null}
    </div>
  );
}
