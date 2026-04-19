-- Website embed chatbot (builder + widget) — los van inbox messages/conversations
--
-- Op een “schone” Supabase kan set_updated_at() nog ontbreken (staat normaal in basis-schema).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Zelfde als enterprise-migratie: RLS-policies gebruiken deze functie. Op een nieuw project kan die nog ontbreken.
create table if not exists public.company_members (
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'medewerker')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create index if not exists company_members_user_id_idx on public.company_members (user_id);

create or replace function public.user_company_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.id
  from public.companies c
  where c.owner_user_id = auth.uid()
  union
  select m.company_id
  from public.company_members m
  where m.user_id = auth.uid();
$$;

grant execute on function public.user_company_ids() to authenticated;

create table if not exists public.embedded_chatbots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null default 'Website-assistent',
  tone text not null default 'zakelijk'
    check (tone in ('kort', 'vriendelijk', 'zakelijk')),
  instructions text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists embedded_chatbots_company_id_idx on public.embedded_chatbots (company_id);

create table if not exists public.embedded_chatbot_sources (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.embedded_chatbots (id) on delete cascade,
  type text not null check (type in ('text', 'url')),
  content text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists embedded_chatbot_sources_chatbot_id_idx on public.embedded_chatbot_sources (chatbot_id);

create table if not exists public.embedded_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.embedded_chatbots (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists embedded_chat_sessions_chatbot_id_idx on public.embedded_chat_sessions (chatbot_id);

create table if not exists public.embedded_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.embedded_chat_sessions (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists embedded_chat_messages_session_id_idx on public.embedded_chat_messages (session_id);
create index if not exists embedded_chat_messages_session_created_idx
  on public.embedded_chat_messages (session_id, created_at);

drop trigger if exists embedded_chatbots_set_updated_at on public.embedded_chatbots;
create trigger embedded_chatbots_set_updated_at
  before update on public.embedded_chatbots
  for each row execute function public.set_updated_at();

alter table public.embedded_chatbots enable row level security;
alter table public.embedded_chatbot_sources enable row level security;
alter table public.embedded_chat_sessions enable row level security;
alter table public.embedded_chat_messages enable row level security;

-- embedded_chatbots
create policy embedded_chatbots_select on public.embedded_chatbots
  for select to authenticated
  using (company_id in (select public.user_company_ids()));

create policy embedded_chatbots_insert on public.embedded_chatbots
  for insert to authenticated
  with check (company_id in (select public.user_company_ids()));

create policy embedded_chatbots_update on public.embedded_chatbots
  for update to authenticated
  using (company_id in (select public.user_company_ids()))
  with check (company_id in (select public.user_company_ids()));

create policy embedded_chatbots_delete on public.embedded_chatbots
  for delete to authenticated
  using (company_id in (select public.user_company_ids()));

-- embedded_chatbot_sources (via chatbot ownership)
create policy embedded_chatbot_sources_all on public.embedded_chatbot_sources
  for all to authenticated
  using (
    chatbot_id in (
      select id from public.embedded_chatbots where company_id in (select public.user_company_ids())
    )
  )
  with check (
    chatbot_id in (
      select id from public.embedded_chatbots where company_id in (select public.user_company_ids())
    )
  );

-- embedded_chat_sessions
create policy embedded_chat_sessions_all on public.embedded_chat_sessions
  for all to authenticated
  using (
    chatbot_id in (
      select id from public.embedded_chatbots where company_id in (select public.user_company_ids())
    )
  )
  with check (
    chatbot_id in (
      select id from public.embedded_chatbots where company_id in (select public.user_company_ids())
    )
  );

-- embedded_chat_messages (via session → chatbot)
create policy embedded_chat_messages_all on public.embedded_chat_messages
  for all to authenticated
  using (
    session_id in (
      select s.id
      from public.embedded_chat_sessions s
      join public.embedded_chatbots b on b.id = s.chatbot_id
      where b.company_id in (select public.user_company_ids())
    )
  )
  with check (
    session_id in (
      select s.id
      from public.embedded_chat_sessions s
      join public.embedded_chatbots b on b.id = s.chatbot_id
      where b.company_id in (select public.user_company_ids())
    )
  );

grant select, insert, update, delete on public.embedded_chatbots to authenticated;
grant select, insert, update, delete on public.embedded_chatbot_sources to authenticated;
grant select, insert, update, delete on public.embedded_chat_sessions to authenticated;
grant select, insert, update, delete on public.embedded_chat_messages to authenticated;
