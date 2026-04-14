"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Korte labels — minder woorden in de balk; FAQ via footer. */
const LINKS = [
  { href: "#probleem", label: "Waarom" },
  { href: "#hoe-het-werkt", label: "Hoe" },
  { href: "#demo", label: "Demo" },
  { href: "#prijzen", label: "Prijzen" },
] as const;

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "border-border/50 bg-background/[0.94] shadow-[0_1px_0_0_hsl(var(--border)/0.5)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[hsl(228_32%_4%/0.92)]"
          : "border-transparent bg-background/80 backdrop-blur-md dark:bg-background/[0.78]",
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-2 px-4 md:h-[3.75rem] md:gap-4 md:px-8">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2.5 text-foreground"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-foreground ring-1 ring-primary/20">
            {BRAND_LOGO_MONOGRAM}
          </div>
          <span className="truncate text-[0.9375rem] font-semibold tracking-tight">
            {BRAND_NAME}
          </span>
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-[0.8125rem] font-medium tracking-tight text-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex min-w-0 shrink-0 items-center justify-end gap-1 sm:gap-1.5 md:gap-2">
          <ThemeToggle />
          <AnonymousDemoForm>
            <Button
              type="submit"
              size="sm"
              variant="demo"
              className="rounded-lg px-2.5 text-[0.7rem] sm:text-[0.8125rem]"
            >
              Demo
            </Button>
          </AnonymousDemoForm>
          <Button
            variant="ghost"
            size="sm"
            className="hidden rounded-lg px-3 text-[0.8125rem] font-medium text-foreground hover:bg-muted/70 hover:text-foreground md:inline-flex"
            asChild
          >
            <Link href="/login">Inloggen</Link>
          </Button>
          <Button
            size="sm"
            className="rounded-lg px-3 text-[0.75rem] font-semibold shadow-sm sm:px-4 sm:text-[0.8125rem]"
            asChild
          >
            <Link href="/signup">Start gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
