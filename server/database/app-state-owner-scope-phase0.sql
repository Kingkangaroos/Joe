-- Gamenfy app_state owner-scope / restore-generation Phase 0
-- Performed-by: ChatGPT (OpenAI)
-- Applied and verified on production Supabase: 2026-09-06.
--
-- This phase is intentionally additive and backwards compatible.
-- It does NOT drop the legacy PRIMARY KEY (key), so old production clients
-- that still use on_conflict=key continue to work until the coordinated cutover.

begin;

alter table public.app_state
  add column if not exists restore_generation bigint not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.app_state'::regclass
      and conname = 'app_state_user_key_unique'
  ) then
    alter table public.app_state
      add constraint app_state_user_key_unique unique (user_id, key);
  end if;
end $$;

commit;

-- Verification contract:
--   restore_generation = BIGINT NOT NULL DEFAULT 0
--   UNIQUE (user_id, key) exists
--   legacy PRIMARY KEY (key) remains until the final owner-scope cutover
