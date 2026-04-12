"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import {
  AnonymousDemoForm,
  useDemoRole,
} from "@/components/landing/demo-role-context";
import { LANDING_DEMO_ROLES } from "@/lib/demo/landing-demo-roles";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BRAND_LOGO_MONOGRAM, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import type { NicheId } from "@/lib/niches";

const LINKS = [
  { href: "#probleem", label: "Probleem" },
  { href: "#oplossing", label: "Oplossing" },
  { href: "#demo", label: "Demo" },
  { href: "#prijzen", label: "Prijzen" },
  { href: "#faq", label: "FAQ" },
] as const;

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { demoRole, setDemoRole } = useDemoRole();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentLabel =
    LANDING_DEMO_ROLES.find((r) => r.id === demoRole)?.label ?? "Algemeen";

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
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/20">
            {BRAND_LOGO_MONOGRAM}
          </div>
          <span className="truncate text-[0.9375rem] font-semibold tracking-tight">
            {BRAND_NAME}
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex lg:gap-2">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-4 py-2.5 text-[0.8125rem] font-medium tracking-tight text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex min-w-0 shrink-0 items-center justify-end gap-1 sm:gap-1.5 md:gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 max-w-[min(11rem,calc(100vw-11rem))] shrink gap-1.5 rounded-lg border-border/70 px-2 text-[0.7rem] font-semibold sm:h-9 sm:max-w-[13rem] sm:px-2.5 sm:text-[0.75rem]"
                aria-label="Kies demo-situatie"
              >
                <Building2 className="size-3.5 shrink-0 opacity-80" aria-hidden />
                <span className="hidden min-w-0 truncate sm:inline">{currentLabel}</span>
                <span className="sm:hidden">Situatie</span>
                <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(calc(100vw-2rem),16rem)]">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Demo-situatie (chat hieronder)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={demoRole}
                onValueChange={(v) => setDemoRole(v as NicheId)}
              >
                {LANDING_DEMO_ROLES.map((r) => (
                  <DropdownMenuRadioItem key={r.id} value={r.id} className="text-sm">
                    {r.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <AnonymousDemoForm>
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="rounded-lg px-2 text-[0.7rem] font-medium leading-snug text-muted-foreground hover:bg-muted/60 hover:text-foreground sm:px-2.5 sm:text-[0.8125rem]"
            >
              <span className="hidden sm:inline">Bekijk hoe het werkt</span>
              <span className="sm:hidden">Demo</span>
            </Button>
          </AnonymousDemoForm>
          <Button
            variant="ghost"
            size="sm"
            className="hidden rounded-lg px-3 text-[0.8125rem] font-medium text-muted-foreground hover:bg-muted/60 md:inline-flex"
            asChild
          >
            <Link href="/login">Inloggen</Link>
          </Button>
          <Button
            size="sm"
            className="rounded-lg px-3 text-[0.75rem] font-semibold shadow-sm sm:px-4 sm:text-[0.8125rem]"
            asChild
          >
            <Link href="/signup">Start gratis proefperiode</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
