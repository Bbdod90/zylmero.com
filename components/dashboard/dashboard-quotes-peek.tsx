import Link from "next/link";
import type { Quote } from "@/lib/types";
import { ProDashboardCard } from "@/components/dashboard/pro-dashboard-card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { quoteStatusNl } from "@/lib/i18n/nl-labels";
import { FileText } from "lucide-react";

export function DashboardQuotesPeek({ quotes }: { quotes: Quote[] }) {
  return (
    <ProDashboardCard
      eyebrow="Offertes"
      title="Recente documenten"
      action={
        <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-2xs" asChild>
          <Link href="/dashboard/quotes">Alle offertes</Link>
        </Button>
      }
    >
      {quotes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/50 bg-muted/[0.08] px-4 py-8 text-center dark:border-white/[0.08]">
          <FileText className="size-8 text-muted-foreground/70" aria-hidden />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Nog geen offertes. Maak er een vanuit een lead — met AI-acties gaat dat in minuten.
          </p>
          <Button variant="secondary" size="sm" className="rounded-lg" asChild>
            <Link href="/dashboard/quotes/new">Nieuwe offerte</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {quotes.map((q) => (
            <li key={q.id}>
              <Link
                href={`/dashboard/quotes/${q.id}`}
                className="flex gap-3 rounded-2xl border border-border/50 bg-background/30 p-3 transition-colors hover:border-primary/25 hover:bg-primary/[0.04] dark:border-white/[0.06] dark:bg-white/[0.02]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground dark:bg-white/[0.06]">
                  <FileText className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {q.title}
                  </p>
                  <p className="mt-0.5 text-2xs text-muted-foreground">
                    {quoteStatusNl(q.status)} · {formatDateTime(q.created_at)}
                  </p>
                  <p className="mt-1 text-sm font-bold tabular-nums text-foreground">
                    {formatCurrency(q.total)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ProDashboardCard>
  );
}
