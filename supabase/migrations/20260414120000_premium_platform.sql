-- Premium platform: white-label, niche-intake, lead custom fields, kennisbank, reminders

alter table public.company_settings
  add column if not exists white_label_logo_url text,
  add column if not exists white_label_primary text,
  add column if not exists niche_intake jsonb not null default '{}'::jsonb,
  add column if not exists knowledge_snippets jsonb not null default '[]'::jsonb;

comment on column public.company_settings.white_label_logo_url is 'Publieke URL naar logo (widget / PDF)';
comment on column public.company_settings.white_label_primary is 'Hex primaire kleur, bv. #2563eb';
comment on column public.company_settings.niche_intake is 'Antwoorden dynamische onboarding per niche';
comment on column public.company_settings.knowledge_snippets is 'Extra kennisitems [{title, body}] voor AI';

alter table public.leads
  add column if not exists custom_fields jsonb not null default '{}'::jsonb;

comment on column public.leads.custom_fields is 'Niche-specifieke velden key-value';

alter table public.appointments
  add column if not exists reminder_sent_at timestamptz;

comment on column public.appointments.reminder_sent_at is 'E-mail herinnering verstuurd (24u voor start)';

alter table public.messages
  add column if not exists channel text;

comment on column public.messages.channel is 'Optioneel kanaal override: whatsapp | email | webchat | inbox';

update public.messages m
set channel = c.channel
from public.conversations c
where m.conversation_id = c.id and m.channel is null;
