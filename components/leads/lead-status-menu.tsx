"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { updateLeadStatus } from "@/actions/leads";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  leadStatusBadgeClass,
} from "@/components/leads/status-badge";

export function LeadStatusMenu({
  leadId,
  status,
  demoMode,
  className,
  compact,
  stopPropagation,
  /** In demo: parent kan kolom/tabel syncen (bijv. pipeline-dashboard). */
  onDemoStatusChange,
}: {
  leadId: string;
  status: LeadStatus;
  demoMode?: boolean;
  className?: string;
  compact?: boolean;
  /** Voorkomt dat klikken in bv. inbox-lijst de rij selecteert. */
  stopPropagation?: boolean;
  onDemoStatusChange?: (next: LeadStatus) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [demoPick, setDemoPick] = useState<LeadStatus | null>(null);

  useEffect(() => {
    setDemoPick(null);
  }, [status]);

  const displayStatus = demoMode ? (demoPick ?? status) : status;

  if (demoMode) {
    const bubble = (e: React.SyntheticEvent) => {
      if (stopPropagation) e.stopPropagation();
    };
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Status kiezen (demo)"
            className={cn(
              leadStatusBadgeClass(displayStatus, className),
              "max-w-full min-w-0 cursor-pointer gap-1 transition-opacity hover:opacity-95",
              compact && "px-2 py-0.5 text-[0.625rem]",
            )}
            onPointerDown={bubble}
            onClick={bubble}
          >
            <span className="min-w-0 truncate">{LEAD_STATUS_LABELS[displayStatus]}</span>
            <ChevronDown className="size-3 shrink-0 opacity-60" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[min(100vw-2rem,240px)]"
          onPointerDown={bubble}
          onClick={bubble}
        >
          {LEAD_STATUSES.map((s) => (
            <DropdownMenuItem
              key={s}
              className="gap-2 text-sm"
              onSelect={() => {
                if (s === displayStatus) return;
                setDemoPick(s);
                onDemoStatusChange?.(s);
              }}
            >
              {s === displayStatus ? (
                <Check className="size-4 shrink-0 text-primary" />
              ) : (
                <span className="size-4 shrink-0" />
              )}
              {LEAD_STATUS_LABELS[s]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const bubble = (e: React.SyntheticEvent) => {
    if (stopPropagation) e.stopPropagation();
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={pending}
          aria-label="Status wijzigen"
          className={cn(
            leadStatusBadgeClass(status, className),
            "max-w-full min-w-0 cursor-pointer gap-1 transition-opacity hover:opacity-95 disabled:opacity-60",
            compact && "px-2 py-0.5 text-[0.625rem]",
          )}
          onPointerDown={bubble}
          onClick={bubble}
        >
          <span className="truncate">{LEAD_STATUS_LABELS[status]}</span>
          <ChevronDown className="size-3 shrink-0 opacity-60" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(100vw-2rem,240px)]"
        onPointerDown={bubble}
        onClick={bubble}
      >
        {LEAD_STATUSES.map((s) => (
          <DropdownMenuItem
            key={s}
            className="gap-2 text-sm"
            onSelect={() => {
              if (s === status) return;
              start(async () => {
                const res = await updateLeadStatus(leadId, s);
                if (!res.ok) {
                  toast.error(res.error || "Status bijwerken mislukt.");
                  return;
                }
                toast.success("Status bijgewerkt.");
                router.refresh();
              });
            }}
          >
            {s === status ? (
              <Check className="size-4 shrink-0 text-primary" />
            ) : (
              <span className="size-4 shrink-0" />
            )}
            {LEAD_STATUS_LABELS[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
