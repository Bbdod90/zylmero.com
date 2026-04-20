-- Bootstrap `public.leads` + ontbrekende kolommen (fix voor PostgREST "full_name" / kapotte leads).
-- Idempotent. Na uitvoeren: Supabase → Settings → API → "Reload schema" als de cache traag update.
--
-- Vereist: `public.companies`, `public.set_updated_at()`, `public.user_company_ids()` (uit eerdere migraties).

set search_path = public;

-- ---------------------------------------------------------------------------
-- 1) Tabel (alleen als die nog niet bestaat)
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  full_name text not null default 'Lead',
  email text,
  phone text,
  source text,
  status text not null default 'new',
  score int,
  summary text,
  intent text,
  estimated_value numeric,
  suggested_next_action text,
  status_recommendation text,
  last_message_at timestamptz,
  notes text,
  custom_fields jsonb not null default '{}'::jsonb,
  ai_tags text[] not null default '{}'::text[],
  assigned_to uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2) Kolommen toevoegen op oudere / gedeeltelijke tabellen
-- ---------------------------------------------------------------------------
alter table public.leads add column if not exists email text;
alter table public.leads add column if not exists phone text;
alter table public.leads add column if not exists source text;
alter table public.leads add column if not exists status text;
alter table public.leads add column if not exists score int;
alter table public.leads add column if not exists summary text;
alter table public.leads add column if not exists intent text;
alter table public.leads add column if not exists estimated_value numeric;
alter table public.leads add column if not exists suggested_next_action text;
alter table public.leads add column if not exists status_recommendation text;
alter table public.leads add column if not exists last_message_at timestamptz;
alter table public.leads add column if not exists notes text;
alter table public.leads add column if not exists created_at timestamptz;
alter table public.leads add column if not exists updated_at timestamptz;
alter table public.leads add column if not exists custom_fields jsonb;
alter table public.leads add column if not exists ai_tags text[];
alter table public.leads add column if not exists assigned_to uuid;
alter table public.leads add column if not exists full_name text;

-- Defaults / NOT NULL waar veilig
update public.leads set status = 'new' where status is null or trim(status) = '';
alter table public.leads alter column status set default 'new';
alter table public.leads alter column status set not null;

update public.leads set custom_fields = '{}'::jsonb where custom_fields is null;
alter table public.leads alter column custom_fields set default '{}'::jsonb;
alter table public.leads alter column custom_fields set not null;

update public.leads set ai_tags = '{}'::text[] where ai_tags is null;
alter table public.leads alter column ai_tags set default '{}'::text[];
alter table public.leads alter column ai_tags set not null;

update public.leads set created_at = now() where created_at is null;
alter table public.leads alter column created_at set default now();
alter table public.leads alter column created_at set not null;

update public.leads set updated_at = now() where updated_at is null;
alter table public.leads alter column updated_at set default now();
alter table public.leads alter column updated_at set not null;

update public.leads set full_name = 'Lead' where full_name is null or length(trim(full_name)) = 0;
alter table public.leads alter column full_name set default 'Lead';
alter table public.leads alter column full_name set not null;

-- Legacy: kolom `name` → full_name
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'leads' and column_name = 'name'
  ) then
    update public.leads
    set full_name = coalesce(nullif(trim(name::text), ''), full_name, 'Lead');
    alter table public.leads drop column if exists name;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3) Indexen + trigger
-- ---------------------------------------------------------------------------
create index if not exists leads_company_id_idx on public.leads (company_id);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_last_message_idx on public.leads (last_message_at desc nulls last);

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4) RLS (alleen als user_company_ids bestaat)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_proc where proname = 'user_company_ids' and pronamespace = (select oid from pg_namespace where nspname = 'public')) then
    alter table public.leads enable row level security;
    drop policy if exists leads_all on public.leads;
    create policy leads_all on public.leads
      for all using (company_id in (select public.user_company_ids()))
      with check (company_id in (select public.user_company_ids()));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 5) Realtime (negeren bij fout)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      execute 'alter publication supabase_realtime add table public.leads';
    exception
      when duplicate_object then null;
      when undefined_object then null;
      when others then null;
    end;
  end if;
end $$;
