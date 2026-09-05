-- Gamenfy Fitbit -> Daily Mission reconciliation audit
-- ChatGPT (OpenAI), 2026-09-04; owner-pairing hardening 2026-09-06
-- READ-ONLY. This file must never mutate app_state.
--
-- Purpose:
-- - enumerate Fitbit-qualified Walking/Sleep dates;
-- - verify canonical rpg_habitlog_v1 membership using the real shape
--   habitlog[habit_id][YYYY-MM-DD] (NOT habitlog[date][habit]);
-- - show manual-off suppression and retry-safe XP-ledger state;
-- - expose migration markers and cloud timestamps for natural-session QA.
--
-- Critical multi-user rule:
-- RPG and Fitbit rows MUST be paired by the same app_state.user_id. Never use
-- independent LIMIT 1 subqueries for these two sources: with multiple owners
-- those could compare one person's health data against another person's RPG.
-- user_id is used only for the join and is intentionally not exposed in output.
--
-- Threshold contract mirrors autohabit-reconcile.js:
-- walking >= 10,000 steps
-- sleep   >= 420 minutes

with state as (
  select
    r.data as rpg,
    h.data as health,
    r.updated_at as rpg_updated_at,
    h.updated_at as health_updated_at
  from public.app_state r
  join public.app_state h
    on h.user_id = r.user_id
   and h.key = 'health_fitbit'
  where r.key = 'rpg'
),
health_days as (
  select
    s.rpg,
    s.rpg_updated_at,
    s.health_updated_at,
    day.key as activity_date,
    day.value as payload
  from state s
  cross join lateral jsonb_each(coalesce(s.health, '{}'::jsonb)) as day(key, value)
  where day.key ~ '^\d{4}-\d{2}-\d{2}$'
),
qualified as (
  select
    rpg,
    rpg_updated_at,
    health_updated_at,
    'walking'::text as habit_id,
    activity_date,
    nullif(payload->>'steps', '')::numeric as source_value,
    10000::numeric as threshold
  from health_days
  where nullif(payload->>'steps', '')::numeric >= 10000

  union all

  select
    rpg,
    rpg_updated_at,
    health_updated_at,
    'sleep'::text as habit_id,
    activity_date,
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
    coalesce((q.rpg->'rpg_habitlog_v1'->q.habit_id->>q.activity_date)::boolean, false) as canonical_present,
    q.rpg->'rpg_autohabit_v1'->>(q.habit_id || ':' || q.activity_date) as auto_state,
    coalesce((q.rpg->'rpg_autohabit_v1'->>('__xp_awarded_v1:' || q.habit_id || ':' || q.activity_date))::boolean, false) as xp_awarded,
    coalesce((q.rpg->'rpg_autohabit_v1'->>'__retrospective_v2_migrated')::boolean, false) as retrospective_migrated,
    coalesce((q.rpg->'rpg_autohabit_v1'->>'__xp_ledger_v1_migrated')::boolean, false) as xp_ledger_migrated,
    q.health_updated_at,
    q.rpg_updated_at
  from qualified q
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
