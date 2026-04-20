"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/growth/copy-button";
import { Code2 } from "lucide-react";

export function WidgetSettings({
  siteOrigin,
  embedToken,
}: {
  siteOrigin: string;
  embedToken: string;
}) {
  const scriptSrc = useMemo(() => {
    const o = siteOrigin.replace(/\/$/, "");
    return `${o}/api/embed/widget?token=${encodeURIComponent(embedToken)}`;
  }, [siteOrigin, embedToken]);

  const snippet = `<script src="${scriptSrc}" async></script>`;

  return (
    <div className="cf-dashboard-panel overflow-hidden">
      <header className="flex gap-4 border-b border-border/50 p-6 sm:p-8 sm:pb-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Code2 className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Website-widget</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Bezoekers worden lead in jouw inbox; tone en kennis volgen uit{" "}
            <strong className="font-medium text-foreground">Bedrijf</strong> en{" "}
            <strong className="font-medium text-foreground">Kennis</strong>. Plak het snippet vlak vóór{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">&lt;/body&gt;</code>. Met een actief
            abonnement worden berichten verwerkt.
          </p>
        </div>
      </header>

      <div className="space-y-6 p-6 sm:p-8 sm:pt-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Embed-snippet</p>
          <pre className="max-h-44 overflow-auto rounded-lg border border-border/60 bg-[hsl(222_47%_6%/0.04)] p-4 font-mono text-xs leading-relaxed text-foreground/95 shadow-inner-soft dark:border-white/[0.08] dark:bg-black/30">
            {snippet}
          </pre>
          <div className="mt-3">
            <CopyButton text={snippet} label="Kopieer snippet" />
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-5 text-sm leading-relaxed text-muted-foreground dark:border-primary/25">
          <p className="font-semibold text-foreground">Preview</p>
          <p className="mt-2">
            Op je site verschijnt een chatknop rechtsonder. Test eerst op een staging- of testpagina voordat je live gaat.
          </p>
        </div>
      </div>
    </div>
  );
}
