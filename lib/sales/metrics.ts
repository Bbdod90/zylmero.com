import type { Lead, LeadStatus } from "@/lib/types";

const PIPELINE: LeadStatus[] = [
  "new",
  "active",
  "quote_sent",
  "appointment_booked",
  "won",
];

export interface SalesMetrics {
  pipelineValue: number;
  potentialMonthlyRevenue: number;
  conversionRate: number;
  avgResponseHours: number | null;
  leadsLostCount: number;
  dealsWonCount: number;
  lostRevenueEstimate: number;
  missedReplyRevenueEstimate: number;
  funnel: { stage: LeadStatus; count: number }[];
}

export function computeSalesMetrics(
  leads: Lead[],
  opts: {
    avgResponseHours: number | null;
    staleReplyLeadIds: Set<string>;
  },
): SalesMetrics {
  const open = leads.filter((l) => !["won", "lost"].includes(l.status));
  const pipelineValue = open.reduce((s, l) => s + (l.estimated_value || 0), 0);

  const won = leads.filter((l) => l.status === "won");
  const lost = leads.filter((l) => l.status === "lost");
  const closed = won.length + lost.length;
  const conversionRate = closed === 0 ? 0 : won.length / closed;

  const wonValue = won.reduce((s, l) => s + (l.estimated_value || 0), 0);
  const potentialMonthlyRevenue = wonValue > 0 ? wonValue * 1.15 : pipelineValue * 0.28;

  const lostRevenueEstimate = lost.reduce((s, l) => s + (l.estimated_value || 0), 0);

  let missedReplyRevenueEstimate = 0;
  for (const l of leads) {
    if (opts.staleReplyLeadIds.has(l.id)) {
      missedReplyRevenueEstimate += (l.estimated_value || 0) * 0.35;
    }
  }

  const funnel = PIPELINE.map((stage) => ({
    stage,
    count: leads.filter((l) => l.status === stage).length,
  }));

  return {
    pipelineValue,
    potentialMonthlyRevenue,
    conversionRate,
    avgResponseHours: opts.avgResponseHours,
    leadsLostCount: lost.length,
    dealsWonCount: won.length,
    lostRevenueEstimate,
    missedReplyRevenueEstimate,
    funnel,
  };
}
