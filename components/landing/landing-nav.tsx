"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#demo", label: "Demo" },
  { href: "#probleem", label: "Probleem" },
  { href: "#prijzen", label: "Prijzen" },
  { href: "#faq", label: "FAQ" },
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
          ? "border-border/50 bg-background/[0.96] shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-[hsl(228_32%_4%/0.94)]"
          : "border-transparent bg-background/90 backdrop-blur-md dark:bg-background/[0.85]",
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-2 px-4 md:h-16 md:px-8">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 text-foreground">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold ring-1 ring-primary/20">
            {BRAND_LOGO_MONOGRAM}
          </div>
          <span className="truncate font-semibold tracking-tight">{BRAND_NAME}</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/60"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <AnonymousDemoForm>
            <Button type="submit" size="sm" variant="outline" className="rounded-lg text-xs font-semibold sm:text-sm">
              Demo
            </Button>
          </AnonymousDemoForm>
          <Button size="sm" className="rounded-lg px-3 text-xs font-semibold sm:text-sm" asChild>
            <Link href="/signup">Start gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
