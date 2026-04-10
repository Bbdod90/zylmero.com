"use client";

import { useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import {
  createReplyTemplate,
  deleteReplyTemplate,
} from "@/actions/reply-templates";
import type { ReplyTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";

export function ReplyTemplatesPanel({ items }: { items: ReplyTemplate[] }) {
  const [pending, start] = useTransition();

  return (
    <div className="space-y-10">
      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Nieuw sjabloon</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gebruik in de inbox via het menu &quot;Snel invoegen&quot;.
          </p>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              start(async () => {
                const r = await createReplyTemplate({}, fd);
                if (r.error) toast.error(r.error);
                else {
                  toast.success("Sjabloon opgeslagen");
                  e.currentTarget.reset();
                }
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                name="title"
                required
                className="rounded-xl"
                placeholder="Bijv. Afspraak bevestiging"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortcut">Sneltoets (optioneel)</Label>
              <Input
                id="shortcut"
                name="shortcut"
                className="rounded-xl"
                placeholder="/bevestig"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Tekst</Label>
              <Textarea
                id="body"
                name="body"
                required
                rows={6}
                className="rounded-xl"
                placeholder="Beste {{naam}}, ..."
              />
            </div>
            <Button type="submit" disabled={pending} className="rounded-xl">
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Opslaan
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nog geen sjablonen.</p>
        ) : null}
        {items.map((t) => (
          <div
            key={t.id}
            className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/40 p-5 sm:flex-row sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-semibold">{t.title}</p>
              {t.shortcut ? (
                <p className="text-2xs text-muted-foreground">{t.shortcut}</p>
              ) : null}
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {t.body}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-xl text-destructive"
              onClick={() => {
                start(async () => {
                  const r = await deleteReplyTemplate(t.id);
                  if (r.error) toast.error(r.error);
                  else toast.success("Verwijderd");
                });
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
