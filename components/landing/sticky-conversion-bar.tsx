"use client";

import Link from "next/link";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { Button } from "@/components/ui/button";

export function StickyConversionBar() {
  return (
    <>
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-24 bg-gradient-to-t from-background via-background/80 to-transparent md:h-28" />
      <div className="cf-sticky-dock">
        <div className="cf-sticky-dock-inner">
          <p className="text-center text-sm leading-snug text-muted-foreground sm:text-left">
            Voor kleine ondernemers: minder gemiste aanvragen — start gratis of bekijk de demo.
          </p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <Button size="lg" className="h-11 w-full rounded-xl text-sm font-semibold sm:min-w-[160px]" asChild>
              <Link href="/signup">Start gratis</Link>
            </Button>
            <AnonymousDemoForm className="w-full sm:w-auto">
              <Button type="submit" variant="demo" size="lg" className="h-11 w-full rounded-xl text-sm sm:min-w-[160px]">
                Bekijk demo
              </Button>
            </AnonymousDemoForm>
          </div>
        </div>
      </div>
    </>
  );
}
