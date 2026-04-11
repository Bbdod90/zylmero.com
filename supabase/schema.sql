-- Zylmero — production schema (Supabase Postgres)

create extension if not exists "pgcrypto";

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  onboarding_completed boolean not null default false,
  contact_email text,
  contact_phone text,
  niche text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_owner_unique unique (owner_user_id)
);

create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create index if not exists companies_owner_user_id_idx on public.companies (owner_user_id);

-- ---------------------------------------------------------------------------
-- company_settings
-- ---------------------------------------------------------------------------
create table if not exists public.company_settings (
  company_id uuid primary key references public.companies (id) on delete cascade,
  niche text,
  services text[] not null default '{}',
  faq jsonb not null default '[]'::jsonb,
  pricing_hints text,
  business_hours jsonb not null default '{}'::jsonb,
  booking_link text,
  tone text,
  reply_style text,
  language text not null default 'nl',
  automation_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger company_settings_set_updated_at
before update on public.company_settings
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  source text,
  status text not null check (
    status in (
      'new',
      'active',
      'quote_sent',
      'appointment_booked',
      'won',
      'lost'
    )
  ) default 'new',
  score int check (score >= 0 and score <= 100),
  summary text,
  intent text,
  estimated_value numeric,
  suggested_next_action text,
  status_recommendation text,
  last_message_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create index if not exists leads_company_id_idx on public.leads (company_id);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_last_message_idx on public.leads (last_message_at desc nulls last);

-- ---------------------------------------------------------------------------
-- conversations
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  channel text not null default 'inbox',
  title text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

create index if not exists conversations_company_id_idx on public.conversations (company_id);
create index if not exists conversations_lead_id_idx on public.conversations (lead_id);

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'staff', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- quotes
-- ---------------------------------------------------------------------------
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  title text not null,
  description text,
  status text not null check (
    status in ('draft', 'sent', 'accepted', 'declined')
  ) default 'draft',
  currency text not null default 'EUR',
  subtotal numeric not null default 0,
  vat_rate numeric not null default 0.21,
  vat_amount numeric not null default 0,
  total numeric not null default 0,
  line_items jsonb not null default '[]'::jsonb,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger quotes_set_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

create index if not exists quotes_company_id_idx on public.quotes (company_id);

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

create index if not exists appointments_company_id_idx on public.appointments (company_id);
create index if not exists appointments_starts_at_idx on public.appointments (starts_at);

-- ---------------------------------------------------------------------------
-- automations
-- ---------------------------------------------------------------------------
create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  trigger_type text not null,
  delay_minutes int not null default 0,
  template_text text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger automations_set_updated_at
before update on public.automations
for each row execute function public.set_updated_at();

create index if not exists automations_company_id_idx on public.automations (company_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.companies enable row level security;
alter table public.company_settings enable row level security;
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.quotes enable row level security;
alter table public.appointments enable row level security;
alter table public.automations enable row level security;

-- Helper predicate: company owned by current user
-- companies
create policy companies_select_own on public.companies
  for select using (owner_user_id = auth.uid());

create policy companies_insert_own on public.companies
  for insert with check (owner_user_id = auth.uid());

create policy companies_update_own on public.companies
  for update using (owner_user_id = auth.uid());

create policy companies_delete_own on public.companies
  for delete using (owner_user_id = auth.uid());

-- company_settings
create policy company_settings_all on public.company_settings
  for all using (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  )
  with check (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  );

-- leads
create policy leads_all on public.leads
  for all using (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  )
  with check (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  );

-- conversations
create policy conversations_all on public.conversations
  for all using (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  )
  with check (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  );

-- messages (via conversation -> company)
create policy messages_all on public.messages
  for all using (
    conversation_id in (
      select c.id from public.conversations c
      join public.companies co on co.id = c.company_id
      where co.owner_user_id = auth.uid()
    )
  )
  with check (
    conversation_id in (
      select c.id from public.conversations c
      join public.companies co on co.id = c.company_id
      where co.owner_user_id = auth.uid()
    )
  );

-- quotes
create policy quotes_all on public.quotes
  for all using (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  )
  with check (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  );

-- appointments
create policy appointments_all on public.appointments
  for all using (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  )
  with check (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  );

-- automations
create policy automations_all on public.automations
  for all using (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  )
  with check (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  );

-- Trial / billing + waitlist: apply supabase/migrations/20260406120000_trial_waitlist.sql on existing DBs.
-- Marketing leads, drip queue, referrals, widget: apply supabase/migrations/20260412120000_growth_marketing_referrals_widget.sql
