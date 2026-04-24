"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
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
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const { openDemo } = useHomeDemo();

  useEffect(() => setMounted(true), []);

  /** Tov defaultTheme=dark: vóór hydrate donker nav voorkomt lichte flits. */
  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-[70] border-b border-transparent bg-transparent">
      <div className="mx-auto flex h-[3.65rem] max-w-[1200px] items-center justify-between gap-3 px-5 sm:gap-4 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-[11px] font-bold text-white shadow-md ring-1 ring-slate-900/10 dark:from-blue-500 dark:shadow-blue-500/25 dark:ring-white/15">
            {BRAND_LOGO_MONOGRAM}
          </div>
          <span
            className={cn(
              "truncate text-[15px] font-semibold tracking-tight",
              isDark ? "text-white" : "text-slate-900",
            )}
          >
            {BRAND_NAME}
          </span>
        </Link>
        <nav className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-[13px] font-semibold tracking-tight transition-all duration-200",
                isDark
                  ? "text-white/90 hover:bg-white/[0.1] hover:text-white"
                  : "text-slate-700 hover:bg-slate-900/[0.06] hover:text-slate-950",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="demo"
            size="sm"
            onClick={openDemo}
            className="h-9 min-h-0 shrink-0 rounded-full px-3.5 text-[13px] transition-all duration-200 hover:-translate-y-0.5 sm:h-10 sm:px-4"
          >
            Demo
          </Button>
          <ThemeToggle
            className={cn(
              isDark &&
                "border-white/12 bg-white/[0.06] text-white/85 shadow-none backdrop-blur-md hover:border-white/18 hover:bg-white/[0.1] hover:text-white",
            )}
          />
          <Button
            asChild
            className={cn(
              "h-10 rounded-full px-4 text-[13px] font-semibold shadow-md transition-all duration-300 hover:-translate-y-0.5 sm:px-5",
              isDark
                ? "bg-white text-[#05070D] shadow-black/25 hover:bg-white/95"
                : "bg-slate-900 text-white hover:bg-slate-800",
            )}
          >
            <Link href="/signup">Start gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
