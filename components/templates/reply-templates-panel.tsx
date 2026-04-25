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
import { Loader2, MessageSquareText, Trash2 } from "lucide-react";

export function ReplyTemplatesPanel({ items }: { items: ReplyTemplate[] }) {
  const [pending, start] = useTransition();

  return (
    <div className="space-y-8">
      <div className="cf-dashboard-panel p-6 sm:p-8">
        <header className="mb-6 flex flex-col gap-3 border-b border-border/50 pb-6 sm:flex-row sm:items-start sm:justify-between dark:border-white/[0.06]">
          <div className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <MessageSquareText className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Nieuw sjabloon</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Gebruik in de inbox via het menu &quot;Snel invoegen&quot;.
              </p>
            </div>
          </div>
        </header>
        <form
          className="space-y-5"
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
            <Label htmlFor="title" className="text-sm font-medium">
              Titel
            </Label>
            <Input
              id="title"
              name="title"
              required
              className="rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
              placeholder="Bijv. Afspraak bevestiging"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shortcut" className="text-sm font-medium">
              Sneltoets (optioneel)
            </Label>
            <Input
              id="shortcut"
              name="shortcut"
              className="rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
              placeholder="/bevestig"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body" className="text-sm font-medium">
              Tekst
            </Label>
            <Textarea
              id="body"
              name="body"
              required
              rows={6}
              className="min-h-[140px] resize-y rounded-xl border-border/60 bg-background/80 dark:border-white/[0.1] dark:bg-white/[0.03]"
              placeholder="Beste {{naam}}, ..."
            />
          </div>
          <Button type="submit" disabled={pending} className="rounded-xl px-6 font-semibold shadow-sm">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Opslaan
          </Button>
        </form>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="cf-dashboard-panel border-dashed border-border/55 px-6 py-10 text-center dark:border-white/[0.12]">
            <p className="text-sm font-medium text-foreground">Nog geen sjablonen</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Voeg hierboven je eerste tekst toe — daarna plak je die met één tik in een gesprek.
            </p>
          </div>
        ) : null}
        {items.map((t) => (
          <div
            key={t.id}
            className="cf-dashboard-panel flex flex-col gap-4 border-border/60 p-5 sm:flex-row sm:items-start sm:justify-between dark:border-white/[0.08]"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{t.title}</p>
              {t.shortcut ? (
                <p className="mt-0.5 font-mono text-2xs text-muted-foreground">{t.shortcut}</p>
              ) : null}
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {t.body}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
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
