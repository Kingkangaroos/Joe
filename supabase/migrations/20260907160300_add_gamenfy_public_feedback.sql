-- Gamenfy Public Beta feedback capture.
-- Applied to Supabase production by ChatGPT/OpenAI on 2026-09-07.

create table if not exists public.gamenfy_public_feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null check (char_length(message) between 4 and 800),
  page text not null default 'profile' check (char_length(page) between 1 and 40),
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.gamenfy_public_feedback enable row level security;

create policy "public beta feedback owner insert"
on public.gamenfy_public_feedback
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "public beta feedback owner select"
on public.gamenfy_public_feedback
for select
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists gamenfy_public_feedback_user_created_idx
  on public.gamenfy_public_feedback (user_id, created_at desc);

grant select, insert on public.gamenfy_public_feedback to authenticated;
grant usage, select on sequence public.gamenfy_public_feedback_id_seq to authenticated;
