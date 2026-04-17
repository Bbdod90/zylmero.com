"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { QuoteStatus } from "@/lib/types";
import { updateQuoteStatus } from "@/actions/quotes";
import { cn } from "@/lib/utils";
import { quoteStatusNl } from "@/lib/i18n/nl-labels";
import { quoteStatusBadgeClass } from "@/lib/ui/quote-status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ORDER: QuoteStatus[] = ["draft", "sent", "accepted", "declined"];

export function QuoteStatusMenu({
  quoteId,
  status,
  demoMode,
  stopPropagation,
  className,
  onDemoStatusChange,
}: {
  quoteId: string;
  status: QuoteStatus;
  demoMode?: boolean;
  stopPropagation?: boolean;
  className?: string;
  onDemoStatusChange?: (next: QuoteStatus) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [demoPick, setDemoPick] = useState<QuoteStatus | null>(null);

  const display = demoMode ? (demoPick ?? status) : status;

  useEffect(() => {
    setDemoPick(null);
  }, [status, quoteId]);

  const bubble = (e: React.SyntheticEvent) => {
    if (stopPropagation) e.stopPropagation();
  };

  if (demoMode) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Offertestatus (demo)"
            className={cn(
              quoteStatusBadgeClass(display),
              "inline-flex max-w-full min-w-0 cursor-pointer items-center gap-1 border px-3 py-1 text-2xs font-semibold uppercase tracking-wide",
              className,
            )}
            onPointerDown={bubble}
            onClick={bubble}
          >
            <span className="min-w-0 truncate">{quoteStatusNl(display)}</span>
            <ChevronDown className="size-3 shrink-0 opacity-70" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[min(100vw-2rem,220px)]"
          onPointerDown={bubble}
          onClick={bubble}
        >
          {ORDER.map((s) => (
            <DropdownMenuItem
              key={s}
              className="gap-2 text-sm"
              onSelect={() => {
                if (s === display) return;
                setDemoPick(s);
                onDemoStatusChange?.(s);
                toast.message(`Status (demo): ${quoteStatusNl(s)}`);
              }}
            >
              {s === display ? (
                <Check className="size-4 shrink-0 text-primary" />
              ) : (
                <span className="size-4 shrink-0" />
              )}
              {quoteStatusNl(s)}
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
          aria-label="Offertestatus wijzigen"
          className={cn(
            quoteStatusBadgeClass(status),
            "inline-flex max-w-full min-w-0 cursor-pointer items-center gap-1 border px-3 py-1 text-2xs font-semibold uppercase tracking-wide disabled:opacity-60",
            className,
          )}
          onPointerDown={bubble}
          onClick={bubble}
        >
          <span className="min-w-0 truncate">{quoteStatusNl(status)}</span>
          <ChevronDown className="size-3 shrink-0 opacity-70" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[min(100vw-2rem,220px)]"
        onPointerDown={bubble}
        onClick={bubble}
      >
        {ORDER.map((s) => (
          <DropdownMenuItem
            key={s}
            className="gap-2 text-sm"
            onSelect={() => {
              if (s === status) return;
              start(async () => {
                const res = await updateQuoteStatus(quoteId, s);
                if (!res.ok) {
                  toast.error(res.error || "Status bijwerken mislukt.");
                  return;
                }
                toast.success("Status bijgewerkt");
                router.refresh();
              });
            }}
          >
            {s === status ? (
              <Check className="size-4 shrink-0 text-primary" />
            ) : (
              <span className="size-4 shrink-0" />
            )}
            {quoteStatusNl(s)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
