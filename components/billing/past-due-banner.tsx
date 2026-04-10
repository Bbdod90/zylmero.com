import Link from "next/link";
import type { Company } from "@/lib/types";

export function PastDueBanner({ company }: { company: Company }) {
  if (company.subscription_status !== "past_due") return null;
  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-950 dark:text-amber-100">
      <span className="font-medium">Betaling mislukt.</span> Werk je pas bij in
      Stripe om automatisering en lead-routing te behouden.{" "}
      <Link href="/dashboard/settings?tab=billing" className="underline">
        Facturatie-instellingen
      </Link>
    </div>
  );
}
