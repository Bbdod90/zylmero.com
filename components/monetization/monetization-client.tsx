"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UPGRADE_NUDGE_TITLE } from "@/lib/billing/paywall";

function nudgeDescription(
  reason: "leads" | "quotes" | "ai" | null,
): string {
  if (reason === "quotes") {
    return "Je hebt al een offerte — elke seconde telt. Upgrade om AI en opvolging niet te verliezen.";
  }
  if (reason === "ai") {
    return "Je gebruikt de AI al intensief — upgrade om onbeperkt door te gaan.";
  }
  return "Je krijgt al aanvragen — upgrade om door te gaan zonder leads te verliezen.";
}

export function MonetizationClient({
  companyId,
  plan,
  showUpgradeNudge,
  nudgeReason,
}: {
  companyId: string;
  plan: string;
  showUpgradeNudge: boolean;
  nudgeReason?: "leads" | "quotes" | "ai" | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    let changed = false;
    if (sp.get("paid") === "1") {
      toast.success("Betaling geslaagd — je AI is live.", {
        description: "Je bent terug op het dashboard. Leads wachten niet.",
      });
      sp.delete("paid");
      changed = true;
    }
    if (sp.get("welcome") === "1") {
      toast.message("Waarde-moment voltooid", {
        description: "Antwoord in minuten, niet in uren — daar zit het geld.",
      });
      sp.delete("welcome");
      changed = true;
    }
    if (changed) {
      const q = sp.toString();
      const path = window.location.pathname;
      router.replace(q ? `${path}?${q}` : path);
    }
  }, [router]);

  useEffect(() => {
    if (!showUpgradeNudge || plan !== "trial") return;
    const k = `cf_nudge_${companyId}`;
    try {
      if (sessionStorage.getItem(k)) return;
    } catch {
      return;
    }
    setOpen(true);
  }, [showUpgradeNudge, plan, companyId]);

  function dismiss() {
    try {
      sessionStorage.setItem(`cf_nudge_${companyId}`, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && dismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{UPGRADE_NUDGE_TITLE}</DialogTitle>
          <DialogDescription>
            {nudgeDescription(nudgeReason ?? null)}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" className="h-12 rounded-xl px-6" onClick={dismiss}>
            Nu niet
          </Button>
          <Button
            asChild
            className="h-12 rounded-xl px-8 text-base font-bold shadow-lg shadow-primary/25"
          >
            <Link href="/dashboard/upgrade" onClick={dismiss}>
              Nu upgraden
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
