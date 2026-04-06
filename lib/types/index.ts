export type LeadStatus =
  | "new"
  | "active"
  | "quote_sent"
  | "appointment_booked"
  | "won"
  | "lost";

export type MessageRole = "user" | "assistant" | "staff" | "system";

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined";

export interface Company {
  id: string;
  name: string;
  owner_id: string;
  onboarding_completed: boolean;
  created_at: string;
}

export interface CompanySettings {
  company_id: string;
  niche: string | null;
  services: string[] | null;
  faq: Record<string, string>[] | null;
  pricing_hints: string | null;
  business_hours: Record<string, unknown> | null;
  tone: string | null;
  language: string | null;
  updated_at: string | null;
}

export interface Lead {
  id: string;
  company_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  score: number | null;
  summary: string | null;
  intent: string | null;
  estimated_value: number | null;
  suggested_next_step: string | null;
  last_message_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  company_id: string;
  lead_id: string;
  channel: string | null;
  title: string | null;
  last_message_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Quote {
  id: string;
  company_id: string;
  lead_id: string | null;
  title: string;
  description: string | null;
  status: QuoteStatus;
  currency: string;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  line_items: QuoteLineItem[] | null;
  internal_notes: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  company_id: string;
  lead_id: string | null;
  starts_at: string;
  ends_at: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface Automation {
  id: string;
  company_id: string;
  name: string;
  trigger_type: string;
  action_type: string;
  config: Record<string, unknown> | null;
  enabled: boolean;
  created_at: string;
}

export interface ConversationSummaryResult {
  summary: string;
  intent: string;
  score: number;
  estimated_value: number;
  suggested_next_step: string;
}

export interface QuoteDraftResult {
  title: string;
  description: string;
  line_items: Omit<QuoteLineItem, "id">[];
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  internal_notes: string;
}

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "new",
  "active",
  "quote_sent",
  "appointment_booked",
  "won",
];

export function nextLeadStatus(
  current: LeadStatus,
): LeadStatus | null {
  if (current === "lost" || current === "won") return null;
  const idx = LEAD_STATUS_ORDER.indexOf(current);
  if (idx === -1 || idx >= LEAD_STATUS_ORDER.length - 1) return null;
  return LEAD_STATUS_ORDER[idx + 1]!;
}
