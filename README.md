# CloserFlow

Production SaaS: AI-assisted sales for garages and SMB. Stack: Next.js 14 App Router, TypeScript, Tailwind, Supabase (Auth + Postgres + RLS), OpenAI, Recharts, date-fns, Sonner.

## Setup

1. Create a Supabase project. Run `supabase/schema.sql` in the SQL editor (baseline schema).
2. Run each file in `supabase/migrations/` in chronological order in the SQL editor (or use Supabase CLI). This adds `automations`, `leads_marketing`, referrals, widget columns, and policies. Skipping this step causes missing-table errors for automations and the homepage lead form.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (marketing leads + e-mail queue), `NEXT_PUBLIC_SITE_URL`, `OPENAI_API_KEY`.
4. In Supabase Auth → URL Configuration: Site URL = je `NEXT_PUBLIC_SITE_URL` (bijv. `https://jouw-app.vercel.app`). Redirect URLs: `https://jouw-app.vercel.app/**` plus `/auth/callback` en `/reset-password`.
5. `npm install && npm run dev`
6. Sign up at `/signup`, complete `/dashboard/onboarding`.
7. Optional: run `supabase/seed.sql` after the first user exists (associates demo data to `auth.users`).

## Routes

- `/login`, `/signup`
- `/dashboard`, `/dashboard/insights`, `/dashboard/playbooks`, `/dashboard/integrations`, `/dashboard/leads`, `/dashboard/leads/[id]`, `/dashboard/inbox`, `/dashboard/quotes`, `/dashboard/appointments`, `/dashboard/settings`, `/dashboard/ai`, `/dashboard/automations`, `/dashboard/onboarding`

## Server actions

- `actions/ai.ts` — `summarizeLeadConversation`, `generateLeadReply`, `generateQuoteDraft`, `moveLeadToSuggestedStage`, `advanceLeadStageLinearAction`
- `actions/inbox.ts`, `actions/leads.ts`, `actions/settings.ts`, `actions/automations.ts`, `actions/auth.ts`, `actions/onboarding.ts`

## SQL

- `supabase/schema.sql` — tables, indexes, `updated_at` triggers, RLS (`owner_user_id`)
- `supabase/seed.sql` — garage demo (8 leads, conversations, messages, quotes, appointments, automations)
