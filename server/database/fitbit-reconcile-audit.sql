-- Gamenfy Fitbit -> Daily Mission reconciliation audit
-- ChatGPT (OpenAI), 2026-09-04
-- READ-ONLY. This file must never mutate app_state.
--
-- Purpose:
-- - enumerate Fitbit-qualified Walking/Sleep dates;
-- - verify canonical rpg_habitlog_v1 membership using the real shape
--   habitlog[habit_id][YYYY-MM-DD] (NOT habitlog[date][habit]);
-- - show manual-off suppression and retry-safe XP-ledger state;
-- - expose migration markers and cloud timestamps for natural-session QA.
--
-- Threshold contract mirrors autohabit-reconcile.js:
-- walking >= 10,000 steps
-- sleep   >= 420 minutes

with state as (
  select
    max(updated_at) filter (where key = 'health_fitbit') as health_updated_at,
    max(updated_at) filter (where key = 'rpg') as rpg_updated_at,
    max(data) filter (where key = 'health_fitbit') as health,
    max(data) filter (where key = 'rpg') as rpg
  from public.app_state
  where key in ('health_fitbit', 'rpg')
),
health_days as (
  select day.key as activity_date, day.value as payload
  from state
  cross join lateral jsonb_each(coalesce(state.health, '{}'::jsonb)) as day(key, value)
  where day.key ~ '^\d{4}-\d{2}-\d{2}$'
),
qualified as (
  select 'walking'::text as habit_id, activity_date,
         nullif(payload->>'steps', '')::numeric as source_value,
         10000::numeric as threshold
  from health_days
  where nullif(payload->>'steps', '')::numeric >= 10000

  union all

  select 'sleep'::text as habit_id, activity_date,
         nullif(payload->>'sleepMinutes', '')::numeric as source_value,
         420::numeric as threshold
  from health_days
  where nullif(payload->>'sleepMinutes', '')::numeric >= 420
),
detail as (
  select
    q.habit_id,
    q.activity_date,
    q.source_value,
    q.threshold,
    coalesce((s.rpg->'rpg_habitlog_v1'->q.habit_id->>q.activity_date)::boolean, false) as canonical_present,
    s.rpg->'rpg_autohabit_v1'->>(q.habit_id || ':' || q.activity_date) as auto_state,
    coalesce((s.rpg->'rpg_autohabit_v1'->>('__xp_awarded_v1:' || q.habit_id || ':' || q.activity_date))::boolean, false) as xp_awarded,
    coalesce((s.rpg->'rpg_autohabit_v1'->>'__retrospective_v2_migrated')::boolean, false) as retrospective_migrated,
    coalesce((s.rpg->'rpg_autohabit_v1'->>'__xp_ledger_v1_migrated')::boolean, false) as xp_ledger_migrated,
    s.health_updated_at,
    s.rpg_updated_at
  from qualified q
  cross join state s
)
select
  habit_id,
  activity_date,
  source_value,
  threshold,
  canonical_present,
  auto_state,
  xp_awarded,
  case
    when canonical_present then 'canonical'
    when auto_state = 'manual-off' then 'manual-off'
    else 'pending'
  end as reconcile_status,
  retrospective_migrated,
  xp_ledger_migrated,
  health_updated_at,
  rpg_updated_at
from detail
order by activity_date, habit_id;
