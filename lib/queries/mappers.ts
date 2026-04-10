import type { Lead } from "@/lib/types";

export function fetchLeadRow(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    company_id: row.company_id as string,
    full_name: row.full_name as string,
    email: (row.email as string) ?? null,
    phone: (row.phone as string) ?? null,
    source: (row.source as string) ?? null,
    status: row.status as Lead["status"],
    score: row.score != null ? Number(row.score) : null,
    summary: (row.summary as string) ?? null,
    intent: (row.intent as string) ?? null,
    estimated_value:
      row.estimated_value != null ? Number(row.estimated_value) : null,
    suggested_next_action: (row.suggested_next_action as string) ?? null,
    status_recommendation: (row.status_recommendation as string) ?? null,
    last_message_at: (row.last_message_at as string) ?? null,
    notes: (row.notes as string) ?? null,
    custom_fields:
      (row.custom_fields as Record<string, string> | undefined) &&
      typeof row.custom_fields === "object" &&
      row.custom_fields !== null &&
      !Array.isArray(row.custom_fields)
        ? (row.custom_fields as Record<string, string>)
        : {},
    ai_tags: Array.isArray(row.ai_tags)
      ? (row.ai_tags as string[]).filter((t) => typeof t === "string")
      : [],
    assigned_to:
      typeof row.assigned_to === "string" ? row.assigned_to : null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
