"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnonymousDemoForm } from "@/components/landing/demo-role-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#platform", label: "Product" },
  { href: "#demo", label: "Tour" },
  { href: "#prijzen", label: "Prijzen" },
  { href: "#faq", label: "FAQ" },
] as const;

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-[60] border-b transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "border-border/55 bg-background/[0.82] shadow-[0_1px_0_0_hsl(var(--border)/0.5)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[hsl(228_32%_4%/0.78)]"
          : "border-transparent bg-background/70 backdrop-blur-md dark:bg-background/60",
      )}
    >
      <div className="mx-auto flex h-[3.5rem] max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5 text-foreground">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-[11px] font-bold text-primary-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            {BRAND_LOGO_MONOGRAM}
          </div>
          <span className="truncate text-[15px] font-semibold tracking-[-0.02em]">{BRAND_NAME}</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-[13px] font-medium tracking-tight text-muted-foreground transition-colors hover:bg-primary/[0.08] hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <AnonymousDemoForm>
            <Button type="submit" size="sm" variant="ghost" className="hidden rounded-full font-medium sm:inline-flex">
              Demo
            </Button>
          </AnonymousDemoForm>
          <Button size="sm" className="h-9 rounded-full px-4 text-[13px] font-semibold shadow-sm" asChild>
            <Link href="/signup">Start gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
