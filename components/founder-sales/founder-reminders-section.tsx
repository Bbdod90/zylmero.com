import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isFounderUser } from "@/lib/founder/access";
import { fetchFounderRemindersOnly } from "@/lib/queries/founder-sales";
import { AlertTriangle, Bell } from "lucide-react";

export async function FounderRemindersSection() {
  const auth = await getAuth();
  if (!auth.user) return null;
  const supabase = await createClient();
  if (!(await isFounderUser(supabase, auth.user.id))) return null;
  const reminders = await fetchFounderRemindersOnly(supabase);
  if (reminders.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-amber-950 dark:text-amber-100">
        <Bell className="size-4 shrink-0" />
        Outreach-herinneringen
      </div>
      <ul className="mt-2 space-y-1.5 text-sm text-amber-950/90 dark:text-amber-50/95">
        {reminders.map((r) => (
          <li key={`${r.id}-${r.kind}`} className="flex flex-wrap items-center gap-2">
            {r.kind === "follow_up_today" ? (
              <span className="font-medium">Vandaag opvolging</span>
            ) : (
              <span className="inline-flex items-center gap-1 font-medium">
                <AlertTriangle className="size-3.5 text-amber-700 dark:text-amber-300" />
                Geen reactie binnen 24 u
              </span>
            )}
            <span className="text-muted-foreground">—</span>
            <Link
              href={`/dashboard/sales#p-${r.id}`}
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              {r.business_name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
