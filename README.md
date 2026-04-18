# Zylmero

Production SaaS: AI-assisted sales for garages and SMB. Stack: Next.js 14 App Router, TypeScript, Tailwind, Supabase (Auth + Postgres + RLS), OpenAI, Recharts, date-fns, Sonner.

## Setup

1. Create a Supabase project. Run `supabase/schema.sql` in the SQL editor (baseline schema).
2. Run each file in `supabase/migrations/` in chronological order in the SQL editor (or use Supabase CLI). This adds `automations`, `leads_marketing`, referrals, widget columns, and policies. Skipping this step causes missing-table errors for automations and the homepage lead form. If onboarding fails with `automation_preferences` / `booking_link` / `business_hours` / schema cache, run the matching migration files (e.g. `20260418090000_company_settings_automation_preferences.sql`, `20260420120000_profile_intake_booking_link.sql`, `20260421130000_company_settings_business_hours.sql`).
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (marketing leads + e-mail queue), `NEXT_PUBLIC_SITE_URL`, `SITE_URL` (zelfde basis-URL; server-only), optioneel `AUTH_PUBLIC_ORIGIN` op Railway, **`OPENAI_API_KEY`** (en optioneel `OPENAI_MODEL`). **Productie:** zet dezelfde OpenAI-variabelen opnieuw in je hosting-dashboard — zie `docs/OPENAI-DEPLOY.md`.
4. In Supabase Auth → URL Configuration: **Site URL** = exact je `NEXT_PUBLIC_SITE_URL` (bijv. `https://zylmero.com`). **Redirect URLs**: `https://zylmero.com/**` (zelfde host). Paden `/auth/callback` en `/reset-password` vallen onder `/**`. **Rate limits:** registratie loopt in de browser (per bezoeker-IP); limieten kun je verder verhogen onder **Authentication → Rate limits** ([docs](https://supabase.com/docs/guides/auth/rate-limits)). Eigen SMTP verhoogt o.a. het mailquotum t.o.v. de ingebouwde mail.
5. Auth-mailteksten: kopieer per template het **onderwerp** uit `supabase/email-templates/*-subject.txt` (alleen die ene regel, zonder labels als “Body (HTML):”) en de **HTML** uit het bijpassende `.html`-bestand naar Supabase → Authentication → Email templates.
6. `npm install && npm run dev`
7. Sign up at `/signup`, complete `/dashboard/onboarding`.
8. Optional: run `supabase/seed.sql` after the first user exists (associates demo data to `auth.users`).

## Domein (bijv. zylmero.com)

1. DNS bij je registrar: CNAME naar je Railway-service (zoals Railway onder **Settings → Networking → Custom domain** toont), of A/CNAME volgens het host-dashboard.
2. Voeg **Custom domain** toe in Railway (project → service → **Settings → Networking**) en wacht tot DNS “Active” is.
3. **Railway → Variables** (zelfde namen als in `.env.example` / `.env.local`; geen secrets in git):  
   - `NEXT_PUBLIC_SITE_URL=https://zylmero.com` (exact, geen slash aan het eind)  
   - `SITE_URL=https://zylmero.com` (server-only; voorkomt localhost in mail/redirects)  
   - Optioneel maar aanbevolen als je nog interne `localhost:8080`-redirects ziet: `AUTH_PUBLIC_ORIGIN=https://zylmero.com`  
   - **`OPENAI_API_KEY`** — verplicht als je op live de homepage AI-demo en dashboard-AI wilt (zelfde waarde als lokaal in `.env.local`; niet `NEXT_PUBLIC_`).  
   - Optioneel: **`OPENAI_MODEL`** (bijv. `gpt-4o-mini`); laat leeg voor default in code.  
   - **Niet** invullen: `SITE_URL` of Site URL in Supabase op `https://localhost:8080` — dat is alleen Railway’s interne poort, niet je publieke domein.  
   - Kopieer verder alle overige keys uit je lokale `.env.local` die je in productie nodig hebt (Supabase, Stripe, CRON, enz.).  
   - **Andere hosts (Vercel, Render, Fly):** zelfde variabelen onder **Environment variables / Secrets**.  
   Daarna **Redeploy** zodat de container de nieuwe env leest.
4. Supabase **Authentication → URL Configuration**: **Site URL** = `https://zylmero.com`. **Redirect URLs**: `https://zylmero.com/**` (zelfde host).
5. Optioneel: e-mail `hello@zylmero.com` instellen (Google Workspace, Proton, of forwarder) — los van de app.

## Eerste klant (productie)

- **Hosting:** `npm run build` → `npm run start` op elke Node-host; domein wijst naar die server of naar een platform zoals Vercel/Railway/Render.
- **E-mail:** Supabase **Authentication → Emails → Custom SMTP** (bijv. Resend + `RESEND_*`).
- **Demo:** Laat `NEXT_PUBLIC_ZYLMERO_DEMO` leeg in productie.
- **Stripe:** Vul Stripe-keys en prijs-IDs voor betalingen / proefperiode.

## Supabase Auth: limieten verhogen (verplicht als je “te veel pogingen” blijft zien)

Dat staat **niet** in deze codebase: Supabase handhaaft limieten op hun servers. Je moet ze in het **dashboard** verhogen (of via de Management API).

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → kies je project.
2. Ga naar **Authentication** → **Rate Limits** (zie ook [Rate limits – docs](https://supabase.com/docs/guides/auth/rate-limits)).
3. Zet daar de instelbare quotas **hoger** (o.a. signup-confirmation-interval, OTP, e-mail waar van toepassing). Maxima hangen af van je Supabase-plan; wat grijs of niet instelbaar is, kun je niet via de app omzeilen.
4. **E-mail:** zet **Custom SMTP** aan (bijv. Resend). De ingebouwde mail heeft een **streng maximum mails/uur**; dat los je alleen met eigen SMTP of minder testmails.

**Management API / script:** onder *Account → Access Tokens* een token maken (`sbp_…`), dan lokaal:

```bash
export SUPABASE_ACCESS_TOKEN="sbp_jouw_token"
export SUPABASE_PROJECT_REF="jouw_20_tekens_ref"
npm run supabase:raise-rate-limits
```

(`scripts/supabase-raise-auth-rate-limits.sh` — zie commentaar in het bestand. Zonder Custom SMTP wordt `rate_limit_email_sent` niet meegestuurd; met SMTP: `INCLUDE_EMAIL_RATE_LIMIT=1 npm run supabase:raise-rate-limits`. Op FREE kunnen waarden alsnog begrensd worden.)

**Productie-tip:** deploy de versie waarbij **signup in de browser** draait — dan delen gebruikers niet langer één server-IP-quota op Railway.

## Routes

- `/login`, `/signup`
- `/dashboard`, `/dashboard/insights`, `/dashboard/playbooks`, `/dashboard/integrations`, `/dashboard/leads`, `/dashboard/leads/[id]`, `/dashboard/inbox`, `/dashboard/quotes`, `/dashboard/appointments`, `/dashboard/settings`, `/dashboard/ai`, `/dashboard/automations`, `/dashboard/onboarding`

## Server actions

- `actions/ai.ts` — `summarizeLeadConversation`, `generateLeadReply`, `generateQuoteDraft`, `moveLeadToSuggestedStage`, `advanceLeadStageLinearAction`
- `actions/inbox.ts`, `actions/leads.ts`, `actions/settings.ts`, `actions/automations.ts`, `actions/auth.ts`, `actions/onboarding.ts`

## SQL

- `supabase/schema.sql` — tables, indexes, `updated_at` triggers, RLS (`owner_user_id`)
- `supabase/seed.sql` — garage demo (8 leads, conversations, messages, quotes, appointments, automations)
