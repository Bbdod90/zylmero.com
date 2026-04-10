-- Enterprise: team, pipeline-ondersteuning, AI-tags, sjablonen, automation rules, import

-- Toegang: eigenaar of teamlid
create or replace function public.user_company_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.id
  from public.companies c
  where c.owner_user_id = auth.uid()
  union
  select m.company_id
  from public.company_members m
  where m.user_id = auth.uid();
$$;

grant execute on function public.user_company_ids() to authenticated;

create table if not exists public.company_members (
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'medewerker')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create index if not exists company_members_user_id_idx on public.company_members (user_id);

create table if not exists public.company_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'medewerker')),
  token text not null unique,
  expires_at timestamptz not null,
  invited_by uuid not null references auth.users (id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists company_invitations_company_idx on public.company_invitations (company_id);
create index if not exists company_invitations_token_idx on public.company_invitations (token);

create table if not exists public.reply_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  body text not null,
  shortcut text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger reply_templates_set_updated_at
before update on public.reply_templates
for each row execute function public.set_updated_at();

create index if not exists reply_templates_company_id_idx on public.reply_templates (company_id);

create table if not exists public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  enabled boolean not null default true,
  if_type text not null,
  if_config jsonb not null default '{}'::jsonb,
  then_type text not null,
  then_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger automation_rules_set_updated_at
before update on public.automation_rules
for each row execute function public.set_updated_at();

create index if not exists automation_rules_company_id_idx on public.automation_rules (company_id);

create table if not exists public.team_activity (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists team_activity_company_created_idx
  on public.team_activity (company_id, created_at desc);

alter table public.leads
  add column if not exists ai_tags text[] not null default '{}',
  add column if not exists assigned_to uuid references auth.users (id) on delete set null;

comment on column public.leads.ai_tags is 'AI-labels: spoed, hoge_waarde, prijsvraag, klacht, ...';
comment on column public.leads.assigned_to is 'Optioneel teamlid';

-- RLS helpers
alter table public.company_members enable row level security;
alter table public.company_invitations enable row level security;
alter table public.reply_templates enable row level security;
alter table public.automation_rules enable row level security;
alter table public.team_activity enable row level security;

create policy company_members_select on public.company_members
  for select using (company_id in (select public.user_company_ids()));

create policy company_members_insert on public.company_members
  for insert with check (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
    or exists (
      select 1 from public.company_members m
      where m.company_id = company_id
        and m.user_id = auth.uid()
        and m.role = 'admin'
    )
  );

create policy company_members_delete on public.company_members
  for delete using (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
    or exists (
      select 1 from public.company_members m
      where m.company_id = company_members.company_id
        and m.user_id = auth.uid()
        and m.role = 'admin'
    )
  );

create policy company_invitations_all on public.company_invitations
  for all using (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
    or exists (
      select 1 from public.company_members m
      where m.company_id = company_invitations.company_id
        and m.user_id = auth.uid()
        and m.role = 'admin'
    )
  )
  with check (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
    or exists (
      select 1 from public.company_members m
      where m.company_id = company_invitations.company_id
        and m.user_id = auth.uid()
        and m.role = 'admin'
    )
  );

create policy reply_templates_all on public.reply_templates
  for all using (company_id in (select public.user_company_ids()))
  with check (company_id in (select public.user_company_ids()));

create policy automation_rules_all on public.automation_rules
  for all using (company_id in (select public.user_company_ids()))
  with check (company_id in (select public.user_company_ids()));

create policy team_activity_select on public.team_activity
  for select using (company_id in (select public.user_company_ids()));

create policy team_activity_insert on public.team_activity
  for insert with check (company_id in (select public.user_company_ids()));

-- Bestaande policies vervangen (company + data)
drop policy if exists companies_select_own on public.companies;
drop policy if exists companies_insert_own on public.companies;
drop policy if exists companies_update_own on public.companies;
drop policy if exists companies_delete_own on public.companies;

create policy companies_select_access on public.companies
  for select using (id in (select public.user_company_ids()));

create policy companies_insert_own on public.companies
  for insert with check (owner_user_id = auth.uid());

create policy companies_update_owner on public.companies
  for update using (owner_user_id = auth.uid());

create policy companies_delete_owner on public.companies
  for delete using (owner_user_id = auth.uid());

drop policy if exists company_settings_all on public.company_settings;
create policy company_settings_all on public.company_settings
  for all using (company_id in (select public.user_company_ids()))
  with check (company_id in (select public.user_company_ids()));

drop policy if exists leads_all on public.leads;
create policy leads_all on public.leads
  for all using (company_id in (select public.user_company_ids()))
  with check (company_id in (select public.user_company_ids()));

drop policy if exists conversations_all on public.conversations;
create policy conversations_all on public.conversations
  for all using (company_id in (select public.user_company_ids()))
  with check (company_id in (select public.user_company_ids()));

drop policy if exists messages_all on public.messages;
create policy messages_all on public.messages
  for all using (
    conversation_id in (
      select c.id from public.conversations c
      where c.company_id in (select public.user_company_ids())
    )
  )
  with check (
    conversation_id in (
      select c.id from public.conversations c
      where c.company_id in (select public.user_company_ids())
    )
  );

drop policy if exists quotes_all on public.quotes;
create policy quotes_all on public.quotes
  for all using (company_id in (select public.user_company_ids()))
  with check (company_id in (select public.user_company_ids()));

drop policy if exists appointments_all on public.appointments;
create policy appointments_all on public.appointments
  for all using (company_id in (select public.user_company_ids()))
  with check (company_id in (select public.user_company_ids()));

drop policy if exists automations_all on public.automations;
create policy automations_all on public.automations
  for all using (company_id in (select public.user_company_ids()))
  with check (company_id in (select public.user_company_ids()));

drop policy if exists notifications_select_own on public.notifications;
drop policy if exists notifications_update_own on public.notifications;
drop policy if exists notifications_insert_own on public.notifications;

create policy notifications_select_access on public.notifications
  for select to authenticated
  using (company_id in (select public.user_company_ids()));

create policy notifications_update_access on public.notifications
  for update to authenticated
  using (company_id in (select public.user_company_ids()));

create policy notifications_insert_access on public.notifications
  for insert to authenticated
  with check (company_id in (select public.user_company_ids()));
