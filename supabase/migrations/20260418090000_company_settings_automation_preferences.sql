-- Fix: oude of handmatige DB's zonder deze kolom (PostgREST: "not found in schema cache")
alter table public.company_settings
  add column if not exists automation_preferences jsonb not null default '{}'::jsonb;

comment on column public.company_settings.automation_preferences is 'Niche, onboarding-flow flags, intake — gebruikt door AI en automations';

-- PostgREST schema cache direct verversen (anders soms nog minuten oude cache)
notify pgrst, 'reload schema';
