"use client";

import Link from "next/link";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { Button } from "@/components/ui/button";

export function StickyConversionBar() {
  return (
    <>
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-16 bg-gradient-to-t from-background to-transparent md:h-20" />
      <div className="cf-sticky-dock">
        <div className="cf-sticky-dock-inner">
          <p className="text-center text-sm font-medium text-muted-foreground sm:text-left">Elke gemiste aanvraag kost geld.</p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <Button size="lg" className="h-11 w-full rounded-xl text-sm font-semibold sm:min-w-[140px]" asChild>
              <Link href="/signup">Start gratis</Link>
            </Button>
            <AnonymousDemoForm className="w-full sm:w-auto">
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="h-11 w-full rounded-xl border-border/60 text-sm font-semibold sm:min-w-[140px] dark:border-white/[0.12]"
              >
                Demo
              </Button>
            </AnonymousDemoForm>
          </div>
        </div>
      </div>
    </>
  );
}
