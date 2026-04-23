"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
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
          ? "border-white/[0.08] bg-[#05070D]/80 shadow-[0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            {BRAND_LOGO_MONOGRAM}
          </div>
          <span className="text-[15px] font-semibold tracking-tight">{BRAND_NAME}</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            asChild
            className="h-10 rounded-full bg-white px-5 text-[13px] font-semibold text-[#05070D] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/95"
          >
            <Link href="/signup">Start gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
