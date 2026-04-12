"use client";

import { Building2, ChevronDown } from "lucide-react";
import { useDemoRole } from "@/components/landing/demo-role-context";
import { LANDING_DEMO_ROLES } from "@/lib/demo/landing-demo-roles";
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
import { cn } from "@/lib/utils";
import type { NicheId } from "@/lib/niches";

type Variant = "compact" | "default";

export function DemoSituationMenu({
  variant = "default",
  className,
  align = "end",
}: {
  variant?: Variant;
  className?: string;
  align?: "start" | "end";
}) {
  const { demoRole, setDemoRole } = useDemoRole();
  const currentLabel =
    LANDING_DEMO_ROLES.find((r) => r.id === demoRole)?.label ?? "Algemeen";

  const compact = variant === "compact";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "shrink-0 gap-1 rounded-lg font-semibold",
            compact
              ? "h-8 border-white/[0.12] bg-white/[0.04] px-2 text-[0.65rem] text-foreground hover:bg-white/[0.07] dark:text-zinc-100"
              : "h-9 max-w-[min(11rem,calc(100vw-8rem))] border-border/70 px-2 text-[0.7rem] sm:max-w-[13rem] sm:px-2.5 sm:text-[0.75rem]",
            className,
          )}
          aria-label="Kies demo-situatie"
        >
          <Building2 className={cn("shrink-0 opacity-80", compact ? "size-3" : "size-3.5")} aria-hidden />
          <span className={cn("min-w-0 truncate", compact && "max-w-[5.5rem] sm:max-w-[8rem]")}>
            {currentLabel}
          </span>
          <ChevronDown className={cn("shrink-0 opacity-60", compact ? "size-3" : "size-3.5")} aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-[min(calc(100vw-2rem),16rem)]">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Kies je branche (demo)
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
  );
}
