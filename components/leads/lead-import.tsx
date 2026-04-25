"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2, Upload } from "lucide-react";

export function LeadImport({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="cf-dashboard-panel overflow-hidden rounded-xl border border-border/55 bg-gradient-to-br from-white via-white to-slate-50/35 px-3 py-2.5 dark:from-[hsl(222_30%_13%/0.97)] dark:via-[hsl(222_32%_10%/0.98)] dark:to-[hsl(222_38%_7%/0.99)] sm:px-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.1] text-primary dark:border-primary/35 dark:bg-primary/[0.18]">
            <FileUp className="size-3.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-tight text-foreground">Import CSV / Excel</p>
            <p className="text-[0.65rem] leading-snug text-muted-foreground">
              Naam, e-mail, telefoon — minimaal e-mail of telefoon per rij
            </p>
          </div>
        </div>

        <div className="relative min-h-[2.75rem] min-w-0 flex-1 overflow-hidden rounded-lg border border-dashed border-border/70 bg-background/70 transition-colors hover:border-primary/35 dark:border-white/[0.12] dark:bg-white/[0.03]">
          <input
            id="import-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            disabled={disabled || pending}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="pointer-events-none flex h-full min-h-[2.75rem] items-center px-3 py-2">
            <span className="truncate text-xs text-muted-foreground">
              {file ? (
                <span className="font-medium text-foreground">{file.name}</span>
              ) : (
                <>Klik of sleep bestand · .csv, .xlsx, .xls</>
              )}
            </span>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          className="h-8 shrink-0 rounded-lg bg-gradient-to-r from-primary to-primary/85 px-3 text-xs shadow-sm sm:self-stretch sm:px-4"
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
                `${json.imported ?? 0} klanten geïmporteerd, ${json.skipped ?? 0} overgeslagen.`,
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
            <Loader2 className="mr-1 size-3.5 animate-spin" />
          ) : (
            <Upload className="mr-1 size-3.5" />
          )}
          Importeren
        </Button>
      </div>
    </div>
  );
}
