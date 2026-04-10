create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.stats (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  omzet numeric not null default 0,
  leads integer not null default 0
);

alter table public.profiles enable row level security;
alter table public.stats enable row level security;

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "stats_own" on public.stats;
create policy "stats_own"
on public.stats for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
