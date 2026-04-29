import type { SupabaseClient } from "@supabase/supabase-js";

export type SocialProvider =
  | "meta"
  | "tiktok"
  | "linkedin"
  | "google_calendar"
  | "apple_calendar"
  | "google_email"
  | "microsoft_email";

export type SocialConnectionStatus =
  | "disconnected"
  | "pending"
  | "connected"
  | "error";

export type CompanySocialConnection = {
  id: string;
  company_id: string;
  provider: SocialProvider;
  status: SocialConnectionStatus;
  display_name: string | null;
  external_page_id: string | null;
  metadata: Record<string, unknown>;
  last_error: string | null;
  updated_at: string;
};

function mapRow(raw: Record<string, unknown>): CompanySocialConnection {
  return {
    id: raw.id as string,
    company_id: raw.company_id as string,
    provider: raw.provider as SocialProvider,
    status: raw.status as SocialConnectionStatus,
    display_name: (raw.display_name as string) ?? null,
    external_page_id: (raw.external_page_id as string) ?? null,
    metadata:
      typeof raw.metadata === "object" && raw.metadata !== null
        ? (raw.metadata as Record<string, unknown>)
        : {},
    last_error: (raw.last_error as string) ?? null,
    updated_at: raw.updated_at as string,
  };
}

export async function fetchSocialConnections(
  supabase: SupabaseClient,
  companyId: string,
): Promise<CompanySocialConnection[]> {
  const { data, error } = await supabase
    .from("company_social_connections")
    .select(
      "id, company_id, provider, status, display_name, external_page_id, metadata, last_error, updated_at",
    )
    .eq("company_id", companyId)
    .order("provider");

  if (error) {
    console.error("[social-connections]", error.message);
    return [];
  }
  return (data || []).map((r) => mapRow(r as Record<string, unknown>));
}
