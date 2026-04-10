"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/growth/copy-button";

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
    <Card className="rounded-2xl border-border/70 bg-card/50">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Website-widget</CardTitle>
        <p className="text-sm text-muted-foreground">
          Plak dit vóór <code className="rounded bg-muted px-1">&lt;/body&gt;</code>. Bezoekers
          kunnen een bericht sturen — leads komen binnen in CloserFlow.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Snippet
          </p>
          <pre className="max-h-40 overflow-x-auto overflow-y-auto rounded-xl border border-white/[0.06] bg-muted/20 p-4 text-xs leading-relaxed text-foreground">
            {snippet}
          </pre>
          <div className="mt-2">
            <CopyButton text={snippet} label="Kopieer snippet" />
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-primary/25 bg-primary/[0.04] p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Preview</p>
          <p className="mt-2">
            Op je eigen site verschijnt een chatknop rechtsonder. Test eerst op een
            testpagina.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
