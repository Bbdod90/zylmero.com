"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";

export function LeadImport({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [file, setFile] = useState<File | null>(null);

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Import (CSV / Excel)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Kolommen: naam (of name), email, telefoon, notities. Minimaal e-mail of
          telefoon per rij.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="import-file">Bestand</Label>
          <input
            id="import-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            disabled={disabled || pending}
            className="block w-full text-sm"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button
          type="button"
          className="rounded-xl"
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
      </CardContent>
    </Card>
  );
}
