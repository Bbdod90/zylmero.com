import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageFrame } from "@/components/layout/page-frame";
import { isDemoMode } from "@/lib/env";
import { getDemoDashboardBundle } from "@/lib/demo/dashboard-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuoteNewForm } from "@/components/quotes/quote-new-form";

export default async function NewQuotePage() {
  const auth = await getAuth();
  if (!auth.company) return null;
  const demo = isDemoMode();

  if (demo) {
    const bundle = getDemoDashboardBundle();
    const sampleId = bundle.quotes[0]?.id;
    return (
      <PageFrame
        title="Nieuwe offerte"
        subtitle="In de demo gebruik je vaste voorbeelddata."
      >
        <Card className="max-w-xl rounded-3xl border-border dark:border-white/[0.06]">
          <CardHeader>
            <CardTitle>Demo</CardTitle>
            <CardDescription>
              Er wordt geen nieuwe offerte in de database aangemaakt. Open een
              voorbeeld en bewerk regels en BTW — dat werkt lokaal op die pagina.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {sampleId ? (
              <Button asChild className="rounded-xl">
                <Link href={`/dashboard/quotes/${sampleId}`}>
                  Voorbeeld offerte openen
                </Link>
              </Button>
            ) : null}
            <Button variant="secondary" asChild className="rounded-xl">
              <Link href="/dashboard/leads">Naar leads</Link>
            </Button>
          </CardContent>
        </Card>
      </PageFrame>
    );
  }

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("leads")
    .select("id, full_name")
    .eq("company_id", auth.company.id)
    .order("updated_at", { ascending: false });

  const leads = (rows || []).map((r) => {
    const row = r as { id: string; full_name: string };
    return { id: row.id, full_name: row.full_name };
  });

  return (
    <PageFrame
      title="Nieuwe offerte"
      subtitle="Start met een leeg concept. Koppel optioneel meteen een lead."
    >
      <QuoteNewForm leads={leads} />
    </PageFrame>
  );
}
