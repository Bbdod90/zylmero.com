import Link from "next/link";
import { Plug } from "lucide-react";
import type { CustomerReadiness, ReadinessRow } from "@/lib/dashboard/readiness";
import { cn } from "@/lib/utils";

function shortLabel(row: ReadinessRow): string | null {
  switch (row.id) {
    case "web":
      return "websitechat";
    case "wa":
      return "WhatsApp";
    case "mail":
      return "e-mail";
    case "ai":
      return "kennis voor je assistent";
    case "demo":
      return null;
    default:
      return null;
  }
}

/** Smalle melding op home: wat je nog kunt koppelen. */
export function SetupHintBar({
  readiness,
  demoMode,
}: {
  readiness: CustomerReadiness;
  demoMode: boolean;
}) {
  if (demoMode) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-sm",
          "dark:border-primary/30 dark:bg-primary/[0.1]",
        )}
        role="status"
      >
        <Plug className="size-4 shrink-0 text-primary" aria-hidden />
        <p className="min-w-0 flex-1 font-medium leading-snug text-foreground/85">
          <span className="text-foreground">Demo.</span> Met een echt account koppel je hier straks WhatsApp, e-mail en
          websitechat — alles op één plek.
        </p>
      </div>
    );
  }

  const todo = readiness.rows.filter((r) => r.tone !== "good" && r.id !== "demo");
  const labels = todo.map(shortLabel).filter((x): x is string => Boolean(x));

  if (labels.length === 0) {
    return null;
  }

  const list =
    labels.length === 1
      ? labels[0]
      : labels.length === 2
        ? `${labels[0]} en ${labels[1]}`
        : `${labels.slice(0, -1).join(", ")} en ${labels[labels.length - 1]}`;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.1] to-amber-500/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        "dark:border-amber-400/25 dark:from-amber-500/[0.12] dark:to-transparent",
      )}
      role="status"
    >
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-900 dark:text-amber-100">
          <Plug className="size-4" strokeWidth={2} aria-hidden />
        </span>
        <p className="min-w-0 text-sm font-medium leading-snug text-amber-950 dark:text-amber-50">
          Nog niet alles gekoppeld: je kunt nu <span className="font-semibold">{list}</span> afronden — dan mis je
          geen aanvraag meer.
        </p>
      </div>
      <Link
        href="/dashboard/ai-koppelingen"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm",
          "transition hover:bg-primary/90 hover:shadow-md active:scale-[0.98]",
        )}
      >
        Naar kanalen
      </Link>
    </div>
  );
}
