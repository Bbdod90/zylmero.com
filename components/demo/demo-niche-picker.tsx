"use client";

import { setDemoNicheAction } from "@/actions/demo";
import { LANDING_DEMO_ROLES } from "@/lib/demo/landing-demo-roles";
import { cn } from "@/lib/utils";

export function DemoNichePicker({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
      <span className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Demo-rol
      </span>
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
  );
}
