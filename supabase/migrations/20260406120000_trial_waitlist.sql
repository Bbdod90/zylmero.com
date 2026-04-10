-- Trial & billing fields on companies + waitlist for marketing

alter table public.companies
  add column if not exists trial_starts_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists plan text not null default 'trial',
  add column if not exists is_active boolean not null default true;

comment on column public.companies.plan is 'trial | starter | growth | pro — Stripe maps later';
comment on column public.companies.is_active is 'false when subscription cancelled or manually disabled';

-- Backfill existing rows: 14-day trial from creation (one-time)
update public.companies
set
  trial_starts_at = coalesce(trial_starts_at, created_at),
  trial_ends_at = coalesce(
    trial_ends_at,
    created_at + interval '14 days'
  ),
  is_active = true
where trial_starts_at is null or trial_ends_at is null;

-- ---------------------------------------------------------------------------
-- waitlist (landing email capture)
-- ---------------------------------------------------------------------------
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text default 'landing',
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_lower_uidx on public.waitlist (lower(email));

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- Allow anonymous inserts from the app (server uses anon key)
create policy waitlist_insert_anon on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- No public reads
create policy waitlist_no_select on public.waitlist
  for select
  to anon, authenticated
  using (false);
