"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConversionUrgencyBar({ demoMode }: { demoMode: boolean }) {
  return (
    <div className="border-b border-border/50 bg-muted/15 px-5 py-2.5 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-sm leading-snug text-muted-foreground">
          {demoMode ? (
            <>
              <span className="font-medium text-foreground">Demo</span>
              {" · "}
              Wissel het scenario in de balk hierboven om andere branches te
              bekijken. Alle cijfers zijn voorbeelddata.
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">Tip</span>
              {" · "}
              Werk open gesprekken van oud naar nieuw af — zo mis je geen
              klantreactie.
            </>
          )}
        </p>
        <Button variant="outline" size="sm" className="shrink-0 rounded-full border-border/80" asChild>
          <Link href="/dashboard/inbox">
            <Inbox className="mr-2 size-3.5" />
            Naar berichten
          </Link>
        </Button>
      </div>
    </div>
  );
}
