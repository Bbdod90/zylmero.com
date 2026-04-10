-- Voorkom dubbele uitvoering van dezelfde regel per lead
create table if not exists public.automation_rule_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  rule_id uuid not null references public.automation_rules (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (rule_id, lead_id)
);

create index if not exists automation_rule_runs_company_idx
  on public.automation_rule_runs (company_id, created_at desc);

alter table public.automation_rule_runs enable row level security;

create policy automation_rule_runs_all on public.automation_rule_runs
  for all using (company_id in (select public.user_company_ids()))
  with check (company_id in (select public.user_company_ids()));
