/**
 * Verwijdert een Supabase Auth-gebruiker op e-mailadres.
 * Gerelateerde `companies` en afhankelijke rijen vallen weg via ON DELETE CASCADE
 * (zie supabase/schema.sql).
 *
 * Run vanuit de Zylmero-appmap met service role (nooit in de browser):
 *   npx tsx scripts/delete-user-by-email.ts suzanneboot1@gmail.com
 *
 * Vereist: NEXT_PUBLIC_SUPABASE_URL (of SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

async function findUserIdByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<string | null> {
  const target = email.toLowerCase();
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data.users;
    const hit = users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit.id;
    if (users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  const email = process.argv[2]?.trim();
  if (!email) {
    console.error("Gebruik: npx tsx scripts/delete-user-by-email.ts <email>");
    process.exit(1);
  }

  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error(
      "Zet SUPABASE_URL (of NEXT_PUBLIC_SUPABASE_URL) en SUPABASE_SERVICE_ROLE_KEY.",
    );
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const userId = await findUserIdByEmail(admin, email);
  if (!userId) {
    console.error(`Geen gebruiker gevonden met e-mail: ${email}`);
    process.exit(1);
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log(`Verwijderd: ${email} (${userId})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
