"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadStatus } from "@/lib/types";
import {
  PIPELINE_COLUMNS,
  columnIdForLeadStatus,
  sortLeadsInColumn,
  type PipelineColumnId,
} from "@/lib/pipeline/columns";
import { updateLeadStatus } from "@/actions/leads";
import { AiTagBadges } from "@/components/leads/ai-tag-badges";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { LeadStatusMenu } from "@/components/leads/lead-status-menu";
import { LeadPipelineDetailDialog } from "@/components/pipeline/lead-pipeline-detail-dialog";
import { GripVertical, Phone } from "lucide-react";

/** Visuele taal per kolom — voelt premium aan zonder data te wijzigen */
const COLUMN_THEME: Record<
  PipelineColumnId,
  {
    hint: string;
    chip: string;
    dropIdle: string;
    dropOver: string;
    headerGlow: string;
  }
> = {
  nieuw: {
    hint: "Eerste contact",
    chip:
      "border-sky-500/25 bg-sky-500/[0.12] text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200",
    dropIdle:
      "border-sky-500/10 bg-gradient-to-b from-sky-500/[0.06] via-muted/15 to-transparent dark:from-sky-400/[0.07] dark:via-white/[0.02]",
    dropOver:
      "border-sky-500/40 bg-sky-500/[0.1] shadow-[0_0_0_1px_hsl(199_89%_48%/0.2),0_12px_40px_-16px_hsl(199_89%_48%/0.25)] dark:border-sky-400/45",
    headerGlow: "from-sky-500/25 via-transparent to-transparent",
  },
  gesprek: {
    hint: "Opvolging",
    chip:
      "border-violet-500/25 bg-violet-500/[0.12] text-violet-900 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200",
    dropIdle:
      "border-violet-500/10 bg-gradient-to-b from-violet-500/[0.06] via-muted/15 to-transparent dark:from-violet-400/[0.07] dark:via-white/[0.02]",
    dropOver:
      "border-violet-500/40 bg-violet-500/[0.1] shadow-[0_0_0_1px_hsl(262_83%_58%/0.2),0_12px_40px_-16px_hsl(262_83%_58%/0.22)] dark:border-violet-400/45",
    headerGlow: "from-violet-500/25 via-transparent to-transparent",
  },
  offerte: {
    hint: "Voorstel uit",
    chip:
      "border-amber-500/30 bg-amber-500/[0.14] text-amber-950 dark:border-amber-400/25 dark:bg-amber-400/12 dark:text-amber-100",
    dropIdle:
      "border-amber-500/10 bg-gradient-to-b from-amber-500/[0.07] via-muted/15 to-transparent dark:from-amber-400/[0.08] dark:via-white/[0.02]",
    dropOver:
      "border-amber-500/45 bg-amber-500/[0.11] shadow-[0_0_0_1px_hsl(38_92%_50%/0.22),0_12px_40px_-16px_hsl(38_92%_50%/0.2)] dark:border-amber-400/45",
    headerGlow: "from-amber-500/28 via-transparent to-transparent",
  },
  gewonnen: {
    hint: "Binnen",
    chip:
      "border-emerald-500/30 bg-emerald-500/[0.14] text-emerald-950 dark:border-emerald-400/25 dark:bg-emerald-400/12 dark:text-emerald-100",
    dropIdle:
      "border-emerald-500/10 bg-gradient-to-b from-emerald-500/[0.06] via-muted/15 to-transparent dark:from-emerald-400/[0.07] dark:via-white/[0.02]",
    dropOver:
      "border-emerald-500/45 bg-emerald-500/[0.11] shadow-[0_0_0_1px_hsl(160_84%_39%/0.22),0_12px_40px_-16px_hsl(160_84%_39%/0.2)] dark:border-emerald-400/45",
    headerGlow: "from-emerald-500/25 via-transparent to-transparent",
  },
  verloren: {
    hint: "Niet doorgegaan",
    chip:
      "border-rose-500/35 bg-rose-500/[0.14] text-rose-950 dark:border-rose-400/30 dark:bg-rose-500/12 dark:text-rose-100",
    dropIdle:
      "border-rose-500/10 bg-gradient-to-b from-rose-500/[0.06] via-muted/15 to-transparent dark:from-rose-400/[0.08] dark:via-white/[0.02]",
    dropOver:
      "border-rose-500/40 bg-rose-500/[0.1] shadow-[0_0_0_1px_hsl(350_89%_48%/0.2),0_12px_40px_-16px_hsl(350_89%_48%/0.22)] dark:border-rose-400/45",
    headerGlow: "from-rose-500/25 via-transparent to-transparent",
  },
};

function leadStatusStrip(status: LeadStatus): string {
  switch (status) {
    case "new":
      return "from-sky-500 via-sky-400 to-sky-500/30";
    case "active":
    case "appointment_booked":
      return "from-violet-500 via-fuchsia-400 to-violet-500/35";
    case "quote_sent":
      return "from-amber-500 via-orange-400 to-amber-500/35";
    case "won":
      return "from-emerald-500 via-teal-400 to-emerald-500/35";
    case "lost":
      return "from-rose-500 via-rose-400 to-rose-500/30";
    default:
      return "from-primary via-primary/60 to-primary/25";
  }
}

function LeadCard({
  lead,
  demoMode,
  onDemoLeadStatus,
  onOpenDetail,
}: {
  lead: Lead;
  demoMode: boolean;
  onDemoLeadStatus?: (next: LeadStatus) => void;
  onOpenDetail: (lead: Lead) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `lead-${lead.id}`,
      disabled: demoMode,
      data: { lead },
    });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;
  const strip = leadStatusStrip(lead.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-border/45 bg-card/95 p-0 shadow-[0_4px_24px_-14px_rgb(0_0_0/0.35)] transition-all duration-300 ease-out dark:border-white/[0.08] dark:bg-[hsl(228_22%_11%/0.92)] dark:shadow-[0_12px_40px_-22px_rgb(0_0_0/0.65)]",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent dark:before:via-white/10",
        "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-glow",
        isDragging &&
          "z-50 scale-[0.98] cursor-grabbing opacity-90 ring-2 ring-primary/45 ring-offset-2 ring-offset-background dark:ring-offset-background",
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b opacity-95",
          strip,
        )}
        aria-hidden
      />
      <div className="flex items-stretch gap-0 pl-3.5">
        {!demoMode ? (
          <button
            type="button"
            className="flex w-8 shrink-0 items-start justify-center border-r border-border/30 pt-3.5 text-muted-foreground transition-colors hover:border-primary/20 hover:bg-muted/30 hover:text-foreground dark:border-white/[0.06]"
            aria-label="Verslepen"
            {...listeners}
            {...attributes}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="size-4 opacity-70 group-hover:opacity-100" />
          </button>
        ) : null}
        <div
          role="button"
          tabIndex={0}
          aria-label={`Details van ${lead.full_name}`}
          onClick={() => onOpenDetail(lead)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenDetail(lead);
            }
          }}
          className="min-w-0 flex-1 cursor-pointer space-y-3 p-4 pl-3 text-left outline-none transition-colors hover:bg-muted/[0.08] focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-background"
        >
          <p className="min-w-0 text-[0.9375rem] font-semibold leading-snug tracking-tight text-foreground">
            <span className="block line-clamp-2 break-words">{lead.full_name}</span>
          </p>
          <div
            className="min-w-0"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <LeadStatusMenu
              leadId={lead.id}
              status={lead.status}
              demoMode={demoMode}
              compact
              className="max-w-full"
              stopPropagation
              onDemoStatusChange={onDemoLeadStatus}
            />
          </div>
          <AiTagBadges tags={lead.ai_tags} size="xs" />
          <div className="flex flex-wrap items-center gap-2 gap-x-3 text-2xs text-muted-foreground">
            {lead.estimated_value != null ? (
              <span className="rounded-lg border border-border/40 bg-muted/25 px-2 py-1 tabular-nums text-xs font-semibold text-foreground dark:border-white/[0.08] dark:bg-white/[0.04]">
                {formatCurrency(lead.estimated_value)}
              </span>
            ) : (
              <span className="rounded-lg border border-dashed border-border/50 px-2 py-1 text-muted-foreground">
                Geen waarde
              </span>
            )}
            {lead.phone ? (
              <span
                className="inline-flex max-w-full items-center gap-1 truncate rounded-lg border border-transparent px-1.5 py-0.5 tabular-nums hover:border-border/50 hover:bg-muted/20"
                title={lead.phone}
              >
                <Phone className="size-3 shrink-0 opacity-50" aria-hidden />
                {lead.phone}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function sumColumnValue(leads: Lead[]): number {
  return leads.reduce((acc, l) => acc + (typeof l.estimated_value === "number" ? l.estimated_value : 0), 0);
}

function ColumnDrop({
  id,
  label,
  children,
  count,
  totalValue,
}: {
  id: PipelineColumnId;
  label: string;
  children: React.ReactNode;
  count: number;
  totalValue: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${id}` });
  const theme = COLUMN_THEME[id];
  return (
    <div className="flex min-h-[420px] w-[min(82vw,300px)] max-w-full shrink-0 snap-start flex-col sm:w-[min(78vw,280px)] lg:min-h-[460px] xl:w-auto xl:min-w-0 xl:max-w-none xl:flex-1">
      <div className="relative mb-3 overflow-hidden rounded-2xl border border-border/40 bg-card/40 px-3.5 py-3 shadow-sm backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b opacity-90",
            theme.headerGlow,
          )}
          aria-hidden
        />
        <div className="relative flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[0.9375rem] font-bold tracking-tight text-foreground">
              {label}
            </h3>
            <p className="mt-0.5 text-2xs font-medium text-muted-foreground/80">{theme.hint}</p>
            <p className="mt-1.5 text-xs font-semibold tabular-nums tracking-tight text-foreground/95">
              {count} {count === 1 ? "lead" : "leads"} · {formatCurrency(totalValue)}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-2xs font-bold tabular-nums tracking-wide",
              theme.chip,
            )}
          >
            {count}
          </span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[min(52vh,520px)] flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden rounded-2xl border border-dashed p-3 shadow-inner transition-all duration-300 ease-out [contain:layout]",
          theme.dropIdle,
          isOver && cn("border-solid ring-2 ring-primary/20", theme.dropOver),
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function PipelineBoard({
  initialLeads,
  companyId,
  demoMode,
}: {
  initialLeads: Lead[];
  companyId: string;
  demoMode: boolean;
}) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [demoStatusById, setDemoStatusById] = useState<Record<string, LeadStatus>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pipelineDetailId, setPipelineDetailId] = useState<string | null>(null);
  const [pipelineDetailOpen, setPipelineDetailOpen] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    setLeads(initialLeads);
    setDemoStatusById({});
  }, [initialLeads]);

  useEffect(() => {
    if (demoMode) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`leads-pipeline-${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          router.refresh();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [companyId, demoMode, router]);

  const leadsForView = useMemo(
    () =>
      demoMode
        ? leads.map((l) => ({
            ...l,
            status: demoStatusById[l.id] ?? l.status,
          }))
        : leads,
    [leads, demoMode, demoStatusById],
  );

  const pipelineDetailLead = useMemo(
    () =>
      pipelineDetailId
        ? leadsForView.find((l) => l.id === pipelineDetailId) ?? null
        : null,
    [pipelineDetailId, leadsForView],
  );

  const openPipelineDetail = (l: Lead) => {
    setPipelineDetailId(l.id);
    setPipelineDetailOpen(true);
  };

  const byColumn = useMemo(() => {
    const map = new Map<PipelineColumnId, Lead[]>();
    for (const col of PIPELINE_COLUMNS) {
      map.set(col.id, []);
    }
    for (const lead of leadsForView) {
      const cid = columnIdForLeadStatus(lead.status);
      const list = map.get(cid) || [];
      list.push(lead);
      map.set(cid, list);
    }
    for (const col of PIPELINE_COLUMNS) {
      map.set(col.id, sortLeadsInColumn(map.get(col.id) || []));
    }
    return map;
  }, [leadsForView]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const activeLead = useMemo(() => {
    if (!activeId?.startsWith("lead-")) return null;
    const id = activeId.slice(5);
    return leadsForView.find((l) => l.id === id) ?? null;
  }, [activeId, leadsForView]);

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over || demoMode) return;

    let targetCol: PipelineColumnId | null = null;
    const overId = String(over.id);
    if (overId.startsWith("col-")) {
      targetCol = overId.slice(4) as PipelineColumnId;
    } else if (overId.startsWith("lead-")) {
      const lid = overId.slice(5);
      const l = leadsForView.find((x) => x.id === lid);
      if (l) targetCol = columnIdForLeadStatus(l.status);
    }
    if (!targetCol) return;

    const leadId = String(active.id).replace(/^lead-/, "");
    const col = PIPELINE_COLUMNS.find((c) => c.id === targetCol);
    if (!col) return;

    const lead = leadsForView.find((l) => l.id === leadId);
    if (!lead || lead.status === col.dropStatus) return;

    start(async () => {
      const prev = leads;
      setLeads((xs) =>
        xs.map((x) =>
          x.id === leadId ? { ...x, status: col.dropStatus } : x,
        ),
      );
      const res = await updateLeadStatus(leadId, col.dropStatus);
      if (!res.ok) {
        setLeads(prev);
        toast.error(res.error || "Status bijwerken mislukt.");
        return;
      }
      toast.success("Pipeline bijgewerkt.");
      router.refresh();
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={onDragEnd}
    >
      <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible overscroll-x-contain px-1 pb-8 pt-1 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch] min-[1200px]:mx-0 min-[1200px]:grid min-[1200px]:w-full min-[1200px]:snap-none min-[1200px]:grid-cols-5 min-[1200px]:gap-5 min-[1200px]:overflow-visible min-[1200px]:px-0 min-[1200px]:pb-10">
        {PIPELINE_COLUMNS.map((col) => {
          const list = byColumn.get(col.id) || [];
          return (
            <ColumnDrop
              key={col.id}
              id={col.id}
              label={col.label}
              count={list.length}
              totalValue={sumColumnValue(list)}
            >
              {list.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  demoMode={demoMode}
                  onOpenDetail={openPipelineDetail}
                  onDemoLeadStatus={
                    demoMode
                      ? (next) =>
                          setDemoStatusById((m) => ({
                            ...m,
                            [lead.id]: next,
                          }))
                      : undefined
                  }
                />
              ))}
            </ColumnDrop>
          );
        })}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeLead ? (
          <div className="relative w-[min(100vw-2rem,300px)] overflow-hidden rounded-2xl border border-primary/35 bg-card/98 p-4 pl-4 shadow-premium dark:border-primary/30 dark:bg-[hsl(228_22%_11%/0.98)]">
            <div
              className={cn(
                "absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b",
                leadStatusStrip(activeLead.status),
              )}
              aria-hidden
            />
            <p
              className="truncate pl-2.5 text-sm font-bold tracking-tight text-foreground"
              title={activeLead.full_name}
            >
              {activeLead.full_name}
            </p>
            <AiTagBadges tags={activeLead.ai_tags} className="mt-3 pl-2.5" size="xs" />
            {activeLead.estimated_value != null ? (
              <p className="mt-2 pl-2.5 text-xs font-semibold tabular-nums text-primary">
                {formatCurrency(activeLead.estimated_value)}
              </p>
            ) : null}
          </div>
        ) : null}
      </DragOverlay>
      {pending ? (
        <p className="sr-only" aria-live="polite">
          Bijwerken…
        </p>
      ) : null}
      {pipelineDetailLead ? (
        <LeadPipelineDetailDialog
          lead={pipelineDetailLead}
          open={pipelineDetailOpen}
          onOpenChange={(o) => {
            setPipelineDetailOpen(o);
            if (!o) setPipelineDetailId(null);
          }}
          demoMode={demoMode}
          onDemoStatusChange={
            demoMode
              ? (next) =>
                  setDemoStatusById((m) => ({
                    ...m,
                    [pipelineDetailLead.id]: next,
                  }))
              : undefined
          }
        />
      ) : null}
    </DndContext>
  );
}
