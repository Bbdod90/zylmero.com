"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { enterAnonymousDemo } from "@/actions/demo";
import { Button } from "@/components/ui/button";

export function FloatingDemoCta() {
  return (
    <>
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-24 bg-gradient-to-t from-background to-transparent dark:from-[hsl(228_32%_3%)] md:h-28" />
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-background/[0.96] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_48px_-16px_rgb(0_0_0/0.18)] backdrop-blur-2xl dark:border-white/[0.1] dark:bg-[hsl(228_32%_5%/0.92)] dark:shadow-[0_-16px_56px_-20px_rgb(0_0_0/0.55)] md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-center text-xs font-semibold leading-snug text-foreground/90 sm:text-left md:text-sm">
            Elke gemiste aanvraag = verloren omzet. Reageer eerder dan je concurrent.
          </p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <form action={enterAnonymousDemo} className="w-full sm:w-auto">
              <Button
                type="submit"
                size="lg"
                className="h-14 w-full rounded-2xl text-base font-extrabold shadow-[0_0_36px_-8px_hsl(var(--primary)/0.55)] sm:min-w-[220px]"
              >
                <Play className="mr-2 size-4 fill-current" />
                Zie hoe het werkt
              </Button>
            </form>
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full rounded-2xl border-2 border-white/30 bg-white/[0.06] text-base font-extrabold hover:bg-white/12 sm:min-w-[200px]"
              asChild
            >
              <Link href="/signup">
                Start — pak klanten
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
