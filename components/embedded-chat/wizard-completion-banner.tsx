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
          ? "border-amber-400/28 bg-amber-500/[0.1] text-amber-50/95"
          : "border-emerald-400/28 bg-emerald-500/[0.09] text-emerald-100",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        className={cn(
          "absolute right-3 top-3 rounded-lg p-1 transition-colors hover:bg-white/10",
          isUrlNote ? "text-amber-200/80 hover:text-amber-50" : "text-emerald-200/80 hover:text-emerald-50",
        )}
        aria-label="Sluiten"
      >
        <X className="size-4" />
      </button>
      <div className="flex gap-3 pr-8">
        <Sparkles
          className={cn("mt-0.5 size-5 shrink-0", isUrlNote ? "text-amber-300" : "text-emerald-300")}
          aria-hidden
        />
        <div className="space-y-1">
          <p className={cn("font-semibold", isUrlNote ? "text-amber-50" : "text-emerald-50")}>
            {isUrlNote ? "Website-URL handmatig toevoegen" : "Setup voltooid"}
          </p>
          <p className={cn("leading-relaxed", isUrlNote ? "text-amber-100/90" : "text-emerald-100/90")}>
            {isUrlNote ? (
              <>
                De URL kon niet automatisch worden opgeslagen. Voeg onderaan bij <strong className="text-amber-50">Kennis</strong> je
                website toe als bron (type URL).
              </>
            ) : (
              <>
                Je bot staat klaar. Test hiernaast met <strong className="font-semibold text-emerald-50">Live test</strong>, kopieer daarna je{" "}
                <strong className="font-semibold text-emerald-50">embed-code</strong> en plak die op je site vóór{" "}
                <code className="rounded bg-black/25 px-1 py-0.5 text-xs">&lt;/body&gt;</code>.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
