-- Profielbanner: snelle start zonder wizard
alter table public.companies
  add column if not exists profile_intake_completed boolean not null default true;

comment on column public.companies.profile_intake_completed is
  'false na overslaan wizard; true na volledige onboarding of opslaan onder Bedrijf in Instellingen';

-- Oudere DB's: company_settings zonder booking_link (PostgREST schema cache)
alter table public.company_settings
  add column if not exists booking_link text;

notify pgrst, 'reload schema';
