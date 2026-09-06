# Gamenfy `app_state` Owner-Scope Cutover

Status: **Phase 0 live; coordinated owner-scope/runtime cutover in progress.**

## Why this exists

`public.app_state` had correct owner RLS on `user_id`, but its primary key was only `key`. That means the database could hold only one row named `rpg`, one `finance`, one `health`, etc. across all users. A second account could therefore not own an independent row with the same logical key.

This was found before a second owner existed in `app_state`: at audit time there were 14 rows total, all owned by one account. No evidence of cross-account data loss was found.

## Live Phase 0 — 2026-09-06

Applied transactionally and verified:

- `restore_generation BIGINT NOT NULL DEFAULT 0` added to `public.app_state`;
- `UNIQUE (user_id, key)` added as `app_state_user_key_unique`;
- legacy `PRIMARY KEY (key)` deliberately retained;
- all existing 14 rows verified at restore generation `0`.

Because the legacy primary key remains, current production clients and deployed functions that still use `on_conflict=key` remain compatible. Phase 0 is additive only.

## Current RLS / ownership baseline

`app_state` has RLS enabled. Authenticated owner policies already scope SELECT, INSERT and UPDATE with `(select auth.uid()) = user_id`, including `WITH CHECK` for writes. The table also has an index on `user_id`.

The missing piece was uniqueness: RLS says *who* may see/write a row, while the old primary key incorrectly said there may be only one row with a given logical key database-wide.

## Direct callers that must be cut over before dropping `PRIMARY KEY(key)`

### Browser `sync.js`
Current legacy assumptions:
- upsert conflict target `key`;
- unload REST target `on_conflict=key`;
- initial pull selects by `key` and relies on RLS rather than also filtering `user_id`.

Target:
- explicit `(user_id,key)` read filter;
- `onConflict: 'user_id,key'` / REST `on_conflict=user_id,key`;
- carry `restore_generation` on reads/writes;
- dirty journal entries carry the generation in which they were created;
- a lower-generation remote snapshot never beats a higher-generation local/cloud baseline.

### Character backup exporter
Target:
- explicit authenticated `user_id` filter in addition to RLS;
- read `restore_generation` as backup metadata;
- continue to fail closed without authenticated owner context.

### Deployed `fitbit-sync`
Current deployed function is service-role scoped and therefore bypasses RLS. Its `health_fitbit` read currently selects only by logical key and its write currently uses `on_conflict=key`.

Before the legacy primary key is dropped it must:
- filter `health_fitbit` by its intended owner **and** logical key;
- write with composite conflict target `(user_id,key)`.

### Deployed Jarvis
Jarvis uses service-role reads/writes for `app_state`, so RLS does not protect those queries. Its generic `getRow` / `putRow` paths must become owner-explicit before multi-owner support. The separate server-secret migration remains open and must not be mixed into the schema cutover unless secrets can be configured safely.

### Deployed daily push
Daily push also uses service-role `app_state` helpers and must become owner-explicit before multi-owner support. Its separate secret/VAPID/Gemini server-secret migration remains open.

### Disabled legacy health routes
`health-sync` and `fitbit-intraday` currently return HTTP 410 and do not touch `app_state`; they do not block the cutover.

## Safe staged rollout

### Phase 0 — additive DB foundation — **DONE**
Add composite unique constraint and `restore_generation`, retain legacy PK.

### Phase 1 — browser owner + generation awareness
Ship client changes while both unique targets exist. Legacy dirty entries are interpreted as generation 0.

### Phase 2 — owner-scope deployed service-role functions
Update active functions that bypass RLS so every `app_state` query names the intended owner and writes target `(user_id,key)`.

### Phase 3 — controlled write path for canonical RPG/Finance/Health
Before any real restore can exist, direct authenticated mutation of canonical domain rows must be replaced or guarded by a generation-aware server transaction/RPC. A stale old client must not be able to resurrect pre-restore state merely by writing a later timestamp.

### Phase 4 — final composite primary key cutover
Only after production browser code and all active service-role writers are verified:

1. re-check there are no duplicate `(user_id,key)` pairs;
2. verify every writer uses the composite owner target;
3. transactionally drop legacy `app_state_pkey` on `(key)`;
4. make `(user_id,key)` the primary key;
5. re-run owner-isolation and all browserless regression tests;
6. verify active Edge Functions against the new key contract.

## Restore-generation rule

Client generation awareness is necessary but not sufficient. A future restore from generation `N` to `N+1` must ultimately be committed server-side and atomically across the canonical RPG/Finance/Health domains. Dirty state created in another generation must never replay into the new generation.

Before Phase 2 restore/apply is allowed, server-side write gating must prevent stale clients from bypassing that rule.

## Hard stop

Do **not** drop `PRIMARY KEY(key)` while the public production PWA or any active Edge Function still writes with `on_conflict=key`. The current Vercel production deployment is temporarily behind `main` because the account hit Vercel's build-rate-limit, so database changes must remain backwards compatible until a verified production deployment includes the composite-owner client code.
