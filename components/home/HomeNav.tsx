"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { useHomeDemo } from "@/components/home/home-demo-context";
import { BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#oplossing", label: "Oplossing" },
  { href: "#resultaten", label: "Resultaat" },
  { href: "#prijzen", label: "Prijzen" },
  { href: "#faq", label: "FAQ" },
] as const;

export function HomeNav() {
  const [scrolled, setScrolled] = useState(false);
  const { openDemo } = useHomeDemo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-[70] border-b transition-[background,backdrop-filter,box-shadow] duration-300",
        scrolled
          ? cn(
              "shadow-[0_1px_0_0_rgba(15,23,42,0.06)] backdrop-blur-xl",
              "border-slate-200/80 bg-white/80",
              "dark:border-white/[0.08] dark:bg-[#05070D]/82 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]",
            )
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-5 sm:gap-4 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-[11px] font-bold text-white shadow-md ring-1 ring-slate-900/10 dark:from-blue-500 dark:shadow-blue-500/20 dark:ring-white/15">
            {BRAND_LOGO_MONOGRAM}
          </div>
          <span className="truncate text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">{BRAND_NAME}</span>
        </Link>
        <nav className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-[13px] font-medium transition-all duration-200",
                "text-slate-600 hover:bg-slate-900/[0.05] hover:text-slate-900",
                "dark:text-white/65 dark:hover:bg-white/[0.07] dark:hover:text-white",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openDemo}
            className={cn(
              "hidden rounded-full px-3 text-[13px] font-medium transition-all duration-200 hover:-translate-y-0.5 sm:inline-flex",
              "text-slate-700 hover:bg-slate-900/[0.06]",
              "dark:text-white/80 dark:hover:bg-white/[0.08]",
            )}
          >
            Demo
          </Button>
          <ThemeToggle />
          <Button
            asChild
            className={cn(
              "h-10 rounded-full px-4 text-[13px] font-semibold shadow-md transition-all duration-300 hover:-translate-y-0.5 sm:px-5",
              "bg-slate-900 text-white hover:bg-slate-800",
              "dark:bg-white dark:text-[#05070D] dark:hover:bg-white/95",
            )}
          >
            <Link href="/signup">Start gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
