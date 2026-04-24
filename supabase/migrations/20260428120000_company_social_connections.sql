-- Koppelingen met externe social / Meta-accounts (OAuth + inbox-integratie later).

create table if not exists public.company_social_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  provider text not null,
  status text not null default 'disconnected',
  display_name text,
  external_page_id text,
  metadata jsonb not null default '{}'::jsonb,
  encrypted_token text,
  token_expires_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint company_social_connections_provider_chk
    check (provider in ('meta', 'tiktok', 'linkedin')),
  constraint company_social_connections_status_chk
    check (status in ('disconnected', 'pending', 'connected', 'error')),
  constraint company_social_connections_company_provider_uidx unique (company_id, provider)
);

create index if not exists company_social_connections_company_idx
  on public.company_social_connections (company_id);

comment on table public.company_social_connections is 'Externe social/Meta-koppelingen per bedrijf; encrypted_token server-only lezen.';
comment on column public.company_social_connections.provider is 'meta = Facebook Pages + Messenger / Instagram DM via Meta; tiktok/linkedin gepland.';
comment on column public.company_social_connections.encrypted_token is 'AES-256-GCM sealed payload (server); nooit naar client lekken.';

alter table public.company_social_connections enable row level security;

create policy company_social_connections_select_own
  on public.company_social_connections for select to authenticated
  using (
    company_id in (
      select id from public.companies where owner_user_id = auth.uid()
    )
  );

create policy company_social_connections_insert_own
  on public.company_social_connections for insert to authenticated
  with check (
    company_id in (
      select id from public.companies where owner_user_id = auth.uid()
    )
  );

create policy company_social_connections_update_own
  on public.company_social_connections for update to authenticated
  using (
    company_id in (
      select id from public.companies where owner_user_id = auth.uid()
    )
  );

create policy company_social_connections_delete_own
  on public.company_social_connections for delete to authenticated
  using (
    company_id in (
      select id from public.companies where owner_user_id = auth.uid()
    )
  );
