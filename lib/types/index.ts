export type LeadStatus =
  | "new"
  | "active"
  | "quote_sent"
  | "appointment_booked"
  | "won"
  | "lost";

export type MessageRole = "user" | "assistant" | "staff" | "system";

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined";

/** Billing plan id — maps to Stripe price IDs later. */
export type BillingPlanId = "trial" | "starter" | "growth" | "pro";

/** Mirrors Stripe subscription.status values we persist */
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export interface Company {
  id: string;
  name: string;
  owner_user_id: string;
  onboarding_completed: boolean;
  /** false na overslaan wizard; true na volledige flow of opslaan Bedrijf in Instellingen */
  profile_intake_completed: boolean;
  /** Canonical niche id (lib/niches.ts), bijv. garage, hair_salon */
  niche: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  /** When the current trial or paid period started */
  trial_starts_at: string | null;
  /** Trial access ends here when plan is `trial` */
  trial_ends_at: string | null;
  /** Current plan tier */
  plan: BillingPlanId;
  /** Account enabled (e.g. false after cancellation) */
  is_active: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus | null;
  current_period_end: string | null;
  /** First-win demo completed → user may use main dashboard */
  value_moment_completed_at: string | null;
  /** Unieke uitnodigingscode voor referrals (hoofdletters/cijfers) */
  referral_code: string | null;
  /** Publieke token voor website-widget embed */
  widget_embed_token: string | null;
  created_at: string;
  updated_at: string;
}

/** WhatsApp channel config — extensible for Twilio / Meta Cloud API */
export interface WhatsAppChannelSettings {
  provider: "mock" | "twilio" | "meta";
  connected: boolean;
  /** E.164 or display phone for UI */
  phone_number?: string | null;
  /** Twilio: Messaging Service SID or From number; Meta: phone_number_id */
  external_id?: string | null;
  /** Last inbound sync (ISO) */
  last_sync_at?: string | null;
}

export interface KnowledgeSnippet {
  title: string;
  body: string;
}

export interface AiKnowledgePage {
  url: string;
  title: string;
  excerpt: string;
  saved_at: string;
}

export interface CompanySettings {
  company_id: string;
  niche: string | null;
  services: string[];
  faq: { q: string; a: string }[];
  pricing_hints: string | null;
  business_hours: Record<string, string>;
  booking_link: string | null;
  tone: string | null;
  reply_style: string | null;
  language: string;
  automation_preferences: Record<string, unknown>;
  whatsapp_channel: WhatsAppChannelSettings;
  auto_reply_enabled: boolean;
  auto_reply_delay_seconds: number;
  ai_usage_count: number;
  /** Eerste AI bulk-setup (diensten/FAQ/automations) voltooid */
  ai_setup_completed_at: string | null;
  /** Dynamische onboarding-antwoorden */
  niche_intake: Record<string, string>;
  /** Extra kennis voor AI */
  knowledge_snippets: KnowledgeSnippet[];
  /** Publieke website-URL als bron voor AI-antwoorden (ook in automation_preferences). */
  ai_knowledge_website: string | null;
  /** Geüploade of geplakte tekst als kennis voor AI (ook in automation_preferences). */
  ai_knowledge_document: string | null;
  /** Inkomende e-mail via webhook naar Berichten (ook in automation_preferences). */
  email_inbound_enabled: boolean;
  white_label_logo_url: string | null;
  white_label_primary: string | null;
  /** Vaste intro op PDF/offertepagina (automation_preferences.quote_intro) */
  quote_intro: string | null;
  /** Voettekst: voorwaarden, betalingstermijn (automation_preferences.quote_footer) */
  quote_footer: string | null;
  /** Prijshints uit Kennis op offerte/PDF tonen */
  quote_include_pricing_hints: boolean;
  /** Standaard Zylmero-vermelding onderaan offerte/PDF */
  quote_include_zylmero_notice: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | "new_lead"
  | "hot_lead"
  | "no_reply_risk"
  | "quote_accepted";

export interface AppNotification {
  id: string;
  company_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  read_at: string | null;
  dedupe_key: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/** AI- en handmatige labels voor leads */
export type LeadAiTag =
  | "spoed"
  | "hoge_waarde"
  | "prijsvraag"
  | "klacht"
  | "opvolging"
  | "nieuwe_klant";

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
  suggested_next_action: string | null;
  status_recommendation: string | null;
  last_message_at: string | null;
  notes: string | null;
  /** Niche-specifieke velden */
  custom_fields?: Record<string, string>;
  /** AI-tags (subset van LeadAiTag of vrije slug) */
  ai_tags?: string[];
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
}

export type CompanyRole = "owner" | "admin" | "medewerker";

export interface ReplyTemplate {
  id: string;
  company_id: string;
  title: string;
  body: string;
  shortcut: string | null;
  created_at: string;
  updated_at: string;
}

export type AutomationIfType =
  | "lead_is_hot"
  | "no_reply_hours"
  | "status_is_new";

export type AutomationThenType =
  | "notify_in_app"
  | "queue_followup_copy"
  | "send_ai_reply"
  | "send_followup_message";

export interface AutomationRule {
  id: string;
  company_id: string;
  name: string;
  enabled: boolean;
  if_type: AutomationIfType;
  if_config: Record<string, unknown>;
  then_type: AutomationThenType;
  then_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CompanyMemberRow {
  company_id: string;
  user_id: string;
  role: "admin" | "medewerker";
  created_at: string;
}

export interface TeamActivityRow {
  id: string;
  company_id: string;
  user_id: string | null;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface Conversation {
  id: string;
  company_id: string;
  lead_id: string;
  channel: string;
  title: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  /** Kanaal per bericht indien gezet */
  channel?: string | null;
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
  line_items: QuoteLineItem[];
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
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
  updated_at: string;
}

export interface Automation {
  id: string;
  company_id: string;
  name: string;
  trigger_type: string;
  delay_minutes: number;
  template_text: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const LEAD_PIPELINE: LeadStatus[] = [
  "new",
  "active",
  "quote_sent",
  "appointment_booked",
  "won",
];

export interface ConversationSummaryResult {
  summary: string;
  intent: string;
  score: number;
  estimated_value: number;
  suggested_next_action: string;
  status_recommendation: LeadStatus;
}

export interface QuoteDraftResult {
  title: string;
  description: string;
  items: Omit<QuoteLineItem, "id">[];
  subtotal: number;
  vat: number;
  total: number;
  notes: string;
}

export interface LeadProgressionResult {
  next_stage: LeadStatus;
  urgency: "low" | "medium" | "high";
  confidence: number;
}

/** Founder internal outreach CRM — not customer leads */
export type FounderSalesChannel = "instagram" | "whatsapp" | "email";

export type FounderSalesStatus =
  | "contacted"
  | "replied"
  | "demo_sent"
  | "interested"
  | "closed"
  | "lost";

export interface FounderSalesProspect {
  id: string;
  business_name: string;
  contact_name: string | null;
  channel: FounderSalesChannel;
  status: FounderSalesStatus;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  notes: string | null;
  last_outbound_at: string | null;
  first_reply_at: string | null;
  instagram_handle: string | null;
  contact_email: string | null;
  whatsapp_e164: string | null;
  messages_sent_count: number;
  replies_received_count: number;
  demos_sent_count: number;
  created_at: string;
  updated_at: string;
}

export interface FounderSalesSettings {
  id: string;
  daily_contact_goal: number;
  contacts_completed_today: number;
  goal_date: string;
  updated_at: string;
}

export interface FounderSalesStats {
  messagesSent: number;
  replies: number;
  demos: number;
  closed: number;
  lost: number;
  total: number;
  /** closed / total prospects */
  conversionRate: number;
  /** closed / (closed + lost) */
  winRate: number;
}

export interface FounderSalesReminder {
  id: string;
  business_name: string;
  kind: "follow_up_today" | "no_response_24h";
}
