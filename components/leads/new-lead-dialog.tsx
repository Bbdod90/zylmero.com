"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Globe,
  MapPin,
  MessageCircle,
  HeartHandshake,
  Share2,
  Camera,
  PhoneForwarded,
  CircleDot,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createLead } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SourceChoice = {
  /** Opgeslagen in leads.source (Engels, bestaande data blijft matchen). */
  value: string;
  title: string;
  hint: string;
  Icon: LucideIcon;
};

const SOURCE_CHOICES: SourceChoice[] = [
  {
    value: "",
    title: "Nog niet zeker",
    hint: "Kies je later — handig als iemand je belt zonder duidelijke herkomst.",
    Icon: CircleDot,
  },
  {
    value: "Website",
    title: "Eigen website",
    hint: "Contactformulier, landingspagina of chat op je site.",
    Icon: Globe,
  },
  {
    value: "Google Maps",
    title: "Google Maps",
    hint: "Iemand vond je via zoeken of je bedrijfsprofiel.",
    Icon: MapPin,
  },
  {
    value: "WhatsApp",
    title: "WhatsApp",
    hint: "Eerste contact via je zakelijke WhatsApp.",
    Icon: MessageCircle,
  },
  {
    value: "Referral",
    title: "Aanbeveling",
    hint: "Via een klant, buur of partner die je doorgaf.",
    Icon: HeartHandshake,
  },
  {
    value: "Facebook",
    title: "Facebook",
    hint: "Bericht, reactie of advertentie op Facebook.",
    Icon: Share2,
  },
  {
    value: "Instagram",
    title: "Instagram",
    hint: "DM, reactie of link in je bio.",
    Icon: Camera,
  },
  {
    value: "Cold call",
    title: "Zelf benaderd",
    hint: "Jij nam contact op — bijvoorbeeld gebeld of langs geweest.",
    Icon: PhoneForwarded,
  },
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
  const [source, setSource] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSource("");
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          className="h-10 min-h-[40px] rounded-xl px-4 text-sm font-semibold shadow-sm"
          disabled={disabled}
        >
          <Plus className="mr-2 size-4" strokeWidth={2.25} aria-hidden />
          Nieuwe klant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(90dvh,720px)] overflow-y-auto rounded-[1.25rem] border-border/60 bg-card p-0 shadow-[0_24px_80px_-32px_rgb(15_23_42/0.35)] sm:max-w-lg">
        <div className="border-b border-border/50 bg-gradient-to-br from-primary/[0.06] to-transparent px-6 pb-5 pt-6 dark:border-white/[0.08]">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold tracking-[-0.02em]">
              Nieuwe klant toevoegen
            </DialogTitle>
            <DialogDescription className="text-[0.9375rem] font-medium leading-relaxed text-foreground/65">
              Vul de naam in en kies waar deze persoon vandaan komt. Je kunt alles later nog aanpassen op het
              klantprofiel.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          className="space-y-6 px-6 pb-6 pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            start(async () => {
              const full_name = String(fd.get("full_name") || "").trim();
              const email = String(fd.get("email") || "").trim();
              const phone = String(fd.get("phone") || "").trim();
              const src = String(fd.get("source") || "").trim();
              if (demoMode) {
                toast.success(
                  `Demo: “${full_name || "Nieuwe klant"}” — zo werkt aanmaken. In je echte account wordt dit opgeslagen.`,
                );
                setOpen(false);
                setSource("");
                if (demoSampleLeadId) {
                  router.push(`/dashboard/leads/${demoSampleLeadId}`);
                }
                return;
              }
              const res = await createLead({
                full_name,
                email: email || null,
                phone: phone || null,
                source: src || null,
              });
              if (!res.ok) {
                toast.error(res.error, {
                  duration: 12_000,
                  description: /full_name|migrat|schema|database/i.test(res.error || "")
                    ? "Er ging iets mis aan onze kant. Vernieuw de pagina of neem contact op met support als het zo blijft."
                    : undefined,
                });
                return;
              }
              toast.success("Klant toegevoegd aan je overzicht");
              setOpen(false);
              setSource("");
              router.push(`/dashboard/leads/${res.data.leadId}`);
              router.refresh();
            });
          }}
        >
          <input type="hidden" name="source" value={source} />

          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-semibold text-foreground">
              Naam
            </Label>
            <Input
              id="full_name"
              name="full_name"
              required
              autoComplete="name"
              className="h-11 rounded-xl border-border/60 text-[0.9375rem] shadow-sm"
              placeholder="Bijvoorbeeld Jan de Vries"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                E-mail{" "}
                <span className="font-normal text-muted-foreground">— mag je overslaan</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="h-11 rounded-xl border-border/60 shadow-sm"
                placeholder="jan@voorbeeld.nl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                Telefoon{" "}
                <span className="font-normal text-muted-foreground">— mag je overslaan</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="h-11 rounded-xl border-border/60 shadow-sm"
                placeholder="06 … of vast nummer"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Waar komt deze klant vandaan?</p>
              <p className="mt-0.5 text-xs font-medium leading-relaxed text-muted-foreground">
                Zo weet je later wat het beste werkt voor nieuwe opdrachten.
              </p>
            </div>
            <div
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              role="radiogroup"
              aria-label="Herkomst van de klant"
            >
              {SOURCE_CHOICES.map(({ value: v, title, hint, Icon }) => {
                const selected = source === v;
                return (
                  <button
                    key={v || "unset"}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSource(v)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                      selected
                        ? "border-primary/45 bg-primary/[0.08] shadow-[0_0_0_1px_hsl(var(--primary)/0.12),0_10px_28px_-18px_hsl(var(--primary)/0.35)] ring-1 ring-primary/20 dark:bg-primary/[0.12] dark:ring-primary/30"
                        : "border-border/55 bg-muted/20 hover:border-primary/25 hover:bg-muted/35 dark:border-white/[0.1] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border shadow-sm",
                        selected
                          ? "border-primary/30 bg-primary/15 text-primary"
                          : "border-border/50 bg-background/90 text-muted-foreground",
                      )}
                    >
                      <Icon className="size-[1.05rem]" strokeWidth={2} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-snug text-foreground">{title}</span>
                      <span className="mt-0.5 block text-2xs font-medium leading-snug text-muted-foreground sm:text-xs">
                        {hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border/40 pt-5 sm:flex-row sm:justify-end sm:gap-3 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-border/60 font-semibold"
              onClick={() => setOpen(false)}
            >
              Annuleren
            </Button>
            <Button type="submit" className="h-11 rounded-xl px-6 font-semibold shadow-md" disabled={pending}>
              {pending ? "Bezig met opslaan…" : demoMode ? "Demo: zo werkt het" : "Klant opslaan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
