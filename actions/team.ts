"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManageTeam } from "@/lib/permissions";
import { resolveSiteUrl } from "@/lib/site-url";
export type TeamState = { ok?: boolean; error?: string; inviteUrl?: string };

function baseUrl() {
  return resolveSiteUrl();
}

export async function inviteTeamMember(
  _prev: TeamState,
  formData: FormData,
): Promise<TeamState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company || auth.companyRole == null) {
    return { error: "Niet ingelogd." };
  }
  if (!canManageTeam(auth.companyRole)) {
    return { error: "Geen rechten om uit te nodigen." };
  }
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const role = String(formData.get("role") || "medewerker");
  if (!email || !email.includes("@")) {
    return { error: "Geldig e-mailadres verplicht." };
  }
  if (role !== "admin" && role !== "medewerker") {
    return { error: "Ongeldige rol." };
  }

  const supabase = await createClient();
  const token = randomBytes(28).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

  const { error } = await supabase.from("company_invitations").insert({
    company_id: auth.company.id,
    email,
    role,
    token,
    expires_at: expires,
    invited_by: auth.user.id,
  });
  if (error) return { error: error.message };

  const inviteUrl = `${baseUrl()}/accept-invite?token=${encodeURIComponent(token)}`;
  revalidatePath("/dashboard/team");
  return { ok: true, inviteUrl };
}

export async function removeTeamMember(userId: string): Promise<TeamState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company || auth.companyRole == null) {
    return { error: "Niet ingelogd." };
  }
  if (!canManageTeam(auth.companyRole)) {
    return { error: "Geen rechten." };
  }
  if (userId === auth.user.id) {
    return { error: "Je kunt jezelf niet verwijderen." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("company_members")
    .delete()
    .eq("company_id", auth.company.id)
    .eq("user_id", userId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/team");
  return { ok: true };
}

export async function revokeInvitation(id: string): Promise<TeamState> {
  const auth = await getAuth();
  if (!auth.user || !auth.company || auth.companyRole == null) {
    return { error: "Niet ingelogd." };
  }
  if (!canManageTeam(auth.companyRole)) {
    return { error: "Geen rechten." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("company_invitations")
    .delete()
    .eq("id", id)
    .eq("company_id", auth.company.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/team");
  return { ok: true };
}

export async function acceptInvitation(
  token: string,
): Promise<TeamState> {
  const auth = await getAuth();
  if (!auth.user?.email) {
    return { error: "Log in om de uitnodiging te accepteren." };
  }
  const admin = createAdminClient();
  const { data: inv, error: ie } = await admin
    .from("company_invitations")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .maybeSingle();
  if (ie || !inv) {
    return { error: "Uitnodiging ongeldig of verlopen." };
  }
  if (new Date(inv.expires_at as string).getTime() < Date.now()) {
    return { error: "Uitnodiging is verlopen." };
  }
  const email = String(auth.user.email).toLowerCase();
  if (String(inv.email).toLowerCase() !== email) {
    return {
      error: "Deze uitnodiging hoort bij een ander e-mailadres. Log in met het juiste account.",
    };
  }

  const { error: me } = await admin.from("company_members").insert({
    company_id: inv.company_id as string,
    user_id: auth.user.id,
    role: inv.role as "admin" | "medewerker",
  });
  if (me) {
    if (me.code === "23505") {
      await admin
        .from("company_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", inv.id);
      revalidatePath("/dashboard");
      return { ok: true };
    }
    return { error: me.message };
  }

  await admin
    .from("company_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", inv.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/team");
  return { ok: true };
}

export async function getTeamInvitePreview(
  token: string,
): Promise<{ email: string; role: string; valid: boolean } | null> {
  const admin = createAdminClient();
  const { data: inv } = await admin
    .from("company_invitations")
    .select("email, role, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();
  if (!inv || inv.accepted_at) return null;
  if (new Date(inv.expires_at as string).getTime() < Date.now()) {
    return null;
  }
  return {
    email: inv.email as string,
    role: inv.role as string,
    valid: true,
  };
}
