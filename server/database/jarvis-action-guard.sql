-- Gamenfy Jarvis action boundary guard
-- Applied live 2026-09-04 by ChatGPT (OpenAI).
--
-- Purpose:
--   Protect the canonical public/private Daily Mission boundary even while an
--   older Jarvis Edge Function deployment still has stale habit membership.
--
-- Security:
--   - SECURITY INVOKER only; this does not bypass app_state RLS.
--   - Only mutates NEW.data for app_state key='jarvis_actions'.
--   - Does not read/write rpg, health, Fitbit or any other app_state row.
--   - Queue order is preserved.

create or replace function public.gamenfy_filter_jarvis_actions()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  filtered_queue jsonb;
begin
  if new.key <> 'jarvis_actions' then
    return new;
  end if;

  if jsonb_typeof(new.data -> 'queue') is distinct from 'array' then
    return new;
  end if;

  select coalesce(jsonb_agg(item order by ord), '[]'::jsonb)
    into filtered_queue
  from jsonb_array_elements(new.data -> 'queue') with ordinality as q(item, ord)
  where case coalesce(item ->> 'type', '')
    when 'checkHabit' then
      (item #>> '{payload,key}') = any(array[
        'budgeting','sleep','nutrition','walking','teeth','household',
        'meditation','gratitude','good_deed','screen_time','cold_shower'
      ]::text[])
      and (
        (item #>> '{payload,date}') is null
        or (item #>> '{payload,date}') ~ '^\d{4}-\d{2}-\d{2}$'
      )
    when 'addXP' then
      coalesce(item #>> '{payload,skill}', '') <> all(array['no_porn','weed_control','grounding']::text[])
    when 'claimQuest' then
      coalesce(item #>> '{payload,skill}', '') <> all(array['no_porn','weed_control','grounding']::text[])
    when 'planAgenda' then
      coalesce(item #>> '{payload,skillKey}', '') <> all(array['no_porn','weed_control','grounding']::text[])
    else true
  end;

  new.data := jsonb_set(new.data, '{queue}', filtered_queue, true);
  return new;
end;
$$;

drop trigger if exists gamenfy_guard_jarvis_actions on public.app_state;
create trigger gamenfy_guard_jarvis_actions
before insert or update of data on public.app_state
for each row
when (new.key = 'jarvis_actions')
execute function public.gamenfy_filter_jarvis_actions();
