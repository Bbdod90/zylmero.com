import type { DashboardBundle } from "@/lib/queries/dashboard";
import type { LeadDetailPayload } from "@/lib/queries/lead-detail";
import type { InboxThread } from "@/lib/queries/inbox";
import type { SlaAnalysis } from "@/lib/queries/sla";
import type { RevenueMetrics } from "@/lib/queries/revenue";
import { DEMO_COMPANY_ID } from "@/lib/demo/company";
import { getDemoNicheId } from "@/lib/demo/niche-context";
import { getDatasetForNiche } from "@/lib/demo/variant-datasets";
import type { Conversation, Lead } from "@/lib/types";

function buildConversations(
  leads: Lead[],
  convIdForIndex: (i: number) => string,
): Conversation[] {
  const channels = ["whatsapp", "webchat", "email"] as const;
  return leads.map((l, i) => {
    const first = l.full_name.split(/\s+/)[0] ?? l.full_name;
    const title = l.intent
      ? `${first} · ${l.intent}`
      : `Gesprek · ${l.full_name}`;
    return {
      id: convIdForIndex(i),
      company_id: DEMO_COMPANY_ID,
      lead_id: l.id,
      channel: channels[i % channels.length],
      title,
      last_message_at: l.last_message_at,
      created_at: l.created_at,
      updated_at: l.updated_at,
    };
  });
}

function activeParts() {
  const nicheId = getDemoNicheId();
  const ds = getDatasetForNiche(nicheId);
  const { leads, messages, quotes, appointments } = ds;

  let convIdForIndex: (i: number) => string;
  if (nicheId === "hair_salon") {
    convIdForIndex = (i) => `demo-h-c${i}`;
  } else if (nicheId === "plumber") {
    convIdForIndex = (i) => `demo-p-c${i}`;
  } else {
    convIdForIndex = (i) => `demo-c${i}`;
  }

  const convs = buildConversations(leads, convIdForIndex);

  return {
    nicheId,
    demoLeads: leads,
    demoConvs: convs,
    demoMessages: messages,
    demoQuotes: quotes,
    demoAppts: appointments,
  };
}

export function getDemoDashboardBundle(): DashboardBundle {
  const { demoLeads, demoConvs, demoMessages, demoQuotes, demoAppts } =
    activeParts();

  const conversations: DashboardBundle["conversations"] = demoConvs.map(
    (c, i) => ({
      ...c,
      lead: demoLeads[i]!,
      preview:
        demoMessages
          .filter((m) => m.conversation_id === c.id)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )[0]?.content?.slice(0, 140) ||
        "Recent gesprek — reageer om deze aanvraag vast te houden.",
    }),
  );

  const sortedMsgs = [...demoMessages].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ).slice(0, 24);
  const convToLead = new Map(demoConvs.map((c) => [c.id, c.lead_id]));
  const leadName = (id: string) =>
    demoLeads.find((l) => l.id === id)?.full_name ?? null;

  return {
    leads: demoLeads,
    conversations,
    quotes: demoQuotes,
    appointments: demoAppts,
    recentMessages: sortedMsgs.map((m) => {
      const lid = convToLead.get(m.conversation_id);
      return {
        ...m,
        lead_name: lid ? leadName(lid) : null,
      };
    }),
  };
}

export function getDemoSla(): SlaAnalysis {
  const { demoLeads } = activeParts();
  const staleId = demoLeads.find((l) => l.id === "demo-l4")?.id ?? demoLeads[3]?.id;
  return {
    avgResponseHours: 0.85,
    staleReplyLeadIds: new Set(staleId ? [staleId] : []),
  };
}

/** Realistische omzetcijfers voor demo-dashboard (geen lege €0-kaart). */
export function getDemoRevenueMetrics(): RevenueMetrics {
  return {
    wonRevenueEur: 48_266,
    acceptedQuotes: 14,
    byMonth: {
      "2026-01": 12_400,
      "2026-02": 15_820,
      "2026-03": 20_046,
    },
  };
}

export function getDemoLeadDetail(leadId: string): LeadDetailPayload | null {
  const { demoLeads, demoConvs, demoMessages, demoQuotes, demoAppts } =
    activeParts();
  const lead = demoLeads.find((l) => l.id === leadId);
  if (!lead) return null;
  const idx = demoLeads.indexOf(lead);
  const conv = demoConvs[idx] ?? null;
  const messages = conv
    ? demoMessages
        .filter((m) => m.conversation_id === conv.id)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        )
    : [];
  const quotes = demoQuotes.filter((q) => q.lead_id === leadId);
  const appointments = demoAppts.filter((a) => a.lead_id === leadId);
  return {
    lead,
    conversation: conv,
    messages,
    quotes,
    appointments,
  };
}

export function getDemoInboxThreads(): InboxThread[] {
  const { demoLeads, demoConvs, demoMessages } = activeParts();
  return demoConvs.map((c, i) => {
    const lead = demoLeads[i]!;
    const list = demoMessages
      .filter((m) => m.conversation_id === c.id)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    const last = list[list.length - 1];
    return {
      conversation: c,
      lead,
      messages: list,
      preview: last?.content?.slice(0, 160) || "",
      lastAt: last?.created_at || c.created_at,
    };
  });
}
