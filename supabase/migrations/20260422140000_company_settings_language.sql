-- Oudere DB's: company_settings zonder language (PostgREST schema cache / skip onboarding)
alter table public.company_settings
  add column if not exists language text not null default 'nl';

comment on column public.company_settings.language is
  'Taalcode voor AI-output en UI (bijv. nl)';

notify pgrst, 'reload schema';
