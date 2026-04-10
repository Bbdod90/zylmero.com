-- Value moment (post-onboarding) + AI usage counter for upgrade nudges

alter table public.companies
  add column if not exists value_moment_completed_at timestamptz;

comment on column public.companies.value_moment_completed_at is 'Set after first-win demo; unlocks main dashboard';

alter table public.company_settings
  add column if not exists ai_usage_count int not null default 0;

comment on column public.company_settings.ai_usage_count is 'Increments on AI actions; used for upgrade nudges';

-- Existing workspaces: skip forced value-moment (already live)
update public.companies
set value_moment_completed_at = coalesce(value_moment_completed_at, created_at)
where onboarding_completed is true;
