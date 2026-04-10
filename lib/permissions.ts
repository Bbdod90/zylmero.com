import type { CompanyRole } from "@/lib/types";

export function canManageTeam(role: CompanyRole | null): boolean {
  return role === "owner" || role === "admin";
}

export function canManageBilling(role: CompanyRole | null): boolean {
  return role === "owner";
}
