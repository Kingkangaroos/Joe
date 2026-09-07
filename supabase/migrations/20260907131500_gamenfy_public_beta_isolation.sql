-- Gamenfy Public Beta isolation
-- Applied to project ttxjsoahmtennnufgeqx by ChatGPT/OpenAI on 2026-09-07.

create table if not exists public.gamenfy_public_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key),
  constraint gamenfy_public_state_key_not_blank check (length(btrim(key)) > 0)
);

alter table public.gamenfy_public_state enable row level security;
revoke all on table public.gamenfy_public_state from anon;
revoke all on table public.gamenfy_public_state from authenticated;
grant select, insert, update on table public.gamenfy_public_state to authenticated;

drop policy if exists "public beta owner select" on public.gamenfy_public_state;
create policy "public beta owner select" on public.gamenfy_public_state
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "public beta owner insert" on public.gamenfy_public_state;
create policy "public beta owner insert" on public.gamenfy_public_state
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "public beta owner update" on public.gamenfy_public_state;
create policy "public beta owner update" on public.gamenfy_public_state
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create table if not exists public.gamenfy_private_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);

alter table public.gamenfy_private_access enable row level security;
revoke all on table public.gamenfy_private_access from anon;
revoke all on table public.gamenfy_private_access from authenticated;
grant select on table public.gamenfy_private_access to authenticated;

drop policy if exists "private app self access check" on public.gamenfy_private_access;
create policy "private app self access check" on public.gamenfy_private_access
for select to authenticated using ((select auth.uid()) = user_id);

insert into public.gamenfy_private_access (user_id)
select distinct user_id from public.app_state where user_id is not null
on conflict (user_id) do nothing;
