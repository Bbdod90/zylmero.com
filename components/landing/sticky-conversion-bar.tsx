"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
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
          "pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-20 bg-gradient-to-t from-background via-background/85 to-transparent transition-opacity duration-300 md:h-24",
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
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <Button size="lg" className="h-11 w-full rounded-full text-sm font-semibold sm:min-w-[148px]" asChild>
              <Link href="/signup">Start gratis</Link>
            </Button>
            <AnonymousDemoForm className="w-full sm:w-auto">
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="h-11 w-full rounded-full border-border/60 text-sm font-semibold sm:min-w-[148px] dark:border-white/[0.14]"
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
