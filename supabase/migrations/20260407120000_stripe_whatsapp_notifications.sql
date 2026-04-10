-- Stripe billing, WhatsApp settings, notifications, message previews RPC

-- ---------------------------------------------------------------------------
-- companies: Stripe subscription fields
-- ---------------------------------------------------------------------------
alter table public.companies
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists current_period_end timestamptz;

comment on column public.companies.stripe_customer_id is 'Stripe Customer id (cus_...)';
comment on column public.companies.stripe_subscription_id is 'Stripe Subscription id (sub_...)';
comment on column public.companies.subscription_status is 'Stripe subscription.status: trialing|active|past_due|canceled|unpaid|...';
comment on column public.companies.current_period_end is 'Current billing period end from Stripe';

create index if not exists companies_stripe_customer_id_idx on public.companies (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists companies_stripe_subscription_id_idx on public.companies (stripe_subscription_id)
  where stripe_subscription_id is not null;

-- ---------------------------------------------------------------------------
-- company_settings: WhatsApp + auto-reply
-- ---------------------------------------------------------------------------
alter table public.company_settings
  add column if not exists whatsapp_channel jsonb not null default '{}'::jsonb,
  add column if not exists auto_reply_enabled boolean not null default false,
  add column if not exists auto_reply_delay_seconds int not null default 30;

comment on column public.company_settings.whatsapp_channel is 'Provider config: provider, connected, phone, twilio/meta ids — extensible JSON';
comment on column public.company_settings.auto_reply_enabled is 'AI auto-reply for inbound WhatsApp when connected';
comment on column public.company_settings.auto_reply_delay_seconds is 'Delay before sending auto-reply';

-- ---------------------------------------------------------------------------
-- notifications (in-app)
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read_at timestamptz,
  dedupe_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notifications_company_created_idx
  on public.notifications (company_id, created_at desc);

create unique index if not exists notifications_dedupe_uidx
  on public.notifications (company_id, dedupe_key)
  where dedupe_key is not null;

alter table public.notifications enable row level security;

create policy notifications_select_own on public.notifications
  for select to authenticated
  using (
    company_id in (
      select id from public.companies where owner_user_id = auth.uid()
    )
  );

create policy notifications_update_own on public.notifications
  for update to authenticated
  using (
    company_id in (
      select id from public.companies where owner_user_id = auth.uid()
    )
  );

create policy notifications_insert_own on public.notifications
  for insert to authenticated
  with check (
    company_id in (
      select id from public.companies where owner_user_id = auth.uid()
    )
  );

-- Service role / webhooks bypass RLS via service key

-- ---------------------------------------------------------------------------
-- Fast last-message preview for dashboard (replaces N+1 queries)
-- ---------------------------------------------------------------------------
create or replace function public.last_message_preview_for_conversations(p_ids uuid[])
returns table (conversation_id uuid, content text)
language sql
stable
as $$
  select distinct on (m.conversation_id)
    m.conversation_id,
    m.content
  from public.messages m
  where m.conversation_id = any(p_ids)
  order by m.conversation_id, m.created_at desc;
$$;

grant execute on function public.last_message_preview_for_conversations(uuid[]) to authenticated, service_role, anon;
