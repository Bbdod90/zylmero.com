import type { Company } from "@/lib/types";
import { hasSubscriptionAccess } from "@/lib/billing/trial";

/** Comma-gescheiden Supabase `auth.users.id` UUIDs — zie `.env.example` (`PLATFORM_HOST_USER_IDS`). */
export function getPlatformHostUserIdsFromEnv(): string[] {
  const raw = process.env.PLATFORM_HOST_USER_IDS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Platform-host (jij): volledige producttoegang ongeacht Stripe-status. */
export function isPlatformHostUser(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return getPlatformHostUserIdsFromEnv().includes(userId);
}

/**
 * Dashboard en ingelogde product-acties: normaal `hasSubscriptionAccess` (trial actief of betaald).
 * Host user IDs mogen altijd door.
 */
export function hasEffectiveProductAccess(
  company: Company,
  userId: string | null | undefined,
): boolean {
  if (isPlatformHostUser(userId)) return true;
  return hasSubscriptionAccess(company);
}
