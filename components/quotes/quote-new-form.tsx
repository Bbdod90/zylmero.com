"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createDraftQuote } from "@/actions/quotes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export type LeadOption = { id: string; full_name: string };

export function QuoteNewForm({ leads }: { leads: LeadOption[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <form
      className="cf-dashboard-panel mx-auto max-w-xl space-y-6 p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const raw = fd.get("lead_id");
        const leadId =
          typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null;
        start(async () => {
          const res = await createDraftQuote(leadId);
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          router.push(`/dashboard/quotes/${res.data.quoteId}`);
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="lead_id">Lead (optioneel)</Label>
        <select
          id="lead_id"
          name="lead_id"
          className="h-11 w-full rounded-lg border border-border/60 bg-background px-3 text-sm shadow-sm dark:border-white/[0.1] dark:bg-background/60"
          defaultValue=""
        >
          <option value="">— Geen lead —</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.full_name}
            </option>
          ))}
        </select>
        <p className="text-2xs text-muted-foreground">
          Je kunt de koppeling later nog wijzigen via de offerte of de lead.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" className="rounded-lg" disabled={pending}>
          {pending ? "Aanmaken…" : "Concept aanmaken"}
        </Button>
        <Button type="button" variant="secondary" className="rounded-lg" asChild>
          <Link href="/dashboard/quotes">Annuleren</Link>
        </Button>
      </div>
    </form>
  );
}
