-- Oudere productie-DB's: ai_usage_count ontbreekt → AI-setup / skip faalt (schema cache)
alter table public.company_settings
  add column if not exists ai_usage_count int not null default 0;

comment on column public.company_settings.ai_usage_count is
  'Increments on AI actions; used for upgrade nudges';

notify pgrst, 'reload schema';
