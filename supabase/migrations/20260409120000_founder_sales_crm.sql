-- Founder-only internal sales CRM (outreach tracking). Not for end customers.

-- ---------------------------------------------------------------------------
-- founder_access: who can read/write internal CRM (RLS)
-- ---------------------------------------------------------------------------
create table if not exists public.founder_access (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.founder_access enable row level security;

create policy founder_access_select_own on public.founder_access
  for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- founder_sales_settings: daily outreach goal (singleton row)
-- ---------------------------------------------------------------------------
create table if not exists public.founder_sales_settings (
  id uuid primary key default gen_random_uuid(),
  daily_contact_goal int not null default 20,
  contacts_completed_today int not null default 0,
  goal_date date not null default ((now() at time zone 'utc'))::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.founder_sales_settings enable row level security;

create policy founder_settings_all on public.founder_sales_settings
  for all to authenticated
  using (
    exists (select 1 from public.founder_access f where f.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.founder_access f where f.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- founder_sales_prospects: outreach pipeline
-- ---------------------------------------------------------------------------
create table if not exists public.founder_sales_prospects (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text,
  channel text not null check (channel in ('instagram', 'whatsapp', 'email')),
  status text not null default 'contacted' check (
    status in (
      'contacted',
      'replied',
      'demo_sent',
      'interested',
      'closed',
      'lost'
    )
  ),
  last_contact_at timestamptz,
  next_follow_up_at timestamptz,
  notes text,
  last_outbound_at timestamptz,
  first_reply_at timestamptz,
  instagram_handle text,
  contact_email text,
  whatsapp_e164 text,
  messages_sent_count int not null default 0,
  replies_received_count int not null default 0,
  demos_sent_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists founder_sales_prospects_status_idx
  on public.founder_sales_prospects (status);

create index if not exists founder_sales_prospects_next_followup_idx
  on public.founder_sales_prospects (next_follow_up_at)
  where next_follow_up_at is not null;

alter table public.founder_sales_prospects enable row level security;

create policy founder_prospects_all on public.founder_sales_prospects
  for all to authenticated
  using (
    exists (select 1 from public.founder_access f where f.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.founder_access f where f.user_id = auth.uid())
  );

create or replace function public.set_founder_sales_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists founder_sales_prospects_updated_at on public.founder_sales_prospects;
create trigger founder_sales_prospects_updated_at
  before update on public.founder_sales_prospects
  for each row execute procedure public.set_founder_sales_updated_at();

drop trigger if exists founder_sales_settings_updated_at on public.founder_sales_settings;
create trigger founder_sales_settings_updated_at
  before update on public.founder_sales_settings
  for each row execute procedure public.set_founder_sales_updated_at();

comment on table public.founder_sales_prospects is 'Internal founder outreach CRM — not customer leads';

-- Default settings row (singleton)
insert into public.founder_sales_settings (daily_contact_goal, contacts_completed_today, goal_date)
select 20, 0, ((now() at time zone 'utc'))::date
where not exists (select 1 from public.founder_sales_settings limit 1);
