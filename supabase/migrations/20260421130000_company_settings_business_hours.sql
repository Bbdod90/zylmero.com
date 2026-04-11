-- Oudere DB's zonder business_hours (PostgREST: "not found in schema cache")
alter table public.company_settings
  add column if not exists business_hours jsonb not null default '{}'::jsonb;

comment on column public.company_settings.business_hours is 'Openingstijden of vrije tekst (jsonb)';

notify pgrst, 'reload schema';
