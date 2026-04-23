"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Pas na scroll tonen: geen dubbele hero-CTA in beeld. */
const SHOW_AFTER_PX = 520;

export function StickyConversionBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        className={cn(
          "pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-16 bg-gradient-to-t from-background via-background/80 to-transparent transition-opacity duration-300 md:h-[4.5rem]",
          visible ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "cf-sticky-dock transition-all duration-300 ease-out",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
        )}
      >
        <div className="cf-sticky-dock-inner">
          <p className="text-center text-sm font-medium text-muted-foreground sm:text-left">
            Elke gemiste aanvraag kost geld.
          </p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <Button size="lg" className="h-11 w-full rounded-full text-sm font-semibold sm:min-w-[148px]" asChild>
              <Link href="/signup">Start gratis</Link>
            </Button>
            <Link
              href="#demo"
              className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full border border-border/60 bg-background/90 px-5 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-muted/80 dark:border-white/[0.14] dark:bg-white/[0.05] dark:hover:bg-white/[0.09] sm:w-auto sm:min-w-[148px]"
            >
              Tour <ArrowRight className="size-4 opacity-80" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
