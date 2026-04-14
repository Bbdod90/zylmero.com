"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createLead } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

const SOURCES = [
  "Website",
  "Google Maps",
  "WhatsApp",
  "Referral",
  "Facebook",
  "Instagram",
  "Cold call",
];

export function NewLeadDialog({
  disabled,
  demoMode = false,
  demoSampleLeadId = null,
}: {
  disabled?: boolean;
  demoMode?: boolean;
  /** Demo: na submit naar dit voorbeeld navigeren. */
  demoSampleLeadId?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="h-12 min-h-[44px] rounded-xl px-5"
          disabled={disabled}
        >
          <Plus className="mr-2 size-4" />
          Nieuwe lead
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuwe lead</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            start(async () => {
              const full_name = String(fd.get("full_name") || "").trim();
              const email = String(fd.get("email") || "").trim();
              const phone = String(fd.get("phone") || "").trim();
              const source = String(fd.get("source") || "").trim();
              if (demoMode) {
                toast.success(
                  `Demo: “${full_name || "Nieuwe lead"}” — zo werkt aanmaken. In je echte account wordt dit opgeslagen.`,
                );
                setOpen(false);
                if (demoSampleLeadId) {
                  router.push(`/dashboard/leads/${demoSampleLeadId}`);
                }
                return;
              }
              const res = await createLead({
                full_name,
                email: email || null,
                phone: phone || null,
                source: source || null,
              });
              if (!res.ok) {
                toast.error(res.error);
                return;
              }
              toast.success("Lead aangemaakt");
              setOpen(false);
              router.push(`/dashboard/leads/${res.data.leadId}`);
              router.refresh();
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="full_name">Naam</Label>
            <Input
              id="full_name"
              name="full_name"
              required
              className="rounded-xl"
              placeholder="Jan de Vries"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail (optioneel)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefoon (optioneel)</Label>
            <Input id="phone" name="phone" type="tel" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Bron</Label>
            <select
              id="source"
              name="source"
              className="flex h-12 w-full rounded-xl border border-white/[0.08] bg-background/50 px-3 text-sm shadow-inner-soft"
            >
              <option value="">—</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s === "Referral"
                    ? "Doorverwijzing"
                    : s === "Cold call"
                      ? "Koude acquisitie"
                      : s}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            className="w-full rounded-xl"
            disabled={pending}
          >
            {pending ? "Opslaan…" : demoMode ? "Demo: voorbeeld doorlopen" : "Lead aanmaken"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
