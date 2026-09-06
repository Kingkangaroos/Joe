# Gamenfy Restore / Import Safety Contract

Status: **Phase 1.5 — dry-run + backup v4 owner binding + live owner/generation-aware browser foundation. No restore/apply path exists.**

A restore flow must never be implemented as a blind `for (...) localStorage.setItem(...)` loop. Current restore work remains non-mutating.

## What exists now

1. `lab-restore-dry-run.html` parses backup JSON locally with `FileReader`;
2. `backup-restore-validator.js` validates canonical RPG / Finance / Health keys and rejects sensitive credentials/PINs;
3. merge and overwrite semantics are previewed without writing data;
4. `backup-owner-binding.js` provides a pseudonymous SHA-256 same-account binding for backup v4;
5. `restore-generation-model.js` defines executable client-side safety semantics for stale/offline dirty data;
6. production `sync.js` explicitly scopes canonical cloud rows by authenticated `(user_id,key)`, carries `restore_generation`, and permits dirty replay only inside the exact current generation;
7. production backup v4 applies the same generation rule before overlaying newer local dirty state;
8. `app-state-server-gate-model.js` now regression-models the future server write gate and atomic restore transaction without touching a network/database;
9. `server/database/app-state-generation-write-gate-contract.sql` is a **ROLLBACK-only design contract**, not a migration: it specifies `state_version`, a normal authenticated CAS write RPC, an atomic restore RPC and the eventual direct-write revocation sequence;
10. `restoreReady=false` remains unconditional and there is no apply mutation method.

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

### B. Fresh, complete cloud baseline
Before planning a restore, re-read owner-scoped `app_state` rows for all three durable domains:
- RPG;
- Finance;
- Health.

Every canonical row must already exist. Capture each row's `updated_at`, `restore_generation` and future `state_version` in the same planning session. A missing row, changed generation or changed version invalidates the plan. Missing canonical rows must be initialized through the normal write path first, followed by a completely new preview/confirmation cycle.

This is stricter than allowing a restore RPC to create missing rows: an absent row cannot be row-locked, so allowing insert-on-restore creates an insert-vs-restore race.

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

### G. Server-side write gate — normal writes and restore must share the same epoch rules
A restore-only RPC is not sufficient while authenticated browsers can still mutate `app_state` directly. An old pre-cutover PWA could otherwise write after a restore and bypass generation validation.

The safe target therefore has two server paths:

#### G1. Normal authenticated browser write RPC
Every future authenticated browser mutation must supply:
- current `restore_generation`;
- current per-row `state_version`;
- new JSON object data.

The server derives owner identity from `auth.uid()` and compares both tokens while holding the row lock. On success:
- `restore_generation` stays unchanged;
- `state_version` increments by exactly 1;
- `updated_at` is generated by the server.

A stale generation rejects an old/offline pre-restore client. A stale `state_version` rejects a concurrent write inside the same restore generation without relying on device clocks.

For a genuinely missing non-restore row, the normal write path may insert only from expected generation/version `0/0`. It uses a plain insert so a concurrent unique collision fails instead of silently overwriting a newer baseline.

#### G2. Atomic cloud-first restore RPC
A future server-side transaction/RPC must atomically:

1. derive the owner from authenticated server context rather than trusting a caller-supplied owner id;
2. restrict restore mutation to canonical `rpg`, `finance`, `health` domains;
3. require all three owner/domain rows to exist;
4. lock all three rows in deterministic order;
5. verify one expected restore generation plus each row's expected `state_version`;
6. compute merge/overwrite results only from validated canonical payloads;
7. increment one shared restore generation from `N` to `N+1`;
8. update all three existing rows with the same new generation and one server transaction timestamp;
9. increment each row's `state_version` exactly once;
10. commit the whole restore event or fail the entire operation.

Do **not** mutate local storage first and hope cloud sync catches up. Cloud must become the authoritative restored generation first; devices then converge from that committed generation.

A stale plan must fail closed: if one row is missing, or even one expected generation/version no longer matches, the RPC returns no partial writes and the client must re-read, re-preview and reconfirm.

### H. Close the direct authenticated-write bypass only after RPC rollout
The final browser cutover must happen in this order:

1. add `state_version` + restricted RPCs while existing direct writes still work;
2. ship browser code that uses the normal write RPC and naturally verify it;
3. only then revoke direct `INSERT`, `UPDATE`, `DELETE` on `public.app_state` from browser roles;
4. keep direct owner-scoped `SELECT` under RLS;
5. verify an old direct-write PWA is rejected by database grants while a current RPC client still syncs.

Do not reverse steps 2 and 3 or current clients could be locked out.

## Live app_state owner/generation foundation

On 2026-09-06 production Supabase received an additive Phase 0 schema change:

- `restore_generation BIGINT NOT NULL DEFAULT 0`;
- `UNIQUE(user_id,key)` as an additional composite uniqueness contract;
- legacy `PRIMARY KEY(key)` intentionally retained.

All existing rows were verified at generation 0 when Phase 0 was applied. See `server/database/app-state-owner-scope-phase0.sql` and `APP-STATE-OWNER-SCOPE-CUTOVER.md`.

`state_version` is **not live yet**. The server-gate SQL currently exists only as a rollback-only design/regression contract.

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

The browser foundation therefore removes the known client-side dirty-replay resurrection path, but **does not yet make restore safe**. Direct authenticated table writes and service-role callers can still bypass a future restore generation unless the server write gate is staged and enforced.

## Service-role owner-scope prerequisite

The legacy global `PRIMARY KEY(key)` cannot be removed yet. Active server/service-role paths historically read or write `app_state` by logical key only, and service-role privileges bypass normal owner RLS protection.

Before true multi-user or final PK cutover:

- deployed `fitbit-sync` must identify/filter its intended owner explicitly and use `(user_id,key)` writes;
- deployed Jarvis `app_state` helpers must be owner-explicit;
- deployed daily-push `app_state` helpers must be owner-explicit where they touch owner state;
- disabled HTTP-410 health routes do not block unless revived;
- Jarvis/push owner-scope changes must respect their separate server-secret migration blockers and must not re-embed exposed credentials simply to complete this cutover.

The future revocation of authenticated browser table writes does **not** solve service-role ownership. Service-role is a separate privileged caller class and remains explicitly out of scope for casual grant changes.

## Dirty-journal generation rule

Every generation-aware dirty entry carries the restore generation in which it was created. Replay is permitted only when:

- `dirty.generation === cloud.restore_generation`, **and**
- `dirty.ts > remote.updated_at`.

Legacy dirty entries are generation `0`. Once a restore commits generation `1+`, those legacy/offline entries can never resurrect pre-restore state through the current client.

The future server gate adds the second layer: even a stale client that ignores the dirty-journal rule cannot commit with an old restore generation or state version once direct table writes are closed.

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
6. **DESIGN/TEST DONE, NOT LIVE** — normal authenticated write-gate model + atomic three-domain restore model + rollback-only SQL contract, including missing-baseline rejection and per-write `state_version` CAS.
7. **NEXT** — create a reviewed deployable Stage-A migration containing only additive `state_version` + restricted RPCs; run database security/advisor checks before applying anything.
8. **NEXT** — adapt browser sync to the normal write RPC while direct table writes remain temporarily available, then naturally verify current-device sync.
9. **THEN** — revoke direct authenticated browser mutations so stale PWAs cannot bypass generation/version CAS.
10. **IN PARALLEL / BEFORE MULTI-USER** — owner-scope all active service-role `app_state` readers/writers while preserving their separate auth/secret requirements.
11. **THEN** — final composite owner/key primary-key cutover after every active writer is proven safe.
12. **THEN** — add Phase 2 restore apply behind Lab/explicit opt-in only, with owner-match + complete fresh baselines + zero-dirty + backup-before-restore + two-step confirmation gates.
13. Verify multi-device/offline resurrection scenarios naturally.
14. Only then consider exposing Restore in normal Settings/Character UI.

**Do not ship Phase 2 until executable regression coverage and live server-gate verification prove stale cloud state cannot resurrect pre-restore data, including from offline devices, old PWAs and privileged service-role callers.**
