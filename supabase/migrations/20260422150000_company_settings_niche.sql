-- Oudere DB's: company_settings zonder niche (PostgREST schema cache / onboarding)
alter table public.company_settings
  add column if not exists niche text;

comment on column public.company_settings.niche is
  'Weergavenaam niche (vrij tekst of label uit niche_key)';

notify pgrst, 'reload schema';
