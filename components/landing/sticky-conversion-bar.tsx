"use client";

import Link from "next/link";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { Button } from "@/components/ui/button";

export function StickyConversionBar() {
  return (
    <>
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-28 bg-gradient-to-t from-background via-background/90 to-transparent md:h-32" />
      <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-0 md:px-8">
        <div className="mx-auto mt-3 max-w-[1200px] rounded-2xl border border-border/45 bg-background/92 p-3 shadow-[0_-8px_48px_-20px_rgba(0,0,0,0.45),inset_0_1px_0_0_hsl(0_0%_100%/0.06)] backdrop-blur-2xl dark:border-white/[0.1] dark:bg-[hsl(228_30%_6%/0.92)] dark:shadow-[0_-12px_56px_-24px_rgba(0,0,0,0.65)] md:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            Kleine onderneming groot probleem? Zorg dat aanvragen niet blijven liggen.
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
      </div>
    </>
  );
}
