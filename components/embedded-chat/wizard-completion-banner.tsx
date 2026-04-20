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
        "relative mb-8 rounded-2xl border px-4 py-4 text-sm shadow-sm sm:px-5",
        isUrlNote
          ? "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-600/60 dark:bg-amber-950/55 dark:text-amber-50"
          : "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-600/60 dark:bg-emerald-950/55 dark:text-emerald-50",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        className={cn(
          "absolute right-3 top-3 rounded-lg p-1 transition-colors",
          isUrlNote
            ? "text-amber-800 hover:bg-amber-900/10 dark:text-amber-100 dark:hover:bg-white/10"
            : "text-emerald-800 hover:bg-emerald-900/10 dark:text-emerald-100 dark:hover:bg-white/10",
        )}
        aria-label="Sluiten"
      >
        <X className="size-4" />
      </button>
      <div className="flex gap-3 pr-8">
        <Sparkles
          className={cn(
            "mt-0.5 size-5 shrink-0",
            isUrlNote ? "text-amber-600 dark:text-amber-300" : "text-emerald-600 dark:text-emerald-300",
          )}
          aria-hidden
        />
        <div className="space-y-1">
          <p className="font-semibold">{isUrlNote ? "Website-URL handmatig toevoegen" : "Setup voltooid"}</p>
          <p
            className={cn(
              "leading-relaxed",
              isUrlNote ? "text-amber-900/90 dark:text-amber-50/95" : "text-emerald-900/90 dark:text-emerald-50/95",
            )}
          >
            {isUrlNote ? (
              <>
                De URL kon niet automatisch worden opgeslagen. Voeg onderaan bij <strong className="font-semibold text-amber-950 dark:text-amber-50">Kennis</strong> je
                website toe als bron (type URL).
              </>
            ) : (
              <>
                Je bot staat klaar. Test hiernaast met <strong className="font-semibold text-emerald-950 dark:text-emerald-50">Live test</strong>, kopieer daarna je{" "}
                <strong className="font-semibold text-emerald-950 dark:text-emerald-50">embed-code</strong> en plak die op je site vóór{" "}
                <code className="rounded bg-emerald-100 px-1 py-0.5 font-mono text-xs text-emerald-950 dark:bg-black/35 dark:text-emerald-50">
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
