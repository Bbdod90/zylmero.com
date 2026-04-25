"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUp, Loader2, Upload } from "lucide-react";

export function LeadImport({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="cf-dashboard-panel overflow-hidden border-border/60 bg-gradient-to-br from-white via-white to-slate-50/35 dark:from-[hsl(222_30%_13%/0.97)] dark:via-[hsl(222_32%_10%/0.98)] dark:to-[hsl(222_38%_7%/0.99)]">
      <div className="border-b border-border/40 bg-gradient-to-r from-primary/[0.1] via-primary/[0.04] to-transparent px-5 py-4 dark:border-white/[0.06] dark:from-primary/[0.18] dark:via-primary/[0.08] sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.12] text-primary dark:border-primary/35 dark:bg-primary/[0.2]">
            <FileUp className="size-4.5" aria-hidden />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Import (CSV / Excel)
            </h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
              Bulk lead import
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Kolommen: naam (of name), email, telefoon, notities. Minimaal e-mail of
          telefoon per rij.
        </p>
      </div>
      <div className="space-y-3 p-5 sm:p-6">
        <div className="space-y-1.5">
          <Label htmlFor="import-file" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Bestand
          </Label>
          <div className="relative overflow-hidden rounded-xl border border-dashed border-border/70 bg-gradient-to-br from-slate-100/70 via-white to-slate-50/60 transition-colors hover:border-primary/35 hover:from-primary/[0.06] dark:border-white/[0.12] dark:from-white/[0.03] dark:via-[hsl(225_22%_10%)] dark:to-[hsl(225_24%_8%)]">
            <input
              id="import-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              disabled={disabled || pending}
              className="absolute inset-0 z-10 h-full min-h-[4.5rem] w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="pointer-events-none flex min-h-[4.75rem] flex-col items-center justify-center gap-0.5 px-4 py-4 text-center">
              <span className="text-xs font-semibold text-foreground sm:text-sm">
                {file ? file.name : "Sleep een bestand hierheen of klik om te kiezen"}
              </span>
              <span className="text-2xs text-muted-foreground">.csv, .xlsx of .xls</span>
            </div>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-9 rounded-lg bg-gradient-to-r from-primary to-primary/85 px-3.5 text-xs shadow-sm"
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
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <Upload className="mr-1.5 size-3.5" />
          )}
          Importeren
        </Button>
      </div>
    </div>
  );
}
