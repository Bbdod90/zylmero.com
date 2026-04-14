import { isAnonymousPreviewSession } from "@/lib/env";
import { exitAnonymousDemo } from "@/actions/demo";
import { DemoNichePicker } from "@/components/demo/demo-niche-picker";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoBanner({
  forced,
  demoNicheId,
}: {
  forced: boolean;
  demoNicheId: string;
}) {
  const anon = isAnonymousPreviewSession();

  return (
    <div
      className={cn(
        "border-b border-border/40 bg-muted/20 px-4 py-4 dark:border-white/[0.07]",
        "dark:bg-[linear-gradient(180deg,hsl(var(--primary)/0.07)_0%,hsl(var(--background)/0.96)_100%)]",
      )}
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-sm ring-1 ring-primary/15 dark:bg-primary/18 dark:ring-primary/25">
            <Sparkles className="size-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold tracking-tight text-foreground">Premium demo</p>
            <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">
              Voorbeelddata — geen echte klanten of berichten.
              {forced ? " Scenario vastgezet via omgeving." : ""}
            </p>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <DemoNichePicker current={demoNicheId} />
          {anon ? (
            <form action={exitAnonymousDemo} className="w-full sm:w-auto">
              <button
                type="submit"
                className={cn(
                  "flex h-10 w-full items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-colors sm:min-w-[9.5rem]",
                  "border-border/60 bg-transparent text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground",
                  "dark:border-white/[0.12] dark:hover:bg-white/[0.06]",
                )}
              >
                Demo verlaten
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
