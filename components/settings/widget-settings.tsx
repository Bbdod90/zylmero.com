"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/growth/copy-button";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WidgetSettings({
  siteOrigin,
  embedToken,
}: {
  siteOrigin: string;
  embedToken: string;
}) {
  const [showCode, setShowCode] = useState(false);

  const scriptSrc = useMemo(() => {
    const o = siteOrigin.replace(/\/$/, "");
    return `${o}/api/embed/widget?token=${encodeURIComponent(embedToken)}`;
  }, [siteOrigin, embedToken]);

  const snippet = `<script src="${scriptSrc}" async></script>`;

  const itPack = useMemo(
    () =>
      [
        "Zylmero — instructie websitechat",
        "",
        "Stap 1: Plak onderstaande regel vlak voor de sluitende </body> op je website.",
        "",
        snippet,
        "",
        "Stap 2: Publiceer de pagina en test de chatknop rechtsonder.",
        "",
        "Vragen? Neem contact op met Zylmero-support.",
      ].join("\n"),
    [snippet],
  );

  return (
    <div className="cf-dashboard-panel overflow-hidden shadow-md">
      <header className="flex gap-4 border-b border-border/50 p-6 sm:p-8 sm:pb-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <MessageCircle className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Websitechat activeren</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Plaats binnen een paar minuten een chat op je site. Bezoekers stellen een vraag — jij ziet het antwoord bij
            Berichten.
          </p>
        </div>
      </header>

      <div className="space-y-6 p-6 sm:p-8 sm:pt-4">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3 dark:border-emerald-500/30">
          <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Actief</span>
          <span className="text-sm text-emerald-900/90 dark:text-emerald-100/90">
            Je kunt nu de code plaatsen of doorsturen naar je webbouwer.
          </span>
        </div>

        {!showCode ? (
          <Button
            type="button"
            size="lg"
            className="h-12 w-full rounded-xl text-base font-semibold shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99] sm:w-auto"
            onClick={() => setShowCode(true)}
          >
            Code tonen
          </Button>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stap 1</p>
              <p className="mt-1 text-sm font-medium text-foreground">Kopieer deze code</p>
              <pre className="mt-3 max-h-48 overflow-auto rounded-xl border border-border/60 bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground shadow-inner dark:border-white/[0.1] dark:bg-black/35">
                {snippet}
              </pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton text={snippet} label="Kopieer code" />
                <CopyButton text={itPack} label="Mail naar webbouwer (tekst klaar)" />
              </div>
            </div>
            <div
              className={cn(
                "rounded-xl border border-primary/20 bg-primary/[0.04] p-5 text-sm leading-relaxed",
                "dark:border-primary/25 dark:bg-primary/[0.08]",
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Stap 2</p>
              <p className="mt-2 font-semibold text-foreground">Plak op je site of stuur naar je webbouwer</p>
              <p className="mt-2 text-muted-foreground">
                De regel hoort bijna onderaan de pagina, net voor het einde van de pagina-body. Test daarna even of de
                knop verschijnt.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
