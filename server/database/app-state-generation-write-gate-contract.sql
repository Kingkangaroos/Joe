-- Gamenfy app_state generation write gate + atomic restore contract
-- Performed-by: ChatGPT (OpenAI), 2026-09-06
-- STATUS: DESIGN / REGRESSION CONTRACT ONLY — DO NOT APPLY TO PRODUCTION.
--
-- This file deliberately ends in ROLLBACK. It is a reviewable target contract,
-- not a migration. The real rollout must be staged:
--   A) add state_version + create restricted RPCs while direct writes still work;
--   B) ship/verify the browser using gamenfy_write_app_state;
--   C) only then revoke direct authenticated mutation of app_state;
--   D) only after service-role owner scoping may the legacy global PK be removed.
--
-- Why a normal restore RPC alone is insufficient:
-- a pre-cutover PWA can still call the table directly. After a restore it could
-- overwrite restored data while leaving restore_generation unchanged. A server
-- write gate must therefore own EVERY authenticated browser mutation, not just
-- restore, before direct authenticated table writes are closed.

begin;

-- Per-write CAS token. restore_generation protects restore epochs; state_version
-- protects concurrent writes inside the same epoch without trusting client clocks.
alter table public.app_state
  add column if not exists state_version bigint not null default 0;

-- ---------------------------------------------------------------------------
-- Normal authenticated browser write gate.
-- SECURITY DEFINER is intentional here because the final cutover revokes direct
-- authenticated INSERT/UPDATE/DELETE on app_state. The function compensates for
-- that privilege boundary with: auth.uid() ownership, no owner-id argument,
-- empty search_path, explicit schema names, generation+version CAS, and tightly
-- restricted EXECUTE grants.
-- ---------------------------------------------------------------------------
create or replace function public.gamenfy_write_app_state(
  p_key text,
  p_data jsonb,
  p_expected_generation bigint,
  p_expected_version bigint
)
returns table (
  key text,
  restore_generation bigint,
  state_version bigint,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_exists boolean := false;
  v_generation bigint := 0;
  v_version bigint := 0;
  v_now timestamptz := clock_timestamp();
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if p_key is null or btrim(p_key) = '' or length(p_key) > 128 then
    raise exception 'invalid app_state key' using errcode = '22023';
  end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' then
    raise exception 'app_state data must be a JSON object' using errcode = '22023';
  end if;
  if p_expected_generation is null or p_expected_generation < 0
     or p_expected_version is null or p_expected_version < 0 then
    raise exception 'expected generation/version must be non-negative' using errcode = '22023';
  end if;

  select true, s.restore_generation, s.state_version
    into v_exists, v_generation, v_version
  from public.app_state as s
  where s.user_id = v_uid and s.key = p_key
  for update;

  if coalesce(v_exists, false) then
    if v_generation <> p_expected_generation then
      raise exception 'restore generation conflict' using errcode = '40001';
    end if;
    if v_version <> p_expected_version then
      raise exception 'state version conflict' using errcode = '40001';
    end if;

    return query
    update public.app_state as s
       set data = p_data,
           updated_at = v_now,
           state_version = s.state_version + 1
     where s.user_id = v_uid and s.key = p_key
     returning s.key, s.restore_generation, s.state_version, s.updated_at;
  else
    if p_expected_generation <> 0 or p_expected_version <> 0 then
      raise exception 'missing baseline conflict' using errcode = '40001';
    end if;

    return query
    insert into public.app_state (key, user_id, data, updated_at, restore_generation, state_version)
    values (p_key, v_uid, p_data, v_now, 0, 1)
    returning app_state.key, app_state.restore_generation, app_state.state_version, app_state.updated_at;
  end if;
end;
$$;

revoke execute on function public.gamenfy_write_app_state(text,jsonb,bigint,bigint) from public;
revoke execute on function public.gamenfy_write_app_state(text,jsonb,bigint,bigint) from anon;
grant execute on function public.gamenfy_write_app_state(text,jsonb,bigint,bigint) to authenticated;

-- ---------------------------------------------------------------------------
-- Atomic canonical restore RPC.
-- One call = one PostgreSQL transaction. It always advances ALL three durable
-- canonical domains to the same new restore generation, even when a domain's
-- incoming payload is empty/unchanged, so generation never diverges by domain.
-- ---------------------------------------------------------------------------
create or replace function public.gamenfy_restore_app_state_v1(
  p_strategy text,
  p_expected_generation bigint,
  p_expected_rpg_version bigint,
  p_expected_finance_version bigint,
  p_expected_health_version bigint,
  p_rpg jsonb,
  p_finance jsonb,
  p_health jsonb
)
returns table (
  new_generation bigint,
  restored_at timestamptz,
  rpg_version bigint,
  finance_version bigint,
  health_version bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_now timestamptz := clock_timestamp();
  v_new_generation bigint;

  v_rpg_exists boolean := false;
  v_rpg_data jsonb := '{}'::jsonb;
  v_rpg_generation bigint := 0;
  v_rpg_version bigint := 0;

  v_finance_exists boolean := false;
  v_finance_data jsonb := '{}'::jsonb;
  v_finance_generation bigint := 0;
  v_finance_version bigint := 0;

  v_health_exists boolean := false;
  v_health_data jsonb := '{}'::jsonb;
  v_health_generation bigint := 0;
  v_health_version bigint := 0;

  v_target_rpg jsonb;
  v_target_finance jsonb;
  v_target_health jsonb;
begin
  if v_uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if p_strategy not in ('merge', 'overwrite') then
    raise exception 'restore strategy must be merge or overwrite' using errcode = '22023';
  end if;
  if p_expected_generation is null or p_expected_generation < 0
     or p_expected_rpg_version is null or p_expected_rpg_version < 0
     or p_expected_finance_version is null or p_expected_finance_version < 0
     or p_expected_health_version is null or p_expected_health_version < 0 then
    raise exception 'expected generation/version must be non-negative' using errcode = '22023';
  end if;
  if p_rpg is null or jsonb_typeof(p_rpg) <> 'object'
     or p_finance is null or jsonb_typeof(p_finance) <> 'object'
     or p_health is null or jsonb_typeof(p_health) <> 'object' then
    raise exception 'restore payloads must be JSON objects' using errcode = '22023';
  end if;

  -- Credential/convenience-PIN keys are never restorable, even if a v4 file was
  -- manually edited after dry-run preview.
  if p_rpg ? 'hevy_api_key' or p_rpg ? 'rpg_pin_v1'
     or p_finance ? 'hevy_api_key' or p_finance ? 'rpg_pin_v1'
     or p_health ? 'hevy_api_key' or p_health ? 'rpg_pin_v1' then
    raise exception 'sensitive restore key blocked' using errcode = '22023';
  end if;

  -- Lock all existing owner/canonical rows in one deterministic order. If any
  -- later assertion fails PostgreSQL rolls the complete RPC transaction back.
  perform 1
  from public.app_state as s
  where s.user_id = v_uid and s.key in ('finance', 'health', 'rpg')
  order by s.key
  for update;

  select true, s.data, s.restore_generation, s.state_version
    into v_rpg_exists, v_rpg_data, v_rpg_generation, v_rpg_version
  from public.app_state as s
  where s.user_id = v_uid and s.key = 'rpg';

  select true, s.data, s.restore_generation, s.state_version
    into v_finance_exists, v_finance_data, v_finance_generation, v_finance_version
  from public.app_state as s
  where s.user_id = v_uid and s.key = 'finance';

  select true, s.data, s.restore_generation, s.state_version
    into v_health_exists, v_health_data, v_health_generation, v_health_version
  from public.app_state as s
  where s.user_id = v_uid and s.key = 'health';

  -- Missing canonical rows are accepted only before the first restore epoch.
  -- After generation 1+ all three rows must exist and share the same generation.
  if not coalesce(v_rpg_exists, false) then
    if p_expected_generation <> 0 or p_expected_rpg_version <> 0 then
      raise exception 'rpg baseline missing/conflicted' using errcode = '40001';
    end if;
    v_rpg_data := '{}'::jsonb; v_rpg_generation := 0; v_rpg_version := 0;
  elsif v_rpg_generation <> p_expected_generation or v_rpg_version <> p_expected_rpg_version then
    raise exception 'rpg restore baseline conflict' using errcode = '40001';
  end if;

  if not coalesce(v_finance_exists, false) then
    if p_expected_generation <> 0 or p_expected_finance_version <> 0 then
      raise exception 'finance baseline missing/conflicted' using errcode = '40001';
    end if;
    v_finance_data := '{}'::jsonb; v_finance_generation := 0; v_finance_version := 0;
  elsif v_finance_generation <> p_expected_generation or v_finance_version <> p_expected_finance_version then
    raise exception 'finance restore baseline conflict' using errcode = '40001';
  end if;

  if not coalesce(v_health_exists, false) then
    if p_expected_generation <> 0 or p_expected_health_version <> 0 then
      raise exception 'health baseline missing/conflicted' using errcode = '40001';
    end if;
    v_health_data := '{}'::jsonb; v_health_generation := 0; v_health_version := 0;
  elsif v_health_generation <> p_expected_generation or v_health_version <> p_expected_health_version then
    raise exception 'health restore baseline conflict' using errcode = '40001';
  end if;

  if p_strategy = 'merge' then
    v_target_rpg := v_rpg_data || p_rpg;
    v_target_finance := v_finance_data || p_finance;
    v_target_health := v_health_data || p_health;
  else
    v_target_rpg := p_rpg;
    v_target_finance := p_finance;
    v_target_health := p_health;
  end if;

  v_new_generation := p_expected_generation + 1;

  insert into public.app_state (key, user_id, data, updated_at, restore_generation, state_version)
  values ('rpg', v_uid, v_target_rpg, v_now, v_new_generation, v_rpg_version + 1)
  on conflict (user_id, key) do update
    set data = excluded.data,
        updated_at = excluded.updated_at,
        restore_generation = excluded.restore_generation,
        state_version = excluded.state_version;

  insert into public.app_state (key, user_id, data, updated_at, restore_generation, state_version)
  values ('finance', v_uid, v_target_finance, v_now, v_new_generation, v_finance_version + 1)
  on conflict (user_id, key) do update
    set data = excluded.data,
        updated_at = excluded.updated_at,
        restore_generation = excluded.restore_generation,
        state_version = excluded.state_version;

  insert into public.app_state (key, user_id, data, updated_at, restore_generation, state_version)
  values ('health', v_uid, v_target_health, v_now, v_new_generation, v_health_version + 1)
  on conflict (user_id, key) do update
    set data = excluded.data,
        updated_at = excluded.updated_at,
        restore_generation = excluded.restore_generation,
        state_version = excluded.state_version;

  return query select
    v_new_generation,
    v_now,
    v_rpg_version + 1,
    v_finance_version + 1,
    v_health_version + 1;
end;
$$;

revoke execute on function public.gamenfy_restore_app_state_v1(text,bigint,bigint,bigint,bigint,jsonb,jsonb,jsonb) from public;
revoke execute on function public.gamenfy_restore_app_state_v1(text,bigint,bigint,bigint,bigint,jsonb,jsonb,jsonb) from anon;
grant execute on function public.gamenfy_restore_app_state_v1(text,bigint,bigint,bigint,bigint,jsonb,jsonb,jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- FINAL authenticated-browser cutover target — NOT SAFE TO APPLY until the
-- new browser RPC writer is already deployed and naturally verified.
-- Reads remain direct/RLS-scoped; writes become RPC-only for authenticated UI.
-- Service-role access is deliberately untouched here and has its own owner-scope
-- cutover before true multi-user / composite-PK migration.
-- ---------------------------------------------------------------------------
revoke insert, update, delete on table public.app_state from authenticated;
revoke insert, update, delete on table public.app_state from anon;
grant select on table public.app_state to authenticated;

-- This contract is intentionally non-mutating if somebody executes the file.
rollback;
