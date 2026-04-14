"use client";

import { useTransition } from "react";
import { Check, ChevronDown } from "lucide-react";
import { setDemoNicheAction } from "@/actions/demo";
import { LANDING_DEMO_ROLES } from "@/lib/demo/landing-demo-roles";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function DemoNichePicker({ current }: { current: string }) {
  const [pending, start] = useTransition();
  const currentLabel =
    LANDING_DEMO_ROLES.find((r) => r.id === current)?.label ?? "Algemeen";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          aria-label="Demo-branche kiezen"
          className={cn(
            "h-10 w-full min-w-[12rem] justify-between gap-2 rounded-xl border px-3.5 text-xs font-semibold shadow-sm sm:w-auto",
            "border-border/60 bg-background/90 text-foreground hover:bg-muted/50 dark:border-white/[0.12] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]",
          )}
        >
          <span className="flex min-w-0 flex-1 items-baseline gap-2 text-left">
            <span className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Demo-rol
            </span>
            <span className="min-w-0 truncate font-semibold text-foreground">{currentLabel}</span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,16rem)] p-1">
        <p className="px-2 py-1.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
          Voorbeeld-branche
        </p>
        {LANDING_DEMO_ROLES.map((o) => (
          <DropdownMenuItem
            key={o.id}
            className="cursor-pointer gap-2 rounded-lg py-2 text-sm"
            onSelect={() => {
              if (o.id === current) return;
              start(async () => {
                const fd = new FormData();
                fd.set("niche", o.id);
                await setDemoNicheAction(fd);
              });
            }}
          >
            {o.id === current ? (
              <Check className="size-4 shrink-0 text-primary" aria-hidden />
            ) : (
              <span className="size-4 shrink-0" aria-hidden />
            )}
            <span className="truncate">{o.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
