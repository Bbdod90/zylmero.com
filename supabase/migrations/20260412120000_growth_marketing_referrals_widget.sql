-- Marketing leads, e-mail drip queue, referrals, widget token, AI-setup flag

-- ---------------------------------------------------------------------------
-- leads_marketing (homepage capture — alleen service role)
-- ---------------------------------------------------------------------------
create table if not exists public.leads_marketing (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company_name text not null,
  email text,
  phone text,
  source text not null default 'homepage',
  created_at timestamptz not null default now()
);

create index if not exists leads_marketing_created_idx on public.leads_marketing (created_at desc);

alter table public.leads_marketing enable row level security;

-- Publiek formulier op homepage (anon + authenticated insert)
create policy leads_marketing_insert_public on public.leads_marketing
  for insert to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- marketing_email_queue (geplande follow-up e-mails)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_email_queue (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  template_key text not null,
  campaign_source text not null,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists marketing_email_queue_due_idx
  on public.marketing_email_queue (scheduled_for)
  where sent_at is null;

alter table public.marketing_email_queue enable row level security;

-- ---------------------------------------------------------------------------
-- companies: referral + widget
-- ---------------------------------------------------------------------------
alter table public.companies
  add column if not exists referral_code text;

create unique index if not exists companies_referral_code_uidx
  on public.companies (referral_code)
  where referral_code is not null;

alter table public.companies
  add column if not exists widget_embed_token uuid default gen_random_uuid();

create unique index if not exists companies_widget_embed_token_uidx
  on public.companies (widget_embed_token)
  where widget_embed_token is not null;

-- ---------------------------------------------------------------------------
-- referral_conversions
-- ---------------------------------------------------------------------------
create table if not exists public.referral_conversions (
  id uuid primary key default gen_random_uuid(),
  referrer_company_id uuid not null references public.companies (id) on delete cascade,
  referee_company_id uuid not null references public.companies (id) on delete cascade,
  referral_code text not null,
  credit_eur numeric not null default 10,
  created_at timestamptz not null default now(),
  constraint referral_conversions_referee_unique unique (referee_company_id)
);

create index if not exists referral_conversions_referrer_idx
  on public.referral_conversions (referrer_company_id);

alter table public.referral_conversions enable row level security;

create policy referral_conversions_select_own on public.referral_conversions
  for select to authenticated
  using (
    referrer_company_id in (
      select id from public.companies where owner_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- company_settings: AI setup voltooid
-- ---------------------------------------------------------------------------
alter table public.company_settings
  add column if not exists ai_setup_completed_at timestamptz;

comment on column public.company_settings.ai_setup_completed_at is 'Eerste AI bulk-setup (diensten/FAQ/automations) afgerond';

-- Bestaande bedrijven: widget-token vullen
update public.companies
set widget_embed_token = gen_random_uuid()
where widget_embed_token is null;

-- Accounts die value-moment al deden: AI-setup als afgerond tellen
update public.company_settings cs
set ai_setup_completed_at = coalesce(cs.ai_setup_completed_at, now())
from public.companies c
where c.id = cs.company_id
  and c.value_moment_completed_at is not null;
