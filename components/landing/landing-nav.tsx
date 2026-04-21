"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#probleem", label: "Probleem" },
  { href: "#hoe-het-werkt", label: "Hoe het werkt" },
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
        "sticky top-0 z-50 border-b transition-[background-color,box-shadow] duration-200",
        scrolled
          ? "border-border/60 bg-background/95 shadow-sm backdrop-blur-md dark:border-white/[0.08] dark:bg-background/95"
          : "border-transparent bg-background/80 backdrop-blur-sm dark:bg-background/80",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-3 px-4 md:px-8">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5 text-foreground">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            {BRAND_LOGO_MONOGRAM}
          </div>
          <span className="truncate text-[15px] font-semibold tracking-tight">{BRAND_NAME}</span>
        </Link>
        <nav className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <AnonymousDemoForm>
            <Button type="submit" size="sm" variant="ghost" className="hidden font-medium sm:inline-flex">
              Demo
            </Button>
          </AnonymousDemoForm>
          <Button size="sm" className="h-9 rounded-lg px-4 text-sm font-semibold" asChild>
            <Link href="/signup">Start gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
