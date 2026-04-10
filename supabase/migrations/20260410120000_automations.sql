-- Automations table (opvolgingssjablonen) — ontbrak op sommige omgevingen

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

drop trigger if exists automations_set_updated_at on public.automations;
create trigger automations_set_updated_at
before update on public.automations
for each row execute function public.set_updated_at();

create index if not exists automations_company_id_idx on public.automations (company_id);

alter table public.automations enable row level security;

drop policy if exists automations_all on public.automations;
create policy automations_all on public.automations
  for all using (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  )
  with check (
    company_id in (select id from public.companies where owner_user_id = auth.uid())
  );
