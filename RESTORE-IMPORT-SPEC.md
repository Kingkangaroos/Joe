# Gamenfy Restore / Import Safety Contract

Status: **Phase 1.5 — dry-run + backup v4 owner binding + live owner/generation-aware browser foundation. No restore/apply path exists.**

A restore flow must never be implemented as a blind `for (...) localStorage.setItem(...)` loop. Current restore work remains non-mutating.

## What exists now

1. `lab-restore-dry-run.html` parses backup JSON locally with `FileReader`;
2. `backup-restore-validator.js` validates canonical RPG / Finance / Health keys and rejects sensitive credentials/PINs;
3. merge and overwrite semantics are previewed without writing data;
4. `backup-owner-binding.js` provides a pseudonymous SHA-256 same-account binding for backup v4;
5. `restore-generation-model.js` defines executable safety semantics for stale/offline dirty data;
6. production `sync.js` explicitly scopes canonical cloud rows by authenticated `(user_id,key)`, carries `restore_generation`, and permits dirty replay only inside the exact current generation;
7. production backup v4 applies the same generation rule before overlaying newer local dirty state;
8. `restoreReady=false` remains unconditional and there is no apply mutation method.

## Backup generations

### v2 / v3
Legacy backups remain useful for dry-run inspection, but they have no trusted same-account binding. They must never become directly restorable.

### v4
New exports are created only for an authenticated owner and include:

- `owner.bindingType = "supabase-user-sha256-v1"`;
- a SHA-256 fingerprint derived from the authenticated Supabase user id plus a fixed namespace prefix;
- **no raw user id**;
- per-domain cloud `restore_generation` metadata.

This binding is only a privacy-minimal *same-account guard*. It is **not a digital signature and does not prove file integrity or authenticity**. A manually edited v4 file can still alter its JSON. Therefore a future restore must compare the backup fingerprint against the *currently authenticated* owner immediately before apply and must still perform all remaining gates below.

## Mandatory gates before Phase 2 can write anything

### A. Owner/auth proof — authenticated owner match
- authenticated user exists;
- current owner fingerprint is derived at restore time;
- backup v4 binding matches exactly;
- v2/v3, malformed binding, raw-owner-id manifest or mismatch hard-fails before mutation.

### B. Fresh cloud baseline
Before planning a restore, re-read owner-scoped `app_state` rows for all three durable domains:
- RPG;
- Finance;
- Health.

Capture each row's `updated_at` and current restore generation in the same planning session. Missing or changed baselines invalidate the plan.

### C. No unresolved local dirty state
A real restore must not begin while there are unresolved local dirty-journal entries. First flush them successfully or explicitly abort the restore. Never silently discard them.

### D. Backup-before-restore
Create a fresh credential-free backup of the current authoritative state immediately before applying. Surface its timestamp and success. If this export fails, restore does not start.

### E. Explicit semantics
User must choose one:

- **Merge:** incoming trusted keys replace same-name keys; current keys absent from backup remain untouched.
- **Overwrite:** incoming trusted keys replace same-name keys and current trusted keys absent from the selected backup scope are removed.

Never infer overwrite from file contents.

### F. Domain preview + two-step confirmation
Before confirmation show per-domain counts for new, changed, unchanged and removed (overwrite only), plus blocked sensitive and excluded unknown keys. Do not require raw personal values on-screen. A destructive restore requires a review screen and a second explicit final confirmation naming the chosen strategy and affected domains.

### G. Cloud convergence protection — atomic cloud-first restore generation
This is the central convergence gate. A future server-side transaction/RPC must atomically:

1. derive the owner from authenticated server context rather than trusting a caller-supplied owner id;
2. restrict mutation to canonical `rpg`, `finance`, `health` domains;
3. lock all affected owner/domain rows in deterministic order;
4. verify the expected restore generation and expected `updated_at` baseline for every selected domain;
5. compute and apply merge/overwrite results only from validated canonical payloads;
6. increment one shared restore generation from `N` to `N+1`;
7. write all selected domain rows with the same new generation and one transaction timestamp;
8. commit the whole restore event or fail the entire operation.

Do **not** mutate local storage first and hope cloud sync catches up. Cloud must become the authoritative restored generation first; devices then converge from that committed generation.

A stale plan must fail closed: if even one expected generation or baseline no longer matches, the RPC returns no partial writes and the client must re-read, re-preview and reconfirm.

## Live app_state owner/generation foundation

On 2026-09-06 production Supabase received an additive Phase 0 schema change:

- `restore_generation BIGINT NOT NULL DEFAULT 0`;
- `UNIQUE(user_id,key)` as an additional composite uniqueness contract;
- legacy `PRIMARY KEY(key)` intentionally retained.

All existing rows were verified at generation 0 when Phase 0 was applied. See `server/database/app-state-owner-scope-phase0.sql` and `APP-STATE-OWNER-SCOPE-CUTOVER.md`.

Production browser sync now:

- reads canonical cloud rows by explicit `(user_id,key)`;
- writes with composite `onConflict: 'user_id,key'`;
- writes and reads `restore_generation`;
- stamps dirty journal entries with the current generation;
- never replays a dirty entry from a different generation;
- treats lower-generation remote snapshots as stale.

Production backup v4 additionally refuses to overlay a local dirty entry unless:

- its generation exactly equals that domain's cloud restore generation; **and**
- its timestamp is newer than the cloud baseline.

The browser foundation therefore removes the known client-side resurrection path, but **does not yet make restore safe**. Server-side write gating is still mandatory because an old/stale client or a service-role caller must not be able to bypass the generation rule.

## Service-role owner-scope prerequisite

The legacy global `PRIMARY KEY(key)` cannot be removed yet. Active server/service-role paths historically read or write `app_state` by logical key only, and service-role privileges bypass normal owner RLS protection.

Before true multi-user or final PK cutover:

- deployed `fitbit-sync` must identify/filter its intended owner explicitly and use `(user_id,key)` writes;
- deployed Jarvis `app_state` helpers must be owner-explicit;
- deployed daily-push `app_state` helpers must be owner-explicit where they touch owner state;
- disabled HTTP-410 health routes do not block unless revived;
- Jarvis/push owner-scope changes must respect their separate server-secret migration blockers and must not re-embed exposed credentials simply to complete this cutover.

## Dirty-journal generation rule

Every generation-aware dirty entry carries the restore generation in which it was created. Replay is permitted only when:

- `dirty.generation === cloud.restore_generation`, **and**
- `dirty.ts > remote.updated_at`.

Legacy dirty entries are generation `0`. Once a restore commits generation `1+`, those legacy/offline entries can never resurrect pre-restore state, even if their device clock timestamp is later.

`restore-generation-model.js` remains non-mutating: it exposes precondition assessment and a commit envelope but no apply method.

## Sensitive and unknown keys

Sensitive keys remain blocked even if present in a manually edited backup:
- `hevy_api_key`
- `rpg_pin_v1`

Unknown non-canonical keys are excluded by default. Future migrations may explicitly whitelist reviewed legacy keys; never import unknown keys merely because they are present in JSON.

## Rollout order

1. **DONE** — backup v4 same-account binding.
2. **DONE / keep read-only** — Restore Dry Run v2/v3/v4 inspection.
3. **DONE** — additive DB Phase 0 (`restore_generation` + `UNIQUE(user_id,key)`, legacy PK retained).
4. **DONE** — production browser owner/generation awareness + executable race regression coverage.
5. **DONE** — generation-safe backup dirty-overlay rule.
6. **NEXT** — design and regression-test the authenticated atomic three-domain restore RPC; do not deploy/apply it yet merely because SQL parses.
7. **NEXT** — owner-scope all active service-role `app_state` readers/writers while preserving their separate auth/secret requirements.
8. **THEN** — final composite owner/key primary-key cutover after every active writer is proven safe.
9. **THEN** — add Phase 2 restore apply behind Lab/explicit opt-in only, with owner-match + fresh-baseline + zero-dirty + backup-before-restore + two-step confirmation gates.
10. Verify multi-device/offline resurrection scenarios naturally.
11. Only then consider exposing Restore in normal Settings/Character UI.

**Do not ship Phase 2 until executable regression coverage proves stale cloud state cannot resurrect pre-restore data, including from offline devices and old service-role callers.**
