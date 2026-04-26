-- Nieuwsbrief / bulk e-mail naar klanten (leads met e-mail), gekoppeld aan marketing_email_queue.

set search_path = public;

create table if not exists public.company_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  subject text not null,
  body_html text not null,
  status text not null default 'queued'
    check (status in ('queued', 'cancelled')),
  total_recipients int not null default 0
    check (total_recipients >= 0),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.company_email_campaigns is 'Bulk e-mailcampagnes naar eigen leads (nieuwsbrief); verzending via marketing_email_queue + cron.';

create index if not exists company_email_campaigns_company_idx
  on public.company_email_campaigns (company_id, created_at desc);

alter table public.company_email_campaigns enable row level security;

do $$
begin
  if exists (
    select 1 from pg_proc
    where proname = 'user_company_ids'
      and pronamespace = (select oid from pg_namespace where nspname = 'public')
  ) then
    drop policy if exists company_email_campaigns_all on public.company_email_campaigns;
    create policy company_email_campaigns_all on public.company_email_campaigns
      for all
      using (company_id in (select public.user_company_ids()))
      with check (company_id in (select public.user_company_ids()));
  end if;
end $$;

alter table public.marketing_email_queue
  add column if not exists campaign_id uuid references public.company_email_campaigns (id) on delete set null;

create index if not exists marketing_email_queue_campaign_id_idx
  on public.marketing_email_queue (campaign_id);
