"use client";

import Link from "next/link";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { Button } from "@/components/ui/button";

export function StickyConversionBar() {
  return (
    <>
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-24 bg-gradient-to-t from-background via-background/80 to-transparent md:h-28" />
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/30 bg-background/85 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md dark:border-white/[0.08] dark:bg-[hsl(228_32%_5%/0.92)] md:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-center text-sm text-foreground sm:text-left">
            Gemiste aanvraag = gemiste omzet.
          </p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <Button size="lg" className="h-11 w-full rounded-xl text-sm font-semibold sm:min-w-[180px]" asChild>
              <Link href="/signup">Start gratis</Link>
            </Button>
            <AnonymousDemoForm className="w-full sm:w-auto">
              <Button type="submit" variant="demo" size="lg" className="h-11 w-full rounded-xl text-sm sm:min-w-[180px]">
                Bekijk demo
              </Button>
            </AnonymousDemoForm>
          </div>
        </div>
      </div>
    </>
  );
}
