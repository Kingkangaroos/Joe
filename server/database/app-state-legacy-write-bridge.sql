-- Gamenfy app_state Stage 2A.1 — legacy canonical write bridge
-- Performed-by: ChatGPT (OpenAI), 2026-09-06
--
-- Purpose: while old installed PWAs still have direct table write grants, make
-- those writes participate in the same monotone state_version protocol as the
-- Stage 2A CAS RPC. This is additive/backward-compatible and does NOT create a
-- restore path or revoke browser/service-role privileges.

begin;

create or replace function public.gamenfy_guard_canonical_app_state_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.key not in ('rpg', 'finance', 'health') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.restore_generation <> 0 then
      raise exception 'canonical insert restore generation must start at zero' using errcode = '40001';
    end if;

    if new.state_version = 0 then
      new.state_version := 1;
    elsif new.state_version <> 1 then
      raise exception 'canonical insert state version must start at one' using errcode = '40001';
    end if;

    new.updated_at := clock_timestamp();
    return new;
  end if;

  if new.user_id is distinct from old.user_id or new.key is distinct from old.key then
    raise exception 'canonical app_state identity is immutable' using errcode = '40001';
  end if;

  -- Until a reviewed restore RPC exists, no direct or RPC update is allowed to
  -- change restore epochs. The future restore migration must deliberately revise
  -- this guard in the same transaction as the restore function.
  if new.restore_generation <> old.restore_generation then
    raise exception 'restore generation change requires restore gate' using errcode = '40001';
  end if;

  -- Legacy direct writers do not know state_version and therefore submit the
  -- unchanged OLD value. Advance it for them. The Stage 2A CAS RPC already sends
  -- OLD+1, which is accepted unchanged. Any skip/backwards version is rejected.
  if new.state_version = old.state_version then
    new.state_version := old.state_version + 1;
  elsif new.state_version <> old.state_version + 1 then
    raise exception 'state version must advance exactly once' using errcode = '40001';
  end if;

  -- Device clocks are no longer authoritative for canonical cloud ordering.
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

drop trigger if exists gamenfy_canonical_app_state_write_guard on public.app_state;
create trigger gamenfy_canonical_app_state_write_guard
before insert or update on public.app_state
for each row
execute function public.gamenfy_guard_canonical_app_state_write();

commit;
