"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function QuotesPageToolbar({
  demo,
  demoSampleQuoteId,
}: {
  demo: boolean;
  demoSampleQuoteId: string | null;
}) {
  if (demo) {
    return (
      <div className="mb-2 flex flex-wrap items-center justify-end gap-3">
        {demoSampleQuoteId ? (
          <Button asChild className="rounded-lg">
            <Link href={`/dashboard/quotes/${demoSampleQuoteId}`}>
              Voorbeeld bewerken
            </Link>
          </Button>
        ) : null}
        <Button variant="secondary" asChild className="rounded-lg">
          <Link href="/dashboard/leads">Nieuwe offerte via klant</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-2 flex flex-wrap items-center justify-end gap-3">
      <Button asChild className="rounded-lg">
        <Link href="/dashboard/quotes/new">Nieuwe offerte</Link>
      </Button>
    </div>
  );
}
