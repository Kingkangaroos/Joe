# Gamenfy `app_state` Owner-Scope Cutover

Status: **Phase 0 live + browser Phase 1 live; service-role owner-scope cutover remains open.**

## Why this exists

`public.app_state` had correct owner RLS on `user_id`, but its primary key was only `key`. That means the database could hold only one row named `rpg`, one `finance`, one `health`, etc. across all users. A second account could therefore not own an independent row with the same logical key.

This was found before a second owner existed in `app_state`: at audit time there were 14 rows total, all owned by one account. No evidence of cross-account data loss was found.

## Live Phase 0 — 2026-09-06

Applied transactionally and verified:

- `restore_generation BIGINT NOT NULL DEFAULT 0` added to `public.app_state`;
- `UNIQUE (user_id, key)` added as `app_state_user_key_unique`;
- legacy `PRIMARY KEY (key)` deliberately retained;
- all existing 14 rows verified at restore generation `0`.

Because the legacy primary key remains, production functions that still use `on_conflict=key` remain compatible. Phase 0 is additive only.

## Current RLS / ownership baseline

`app_state` has RLS enabled. Authenticated owner policies already scope SELECT, INSERT and UPDATE with `(select auth.uid()) = user_id`, including `WITH CHECK` for writes. The table also has an index on `user_id`.

The missing piece was uniqueness: RLS says *who* may see/write a row, while the old primary key incorrectly says there may be only one row with a given logical key database-wide.

## Direct callers that must be safe before dropping `PRIMARY KEY(key)`

### Browser `sync.js` — **PHASE 1 SHIPPED**
Production now:
- explicitly filters initial canonical pulls by `(user_id,key)`;
- writes via `onConflict: 'user_id,key'` / REST `on_conflict=user_id,key`;
- carries `restore_generation` on reads and writes;
- stamps dirty journal entries with the generation in which they were created;
- replays dirty state only inside the exact current generation and only when newer than the remote baseline;
- refuses a lower-generation remote snapshot as authoritative over a higher known generation.

Verified production chain: main `b6062198250c77a65e1a461ebe63424e782531de`, Vercel `dpl_H9Bfpwixfz7ptRCNQZAEDWckyyWV` READY.

### Character backup exporter — **OWNER/GENERATION HARDENING SHIPPED**
Production now:
- explicitly filters canonical cloud rows by authenticated `user_id` in addition to RLS;
- reads `restore_generation` into backup metadata;
- overlays local dirty journal entries only when their generation exactly matches the cloud row and their timestamp is newer;
- fails closed without authenticated owner context;
- never serializes the raw owner id.

Latest backup dirty-overlay proof: guarded run `34027899310`, normal PR smoke `34027932770`, main `2bb05f746da0e684b0eb64560f05131d2d128341`, Vercel `dpl_5HNzU6VXciwQNgsLN97WJH4wxLKU` READY and public production source verified.

### Deployed `fitbit-sync` — **OPEN BEFORE FINAL PK CUTOVER**
Current deployed function is service-role scoped and therefore bypasses RLS. Its `health_fitbit` read historically selects only by logical key and its write uses the legacy conflict target.

Before the legacy primary key is dropped it must:
- identify the intended owner without a privacy-unsafe hard-coded fallback;
- filter `health_fitbit` by that owner **and** logical key;
- write with composite conflict target `(user_id,key)`;
- be regression-proven against the existing OAuth/cron behavior.

### Deployed Jarvis — **OPEN BEFORE FINAL PK CUTOVER**
Jarvis uses service-role reads/writes for `app_state`, so RLS does not protect those queries. Its generic `getRow` / `putRow` paths must become owner-explicit before multi-owner support.

The separate server-secret migration remains open. Do not redeploy Jarvis merely for owner scoping while re-embedding the existing server credential; the environment-secret prerequisite must be satisfied first.

### Deployed daily push — **OPEN BEFORE FINAL PK CUTOVER**
Daily push also uses service-role `app_state` helpers and must become owner-explicit before multi-owner support. Its separate secret/VAPID/provider-key migration remains open and must preserve existing subscriptions.

### Disabled legacy health routes
`health-sync` and `fitbit-intraday` currently return HTTP 410 and do not touch `app_state`; they do not block the cutover unless revived.

## Safe staged rollout

### Phase 0 — additive DB foundation — **DONE**
Composite owner/key unique constraint and `restore_generation` exist; legacy PK remains.

### Phase 1 — browser owner + generation awareness — **DONE**
Production browser sync and backup export use explicit owner scope and generation-aware rules while both unique targets exist. Legacy dirty entries are interpreted as generation 0 only.

### Phase 2 — owner-scope deployed service-role functions — **OPEN**
Update active functions that bypass RLS so every `app_state` query names the intended owner and writes target `(user_id,key)`. This phase must preserve each function's separate authentication/secret constraints.

### Phase 3 — controlled write path for canonical RPG/Finance/Health — **OPEN**
Before any real restore can exist, direct authenticated mutation of canonical domain rows must be replaced or guarded by a generation-aware server transaction/RPC. A stale old client must not be able to resurrect pre-restore state merely by writing a later timestamp.

Target restore transaction properties:
- authenticated owner comes from server auth context, not an arbitrary caller-supplied owner id;
- canonical domains only: `rpg`, `finance`, `health`;
- deterministic row locking;
- expected-generation and expected-baseline compare-and-swap checks;
- all selected domain mutations plus one shared generation increment commit atomically or all fail;
- no local-first restore.

### Phase 4 — final composite primary key cutover — **BLOCKED ON PHASES 2 + 3**
Only after production browser code and all active service-role writers are verified:

1. re-check there are no duplicate `(user_id,key)` pairs;
2. verify every active writer uses the composite owner target;
3. transactionally drop legacy `app_state_pkey` on `(key)`;
4. make `(user_id,key)` the primary key;
5. re-run owner-isolation and all browserless regression tests;
6. verify active Edge Functions against the new key contract.

## Restore-generation rule

Client generation awareness is necessary but not sufficient. A future restore from generation `N` to `N+1` must be committed server-side and atomically across the canonical RPG/Finance/Health domains. Dirty state created in another generation must never replay into the new generation or contaminate a later backup.

Before Phase 2 restore/apply is allowed, server-side write gating must also prevent stale clients from bypassing that rule.

## Hard stop

Do **not** drop `PRIMARY KEY(key)` while any active service-role function still reads/writes `app_state` by logical key alone or writes with `on_conflict=key`.

The browser side is no longer the blocker: current production has the owner/generation-aware client and backup hardening. The remaining blocker is the coordinated server/service-role cutover plus the atomic restore write gate. Keep database changes backwards compatible until those are proven.
