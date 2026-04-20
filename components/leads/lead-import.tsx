"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";

export function LeadImport({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="cf-dashboard-panel">
      <div className="border-b border-border/40 px-6 py-5 dark:border-white/[0.06] sm:px-7 sm:py-6">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Import (CSV / Excel)
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Kolommen: naam (of name), email, telefoon, notities. Minimaal e-mail of
          telefoon per rij.
        </p>
      </div>
      <div className="space-y-4 p-6 sm:p-7">
        <div className="space-y-2">
          <Label htmlFor="import-file">Bestand</Label>
          <div className="relative overflow-hidden rounded-lg border border-dashed border-border/60 bg-muted/20 transition-colors hover:border-primary/35 hover:bg-muted/30 dark:border-white/[0.1]">
            <input
              id="import-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              disabled={disabled || pending}
              className="absolute inset-0 z-10 h-full min-h-[5.5rem] w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="pointer-events-none flex min-h-[5.5rem] flex-col items-center justify-center gap-1 px-4 py-6 text-center">
              <span className="text-sm font-medium text-foreground">
                {file ? file.name : "Sleep een bestand hierheen of klik om te kiezen"}
              </span>
              <span className="text-2xs text-muted-foreground">.csv, .xlsx of .xls</span>
            </div>
          </div>
        </div>
        <Button
          type="button"
          className="rounded-lg"
          disabled={disabled || pending || !file}
          onClick={() => {
            if (!file) return;
            start(async () => {
              const fd = new FormData();
              fd.set("file", file);
              const res = await fetch("/api/leads/import", {
                method: "POST",
                body: fd,
              });
              const json = (await res.json()) as {
                ok: boolean;
                error?: string;
                imported?: number;
                skipped?: number;
                errors?: string[];
              };
              if (!res.ok || !json.ok) {
                toast.error(json.error || "Import mislukt");
                return;
              }
              toast.success(
                `${json.imported ?? 0} leads geïmporteerd, ${json.skipped ?? 0} overgeslagen.`,
              );
              if (json.errors?.length) {
                toast.message(json.errors[0] ?? "");
              }
              setFile(null);
              router.refresh();
            });
          }}
        >
          {pending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Upload className="mr-2 size-4" />
          )}
          Importeren
        </Button>
      </div>
    </div>
  );
}
