-- Eén idempotente catch-up: alle company_settings-kolommen die de app verwacht.
-- Voer dit uit op productie als je achterloopt op losse migraties (PostgREST "schema cache" / ontbrekende kolom).

alter table public.company_settings
  add column if not exists niche text,
  add column if not exists services text[] not null default '{}',
  add column if not exists faq jsonb not null default '[]'::jsonb,
  add column if not exists pricing_hints text,
  add column if not exists business_hours jsonb not null default '{}'::jsonb,
  add column if not exists booking_link text,
  add column if not exists tone text,
  add column if not exists reply_style text,
  add column if not exists language text not null default 'nl',
  add column if not exists automation_preferences jsonb not null default '{}'::jsonb,
  add column if not exists whatsapp_channel jsonb not null default '{}'::jsonb,
  add column if not exists auto_reply_enabled boolean not null default false,
  add column if not exists auto_reply_delay_seconds int not null default 30,
  add column if not exists ai_usage_count int not null default 0,
  add column if not exists ai_setup_completed_at timestamptz,
  add column if not exists white_label_logo_url text,
  add column if not exists white_label_primary text,
  add column if not exists niche_intake jsonb not null default '{}'::jsonb,
  add column if not exists knowledge_snippets jsonb not null default '[]'::jsonb;

create unique index if not exists company_settings_company_id_uidx
  on public.company_settings (company_id);

notify pgrst, 'reload schema';
