"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { Inbox, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEMO_DISMISS_KEY = "zylmero_demo_conversion_strip_dismissed";

export function ConversionUrgencyBar({ demoMode }: { demoMode: boolean }) {
  const [demoDismissed, setDemoDismissed] = useState(false);

  useLayoutEffect(() => {
    if (!demoMode || typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem(DEMO_DISMISS_KEY) === "1") {
      setDemoDismissed(true);
    }
  }, [demoMode]);

  if (demoMode && demoDismissed) {
    return null;
  }

  function dismissDemoStrip() {
    sessionStorage.setItem(DEMO_DISMISS_KEY, "1");
    setDemoDismissed(true);
  }

  return (
    <div className="border-b border-border/50 bg-muted/15 px-4 py-2.5 sm:px-8 lg:px-12">
      <div
        className={cn(
          "mx-auto flex max-w-[1600px] gap-3 sm:items-center sm:gap-4",
          demoMode ? "flex-row justify-end" : "flex-col sm:flex-row sm:justify-between",
        )}
      >
        {!demoMode ? (
          <p className="text-sm leading-snug text-muted-foreground">
            <span className="font-medium text-foreground">Tip</span>
            {" · "}
            Werk open gesprekken van oud naar nieuw af — zo mis je geen klantreactie.
          </p>
        ) : null}
        <div
          className={cn(
            "flex items-center gap-2",
            demoMode ? "justify-end" : "shrink-0",
          )}
        >
          <Button variant="outline" size="sm" className="shrink-0 rounded-full border-border/80" asChild>
            <Link href="/dashboard/inbox">
              <Inbox className="mr-2 size-3.5" />
              Naar berichten
            </Link>
          </Button>
          {demoMode ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Melding sluiten"
              onClick={dismissDemoStrip}
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
