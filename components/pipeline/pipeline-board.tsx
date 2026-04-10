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
import type { Lead } from "@/lib/types";
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
import Link from "next/link";
import { GripVertical } from "lucide-react";

function LeadCard({ lead, demoMode }: { lead: Lead; demoMode: boolean }) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl border border-border/50 bg-card/90 p-4 shadow-sm transition-shadow dark:border-white/[0.07]",
        isDragging && "z-50 opacity-90 ring-2 ring-primary/40",
      )}
    >
      <div className="flex items-start gap-2">
        {!demoMode ? (
          <button
            type="button"
            className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Verslepen"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="size-4" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/dashboard/leads/${lead.id}`}
              className="text-sm font-semibold leading-tight hover:text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {lead.full_name}
            </Link>
            <LeadStatusMenu
              leadId={lead.id}
              status={lead.status}
              demoMode={demoMode}
              compact
              className="max-w-[min(100%,11rem)] shrink-0"
            />
          </div>
          <AiTagBadges tags={lead.ai_tags} size="xs" />
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-2xs text-muted-foreground">
            {lead.estimated_value != null ? (
              <span className="tabular-nums font-medium text-foreground/90">
                {formatCurrency(lead.estimated_value)}
              </span>
            ) : (
              <span>—</span>
            )}
            {lead.phone ? <span>{lead.phone}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ColumnDrop({
  id,
  label,
  children,
  count,
}: {
  id: PipelineColumnId;
  label: string;
  children: React.ReactNode;
  count: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${id}` });
  return (
    <div className="flex min-h-[420px] w-[min(85vw,280px)] shrink-0 flex-col min-[1100px]:w-auto min-[1100px]:min-w-0 min-[1100px]:max-w-none min-[1100px]:flex-1">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold tracking-tight">{label}</h3>
        <span className="rounded-full bg-muted/80 px-2 py-0.5 text-2xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2.5 overflow-y-auto rounded-2xl border border-dashed border-border/60 bg-muted/20 p-2.5 dark:border-white/[0.08] dark:bg-white/[0.02]",
          isOver && "border-primary/50 bg-primary/[0.04]",
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    setLeads(initialLeads);
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

  const byColumn = useMemo(() => {
    const map = new Map<PipelineColumnId, Lead[]>();
    for (const col of PIPELINE_COLUMNS) {
      map.set(col.id, []);
    }
    for (const lead of leads) {
      const cid = columnIdForLeadStatus(lead.status);
      const list = map.get(cid) || [];
      list.push(lead);
      map.set(cid, list);
    }
    for (const col of PIPELINE_COLUMNS) {
      map.set(col.id, sortLeadsInColumn(map.get(col.id) || []));
    }
    return map;
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const activeLead = useMemo(() => {
    if (!activeId?.startsWith("lead-")) return null;
    const id = activeId.slice(5);
    return leads.find((l) => l.id === id) ?? null;
  }, [activeId, leads]);

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
      const l = leads.find((x) => x.id === lid);
      if (l) targetCol = columnIdForLeadStatus(l.status);
    }
    if (!targetCol) return;

    const leadId = String(active.id).replace(/^lead-/, "");
    const col = PIPELINE_COLUMNS.find((c) => c.id === targetCol);
    if (!col) return;

    const lead = leads.find((l) => l.id === leadId);
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
      <div className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-4 min-[1100px]:mx-0 min-[1100px]:grid min-[1100px]:w-full min-[1100px]:grid-cols-5 min-[1100px]:gap-4 min-[1100px]:overflow-visible min-[1100px]:px-0">
        {PIPELINE_COLUMNS.map((col) => {
          const list = byColumn.get(col.id) || [];
          return (
            <ColumnDrop
              key={col.id}
              id={col.id}
              label={col.label}
              count={list.length}
            >
              {list.map((lead) => (
                <LeadCard key={lead.id} lead={lead} demoMode={demoMode} />
              ))}
            </ColumnDrop>
          );
        })}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeLead ? (
          <div className="w-[min(100vw-2rem,280px)] rounded-2xl border border-primary/30 bg-card p-4 shadow-xl">
            <p className="text-sm font-semibold">{activeLead.full_name}</p>
            <AiTagBadges tags={activeLead.ai_tags} className="mt-2" size="xs" />
          </div>
        ) : null}
      </DragOverlay>
      {pending ? (
        <p className="sr-only" aria-live="polite">
          Bijwerken…
        </p>
      ) : null}
    </DndContext>
  );
}
