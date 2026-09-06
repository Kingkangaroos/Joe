# Gamenfy `app_state` Owner-Scope Cutover

Status: **Phase 0 live + browser Phase 1 live; server write-gate design is regression-proven but not live; service-role owner-scope cutover remains open.**

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

`state_version` is **not live**. It exists only in the rollback-only server write-gate design contract until a separate reviewed Stage-A migration is proven safe.

## Current RLS / ownership baseline

`app_state` has RLS enabled. Authenticated owner policies already scope SELECT, INSERT and UPDATE with `(select auth.uid()) = user_id`, including `WITH CHECK` for writes. The table also has an index on `user_id`.

The missing piece was originally uniqueness; restore design exposed a second issue: RLS owner checks do not stop an authenticated **old client** from writing its own row through the table after a future restore. A restore-safe architecture therefore needs both owner isolation **and** a server CAS gate for browser writes.

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

This browser code is generation-aware but still performs direct table mutations. That is acceptable for the current no-restore state, but direct writes must eventually move behind the server gate **before** any restore apply path becomes possible.

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

## Server write gate discovered during restore design

A restore RPC by itself does **not** close the resurrection race. Suppose cloud has been restored from generation `0` to generation `1`, but an old installed PWA still uses direct authenticated table writes. That PWA can write new `data` to its own row without participating in the generation compare-and-swap protocol. RLS correctly proves ownership but cannot prove freshness.

The target server gate therefore separates two concepts:

- `restore_generation`: restore epoch. A restore increments all canonical rows together from `N` to `N+1`.
- `state_version`: monotonically increasing per-row write version inside an epoch. Every successful normal browser write increments it by exactly one.

Normal authenticated writes must eventually call a restricted RPC with expected generation + expected version. Restore must validate one shared expected generation + all three canonical expected versions while holding row locks.

The current proof artifacts are:
- `app-state-server-gate-model.js` — executable, pure, no network/database writes;
- `server/database/app-state-generation-write-gate-contract.sql` — starts `BEGIN`, ends `ROLLBACK`, explicitly marked **DO NOT APPLY TO PRODUCTION**;
- `tests/app-state-server-write-gate-smoke.js` — stale generation, stale same-generation version, old PWA after restore, merge/overwrite, missing baseline, sensitive key and SQL security/staging coverage.

The restore design explicitly requires `rpg`, `finance` and `health` all to exist before restore. Missing canonical rows are rejected because an absent row cannot be locked; they must first be initialized via the normal write path, then the restore must be previewed and confirmed again.

## Safe staged rollout

### Phase 0 — additive DB foundation — **DONE**
Composite owner/key unique constraint and `restore_generation` exist; legacy PK remains.

### Phase 1 — browser owner + generation awareness — **DONE**
Production browser sync and backup export use explicit owner scope and generation-aware rules while both unique targets exist. Legacy dirty entries are interpreted as generation 0 only.

### Phase 1.5 — server write/restore gate design — **REGRESSION-PROVEN, NOT LIVE**
The model + rollback-only SQL contract establish:
- authenticated owner from `auth.uid()`, never caller-supplied owner id;
- `state_version` CAS for normal concurrent writes;
- restore-generation CAS against all three canonical rows;
- mandatory complete baselines;
- deterministic row locking;
- update-only atomic restore for the three existing rows;
- sensitive restore-key blocking;
- restricted RPC execute grants;
- eventual direct authenticated write revocation only after current browser migration.

### Phase 2A — additive server gate deployment — **OPEN**
Create a separate reviewed migration that adds only:
- `state_version BIGINT NOT NULL DEFAULT 0`;
- restricted normal-write RPC;
- restricted atomic restore RPC.

Do **not** revoke current authenticated table writes in the same first deployment. Run database advisors/security review and verify exact function grants and owner behavior.

### Phase 2B — current browser moves to normal write RPC — **OPEN**
Update `sync.js` to read `state_version`, submit expected generation/version to the RPC and process version conflicts by re-reading/reconciling rather than blind retry. Direct writes stay temporarily available during this compatibility window.

### Phase 2C — close stale-browser direct-write bypass — **OPEN**
Only after the current browser RPC path is deployed and naturally verified:
- revoke authenticated/anon INSERT, UPDATE, DELETE on `public.app_state`;
- keep authenticated SELECT + RLS;
- prove a stale direct-write client cannot mutate rows;
- prove the current RPC client still syncs.

### Phase 3 — owner-scope deployed service-role functions — **OPEN**
Update active functions that bypass RLS so every `app_state` query names the intended owner and writes target `(user_id,key)`. This phase must preserve each function's separate authentication/secret constraints.

The authenticated browser grant cutover does not constrain service-role callers. They remain a separate privileged threat/architecture surface.

### Phase 4 — final composite primary key cutover — **BLOCKED ON PHASES 2C + 3**
Only after production browser code and all active service-role writers are verified:

1. re-check there are no duplicate `(user_id,key)` pairs;
2. verify every active writer uses the composite owner target;
3. transactionally drop legacy `app_state_pkey` on `(key)`;
4. make `(user_id,key)` the primary key;
5. re-run owner-isolation and all browserless regression tests;
6. verify active Edge Functions against the new key contract.

### Phase 5 — restore apply — **BLOCKED**
Only after the server gate is live, stale direct browser writes are closed, service-role ownership is safe, and the remaining restore confirmation/backup gates are implemented may a Lab-only restore apply path be considered.

## Restore-generation rule

Client generation awareness is necessary but not sufficient. A future restore from generation `N` to `N+1` must be committed server-side and atomically across the canonical RPG/Finance/Health domains. Dirty state created in another generation must never replay into the new generation or contaminate a later backup.

`state_version` adds the in-generation CAS layer, so two current clients cannot silently last-write-win simply because their local timestamps differ.

Before restore/apply is allowed, the database privilege boundary must also prevent stale direct clients from bypassing both rules.

## Hard stops

Do **not** apply `server/database/app-state-generation-write-gate-contract.sql` directly. It is a rollback-only review/test artifact, not a migration.

Do **not** revoke authenticated app_state table writes until the current browser has shipped and naturally verified the normal RPC writer.

Do **not** drop `PRIMARY KEY(key)` while any active service-role function still reads/writes `app_state` by logical key alone or writes with `on_conflict=key`.

Current production is safe for the existing no-restore, one-owner mode. The next real database step is a separately reviewed **additive** Stage-2A server-gate migration — not restore apply and not the final PK cutover.
