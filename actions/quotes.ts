"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import {
  canUseQuotes,
  entitlementUpgradeMessage,
} from "@/lib/billing/entitlements";
import type { ActionResult } from "@/actions/ai";
import type { QuoteLineItem, QuoteStatus } from "@/lib/types";

const VALID: QuoteStatus[] = ["draft", "sent", "accepted", "declined"];

function isQuoteStatus(s: string): s is QuoteStatus {
  return VALID.includes(s as QuoteStatus);
}

export async function updateQuoteStatus(
  quoteId: string,
  status: QuoteStatus,
): Promise<ActionResult<{ status: QuoteStatus }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  if (!isQuoteStatus(status)) {
    return { ok: false, error: "Ongeldige status." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId)
    .eq("company_id", auth.company.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/quotes");
  revalidatePath(`/dashboard/quotes/${quoteId}`);
  return { ok: true, data: { status } };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function normalizeQuoteLines(items: QuoteLineItem[]): QuoteLineItem[] {
  return items.map((li, i) => {
    const q = Math.max(0, Number(li.quantity) || 0);
    const u = Math.max(0, Number(li.unit_price) || 0);
    const line_total = round2(q * u);
    return {
      id:
        li.id && String(li.id).length > 0
          ? li.id
          : `li-${i}-${randomUUID().slice(0, 8)}`,
      description:
        String(li.description ?? "").trim() || `Regel ${i + 1}`,
      quantity: q,
      unit_price: u,
      line_total,
    };
  });
}

export async function updateQuoteContent(
  quoteId: string,
  input: {
    title: string;
    description: string | null;
    line_items: QuoteLineItem[];
    internal_notes: string | null;
    vat_rate: number;
  },
): Promise<ActionResult<{ saved: true }>> {
  if (isDemoMode()) {
    return { ok: false, error: "Niet beschikbaar in demo-modus." };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }

  const line_items = normalizeQuoteLines(input.line_items);
  if (line_items.length === 0) {
    return { ok: false, error: "Voeg minstens één regel toe." };
  }

  const vr = Number(input.vat_rate);
  if (!Number.isFinite(vr) || vr < 0 || vr > 1) {
    return { ok: false, error: "Ongeldig BTW-tarief." };
  }

  const subtotal = round2(
    line_items.reduce((s, li) => s + li.line_total, 0),
  );
  const vat_amount = round2(subtotal * vr);
  const total = round2(subtotal + vat_amount);

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("quotes")
    .select("lead_id")
    .eq("id", quoteId)
    .eq("company_id", auth.company.id)
    .maybeSingle();

  if (!existing) {
    return { ok: false, error: "Offerte niet gevonden." };
  }

  const { error } = await supabase
    .from("quotes")
    .update({
      title: input.title.trim() || "Offerte",
      description: input.description?.trim() || null,
      line_items,
      internal_notes: input.internal_notes?.trim() || null,
      subtotal,
      vat_rate: vr,
      vat_amount,
      total,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId)
    .eq("company_id", auth.company.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/quotes");
  revalidatePath(`/dashboard/quotes/${quoteId}`);
  const leadId = (existing as { lead_id: string | null }).lead_id;
  if (leadId) {
    revalidatePath(`/dashboard/leads/${leadId}`);
  }
  return { ok: true, data: { saved: true } };
}

/** Lege concept-offerte (handmatig); optioneel gekoppeld aan een lead. */
export async function createDraftQuote(
  leadId: string | null,
): Promise<ActionResult<{ quoteId: string }>> {
  if (isDemoMode()) {
    return {
      ok: false,
      error:
        "In de demo kun je geen nieuwe offerte in de database aanmaken. Bewerk de voorbeeld-offerte of ga naar Leads.",
    };
  }
  const auth = await getAuth();
  if (!auth.user || !auth.company) {
    return { ok: false, error: "Niet ingelogd." };
  }
  if (!canUseQuotes(auth.company)) {
    return { ok: false, error: entitlementUpgradeMessage("quotes") };
  }

  const supabase = await createClient();

  if (leadId) {
    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("id", leadId)
      .eq("company_id", auth.company.id)
      .maybeSingle();
    if (!lead) {
      return { ok: false, error: "Lead niet gevonden." };
    }
  }

  const line_items = normalizeQuoteLines([
    {
      id: "",
      description: "Nieuwe regel",
      quantity: 1,
      unit_price: 0,
      line_total: 0,
    },
  ]);

  const vat_rate = 0.21;
  const subtotal = 0;
  const vat_amount = 0;
  const total = 0;

  const { data: ins, error } = await supabase
    .from("quotes")
    .insert({
      company_id: auth.company.id,
      lead_id: leadId,
      title: "Nieuwe offerte",
      description: null,
      status: "draft",
      currency: "EUR",
      subtotal,
      vat_rate,
      vat_amount,
      total,
      line_items,
      internal_notes: null,
    })
    .select("id")
    .single();

  if (error || !ins) {
    return { ok: false, error: error?.message || "Offerte aanmaken mislukt." };
  }

  revalidatePath("/dashboard/quotes");
  if (leadId) {
    revalidatePath(`/dashboard/leads/${leadId}`);
  }
  return { ok: true, data: { quoteId: ins.id as string } };
}
