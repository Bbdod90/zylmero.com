-- Core chatbot builder tables: chatbots, gesprekken, berichten

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.chatbots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  bedrijfs_omschrijving text not null default '',
  website_url text,
  extra_info text,
  openingszin text,
  settings jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chatbots_user_id_idx on public.chatbots (user_id);
create index if not exists chatbots_created_at_idx on public.chatbots (created_at desc);

drop trigger if exists chatbots_set_updated_at on public.chatbots;
create trigger chatbots_set_updated_at
before update on public.chatbots
for each row execute function public.set_updated_at();

create table if not exists public.gesprekken (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.chatbots (id) on delete cascade,
  kanaal text not null check (kanaal in ('web', 'whatsapp', 'email')),
  created_at timestamptz not null default now()
);

create index if not exists gesprekken_chatbot_id_idx on public.gesprekken (chatbot_id);
create index if not exists gesprekken_created_at_idx on public.gesprekken (created_at desc);

create table if not exists public.berichten (
  id uuid primary key default gen_random_uuid(),
  gesprek_id uuid not null references public.gesprekken (id) on delete cascade,
  rol text not null check (rol in ('user', 'bot')),
  inhoud text not null,
  created_at timestamptz not null default now()
);

create index if not exists berichten_gesprek_id_idx on public.berichten (gesprek_id);
create index if not exists berichten_gesprek_created_at_idx on public.berichten (gesprek_id, created_at);

alter table public.chatbots enable row level security;
alter table public.gesprekken enable row level security;
alter table public.berichten enable row level security;

drop policy if exists chatbots_owner_select on public.chatbots;
create policy chatbots_owner_select on public.chatbots
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists chatbots_owner_insert on public.chatbots;
create policy chatbots_owner_insert on public.chatbots
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists chatbots_owner_update on public.chatbots;
create policy chatbots_owner_update on public.chatbots
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists chatbots_owner_delete on public.chatbots;
create policy chatbots_owner_delete on public.chatbots
  for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists gesprekken_owner_all on public.gesprekken;
create policy gesprekken_owner_all on public.gesprekken
  for all to authenticated
  using (
    chatbot_id in (
      select c.id from public.chatbots c where c.user_id = auth.uid()
    )
  )
  with check (
    chatbot_id in (
      select c.id from public.chatbots c where c.user_id = auth.uid()
    )
  );

drop policy if exists berichten_owner_all on public.berichten;
create policy berichten_owner_all on public.berichten
  for all to authenticated
  using (
    gesprek_id in (
      select g.id
      from public.gesprekken g
      join public.chatbots c on c.id = g.chatbot_id
      where c.user_id = auth.uid()
    )
  )
  with check (
    gesprek_id in (
      select g.id
      from public.gesprekken g
      join public.chatbots c on c.id = g.chatbot_id
      where c.user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.chatbots to authenticated;
grant select, insert, update, delete on public.gesprekken to authenticated;
grant select, insert, update, delete on public.berichten to authenticated;
