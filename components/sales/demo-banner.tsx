import { isAnonymousPreviewSession } from "@/lib/env";
import { exitAnonymousDemo } from "@/actions/demo";
import { DemoNichePicker } from "@/components/demo/demo-niche-picker";
import { Sparkles } from "lucide-react";

export function DemoBanner({
  forced,
  demoNicheId,
}: {
  forced: boolean;
  demoNicheId: string;
}) {
  const anon = isAnonymousPreviewSession();

  return (
    <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-r from-primary/[0.06] via-card/50 to-accent/[0.04] px-safe py-3 text-center text-xs leading-relaxed sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-left">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_120%_at_30%_-40%,hsl(var(--primary)/0.12),transparent_55%)]" />
      <div className="relative flex flex-1 flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
          <Sparkles className="size-4" />
        </span>
        <div className="text-center sm:text-left">
          <span className="font-semibold text-foreground">Premium demo</span>
          <span className="text-muted-foreground">
            {" "}
            — voorbeelddata: aanvragen, offertes en afspraken.
            {forced ? " (Vastgezet via env.)" : ""}
          </span>
        </div>
      </div>
      <div className="relative mt-3 flex flex-col items-stretch gap-2 sm:mt-0 sm:flex-row sm:items-center sm:justify-end">
        <DemoNichePicker current={demoNicheId} />
        {anon ? (
          <form action={exitAnonymousDemo} className="shrink-0 sm:ml-1">
            <button
              type="submit"
              className="w-full rounded-xl border border-border/70 bg-background/80 px-4 py-2 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted/80 dark:border-white/[0.12] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] sm:w-auto"
            >
              Demo verlaten
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
