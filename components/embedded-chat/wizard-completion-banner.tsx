"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

type BannerVariant = "success" | "urlNote";

export function WizardCompletionBanner({ variant = "success" }: { variant?: BannerVariant }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const isUrlNote = variant === "urlNote";

  return (
    <div
      className={cn(
        "relative mb-8 overflow-hidden rounded-2xl border px-4 py-5 text-sm shadow-md sm:px-6",
        "ring-1 ring-inset",
        /* `!` op licht modus: niets mag bodytekst naar muted trekken */
        "!text-zinc-950",
        isUrlNote
          ? "border-amber-300/80 bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100/90 ring-amber-950/10 dark:border-amber-600/40 dark:from-amber-950 dark:via-amber-950/95 dark:to-amber-950 dark:!text-amber-50 dark:ring-amber-200/10"
          : "border-emerald-300/80 bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50/90 ring-emerald-950/10 dark:border-emerald-700/40 dark:from-emerald-950 dark:via-emerald-950/95 dark:to-emerald-950 dark:!text-emerald-50 dark:ring-emerald-200/10",
      )}
      role="status"
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-12 size-40 rounded-full blur-2xl",
          isUrlNote ? "bg-amber-200/50 dark:bg-amber-500/15" : "bg-emerald-200/50 dark:bg-emerald-500/15",
        )}
        aria-hidden
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className={cn(
          "absolute right-3 top-3 z-10 rounded-lg p-1.5 transition-colors",
          "text-zinc-700 hover:bg-zinc-950/[0.06]",
          "dark:text-emerald-100/90 dark:hover:bg-white/10",
          isUrlNote && "dark:text-amber-100/90",
        )}
        aria-label="Sluiten"
      >
        <X className="size-4" strokeWidth={2.25} />
      </button>

      <div className="relative flex gap-4 pr-10">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-sm",
            "border-white/80 bg-white/85 text-emerald-800 backdrop-blur-sm",
            "dark:border-white/10 dark:bg-white/10 dark:text-emerald-200",
            isUrlNote &&
              "text-amber-900 dark:border-amber-300/20 dark:bg-amber-500/15 dark:text-amber-100",
          )}
          aria-hidden
        >
          <Sparkles className="size-5" strokeWidth={2} />
        </div>

        <div className="min-w-0 space-y-2 pt-0.5">
          <p
            className={cn(
              "text-base font-semibold leading-snug tracking-tight !text-zinc-950",
              "dark:!text-emerald-50",
              isUrlNote && "dark:!text-amber-50",
            )}
          >
            {isUrlNote ? "Website-URL handmatig toevoegen" : "Setup voltooid"}
          </p>
          <p
            className={cn(
              "text-[0.9375rem] leading-relaxed !text-zinc-900",
              "dark:!text-emerald-100",
              isUrlNote && "dark:!text-amber-100",
            )}
          >
            {isUrlNote ? (
              <>
                De URL kon niet automatisch worden opgeslagen. Voeg onderaan bij{" "}
                <strong className="font-semibold text-zinc-950 dark:text-amber-50">Kennis</strong> je website toe als bron
                (type URL).
              </>
            ) : (
              <>
                Je bot staat klaar. Test hiernaast met{" "}
                <strong className="font-semibold text-zinc-950 dark:text-emerald-50">Live test</strong>, kopieer daarna je{" "}
                <strong className="font-semibold text-zinc-950 dark:text-emerald-50">embed-code</strong> en plak die op je site
                vóór{" "}
                <code
                  className={cn(
                    "rounded-md border px-1.5 py-0.5 font-mono text-[0.8125rem] font-medium",
                    "border-emerald-300/70 bg-white text-zinc-950 shadow-sm",
                    "dark:border-emerald-500/30 dark:bg-black/40 dark:text-emerald-50",
                  )}
                >
                  &lt;/body&gt;
                </code>
                .
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
