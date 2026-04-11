"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { runAiSetupAction } from "@/actions/ai-setup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_NAME } from "@/lib/brand";

export function AiSetupClient({ companyName }: { companyName: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showSlow, setShowSlow] = useState(false);

  useEffect(() => {
    if (!pending) {
      setShowSlow(false);
      return;
    }
    const t = window.setTimeout(() => setShowSlow(true), 28_000);
    return () => window.clearTimeout(t);
  }, [pending]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await runAiSetupAction({}, new FormData());
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.ok) {
        router.push("/dashboard/value-moment");
        router.refresh();
        return;
      }
      setError("Er ging iets mis. Probeer het opnieuw of vernieuw de pagina.");
    } catch {
      setError(
        "Verbinding verbroken of time-out (vaak door netwerk of hosting). Vernieuw de pagina en probeer opnieuw.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card className="rounded-[1.35rem] border-primary/15 bg-card/80 shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Sparkles className="size-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Je AI-profiel instellen
          </CardTitle>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Voor <span className="font-semibold text-foreground">{companyName}</span>{" "}
            maken we een dienstenoverzicht, FAQ, antwoordstijl, prijsindicaties en eerste
            automatiseringen — op basis van je branche.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="mb-8 space-y-2 text-sm text-muted-foreground">
            {[
              "Diensten & FAQ op maat",
              "Toon en antwoordstijl",
              "3 opvolg-automatiseringen",
            ].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                {x}
              </li>
            ))}
          </ul>
          <form onSubmit={onSubmit} className="space-y-4">
            {error ? (
              <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <p>{error}</p>
                {/sessie|ingelogd/i.test(error) ? (
                  <Link href="/login" className="font-medium underline">
                    Naar inloggen
                  </Link>
                ) : null}
              </div>
            ) : null}
            <Button
              type="submit"
              className="h-14 w-full rounded-2xl text-base font-bold shadow-lg shadow-primary/25"
              disabled={pending}
            >
              {pending ? "Even geduld…" : "Genereer mijn AI-profiel"}
            </Button>
            {showSlow ? (
              <p className="text-center text-xs text-muted-foreground">
                Nog bezig — bij een trage verbinding kan dit even duren. Niet opnieuw klikken.
              </p>
            ) : null}
          </form>
          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            {BRAND_NAME} gebruikt je branche-defaults als de AI-call uitblijft — je komt altijd
            verder.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
