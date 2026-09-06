-- Gamenfy app_state Stage 2A — additive authenticated CAS write gate
-- Performed-by: ChatGPT (OpenAI), 2026-09-06
--
-- SAFE ROLLOUT BOUNDARY:
-- - adds state_version;
-- - adds ONE normal authenticated browser write RPC for canonical domains;
-- - does NOT create the restore RPC;
-- - does NOT revoke current table INSERT/UPDATE privileges yet;
-- - does NOT change service_role grants;
-- - keeps legacy PRIMARY KEY(key) intact.

begin;

alter table public.app_state
  add column if not exists state_version bigint not null default 0;

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

  if p_key not in ('rpg', 'finance', 'health') then
    raise exception 'unsupported app_state key' using errcode = '22023';
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
  end if;

  if p_expected_generation <> 0 or p_expected_version <> 0 then
    raise exception 'missing baseline conflict' using errcode = '40001';
  end if;

  -- Plain INSERT is intentional. A concurrent creator must raise a uniqueness
  -- error rather than silently overwrite a row that appeared after the caller's
  -- baseline. The legacy global key PK remains in place during this stage.
  return query
  insert into public.app_state (
    key, user_id, data, updated_at, restore_generation, state_version
  ) values (
    p_key, v_uid, p_data, v_now, 0, 1
  )
  returning app_state.key,
            app_state.restore_generation,
            app_state.state_version,
            app_state.updated_at;
end;
$$;

revoke execute on function public.gamenfy_write_app_state(text,jsonb,bigint,bigint) from public;
revoke execute on function public.gamenfy_write_app_state(text,jsonb,bigint,bigint) from anon;
grant execute on function public.gamenfy_write_app_state(text,jsonb,bigint,bigint) to authenticated;

commit;
