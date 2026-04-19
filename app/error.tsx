"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-16 text-foreground">
      <h1 className="text-balance text-2xl font-bold tracking-tight md:text-3xl">
        Er ging iets mis
      </h1>
      <p className="mt-3 max-w-md text-center text-sm text-muted-foreground">
        Probeer het opnieuw. Blijft dit gebeuren? Neem contact op met {BRAND_NAME}
        {error.digest ? ` en noem code ${error.digest}.` : "."}
      </p>
      {isDev && error.message ? (
        <pre className="mt-4 max-h-40 max-w-2xl overflow-auto rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-left text-2xs text-destructive">
          {error.message}
        </pre>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset} className="rounded-xl">
          Opnieuw proberen
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/">Naar homepage</Link>
        </Button>
      </div>
    </div>
  );
}
