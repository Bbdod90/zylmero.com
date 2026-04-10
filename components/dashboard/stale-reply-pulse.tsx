"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function StaleReplyPulse({
  count,
  firstLeadId,
}: {
  count: number;
  firstLeadId: string | null;
}) {
  if (count <= 0) return null;
  return (
    <div className="cf-stale-banner animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/25 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/80">
            <AlertCircle className="size-4 text-muted-foreground" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Openstaande klantreactie
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {count === 1
                ? "Minstens één gesprek wacht op een antwoord van jouw team."
                : `${count} gesprekken wachten op een antwoord.`}
            </p>
          </div>
        </div>
        {firstLeadId ? (
          <Link
            href={`/dashboard/leads/${firstLeadId}`}
            className="shrink-0 rounded-lg border border-border/80 bg-background/80 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            Eerste lead openen
          </Link>
        ) : null}
      </div>
    </div>
  );
}
