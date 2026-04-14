"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { Lead } from "@/lib/types";
import { updateLeadPriority } from "@/actions/leads";
import { cn } from "@/lib/utils";
import {
  type LeadTemperature,
  computeDisplayScore,
  leadTemperature,
} from "@/lib/sales/scoring";
import { TemperatureBadge } from "@/components/sales/temperature-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ORDER: LeadTemperature[] = ["hot", "warm", "cold"];

const LABELS: Record<LeadTemperature, string> = {
  hot: "Hoog",
  warm: "Medium",
  cold: "Laag",
};

export function LeadPriorityMenu({
  lead,
  demoMode,
  staleReply = false,
  compact,
  stopPropagation,
  className,
  onDemoPriorityChange,
}: {
  lead: Lead;
  demoMode?: boolean;
  staleReply?: boolean;
  compact?: boolean;
  stopPropagation?: boolean;
  className?: string;
  /** Demo: parent merged `custom_fields.priority_override` + callback. */
  onDemoPriorityChange?: (next: LeadTemperature) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const displayScore = computeDisplayScore(lead, { staleReply });
  const computed = leadTemperature(lead, displayScore);

  const bubble = (e: React.SyntheticEvent) => {
    if (stopPropagation) e.stopPropagation();
  };

  if (demoMode) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Prioriteit kiezen (demo)"
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide shadow-sm transition hover:bg-muted/60",
              compact && "px-1.5 py-0.5 text-[0.625rem]",
              className,
            )}
            onPointerDown={bubble}
            onClick={bubble}
          >
            <TemperatureBadge temp={computed} />
            <ChevronDown className="size-3 shrink-0 opacity-60" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[min(100vw-2rem,220px)]"
          onPointerDown={bubble}
          onClick={bubble}
        >
          {ORDER.map((p) => (
            <DropdownMenuItem
              key={p}
              className="gap-2 text-sm"
              onSelect={() => {
                if (p === computed) return;
                onDemoPriorityChange?.(p);
                toast.message(`Prioriteit (demo): ${LABELS[p]}`);
              }}
            >
              {p === computed ? (
                <Check className="size-4 shrink-0 text-primary" />
              ) : (
                <span className="size-4 shrink-0" />
              )}
              {LABELS[p]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={pending}
          aria-label="Prioriteit wijzigen"
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide shadow-sm transition hover:bg-muted/60 disabled:opacity-60",
            compact && "px-1.5 py-0.5 text-[0.625rem]",
            className,
          )}
          onPointerDown={bubble}
          onClick={bubble}
        >
          <TemperatureBadge temp={computed} />
          <ChevronDown className="size-3 shrink-0 opacity-60" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(100vw-2rem,220px)]"
        onPointerDown={bubble}
        onClick={bubble}
      >
        {ORDER.map((p) => (
          <DropdownMenuItem
            key={p}
            className="gap-2 text-sm"
            onSelect={() => {
              if (p === computed) return;
              start(async () => {
                const res = await updateLeadPriority(lead.id, p);
                if (!res.ok) {
                  toast.error(res.error || "Prioriteit bijwerken mislukt.");
                  return;
                }
                toast.success("Prioriteit opgeslagen");
                router.refresh();
              });
            }}
          >
            {p === computed ? (
              <Check className="size-4 shrink-0 text-primary" />
            ) : (
              <span className="size-4 shrink-0" />
            )}
            {LABELS[p]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
