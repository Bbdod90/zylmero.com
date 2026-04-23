"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Pas na scroll: geen dubbele hero-CTA in beeld. */
const SHOW_AFTER_PX = 480;

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
          "pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-14 bg-gradient-to-t from-background via-background/85 to-transparent transition-opacity duration-300 md:h-16",
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
          <p className="text-center text-sm font-medium text-muted-foreground sm:text-left sm:text-base">
            Elke gemiste aanvraag kost je omzet.
          </p>
          <Button size="lg" className="h-12 w-full rounded-full text-sm font-semibold sm:w-auto sm:min-w-[180px]" asChild>
            <Link href="/signup">Start gratis</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
