# Gamenfy Restore / Import Safety Contract

Status: **Phase 1.5 — dry-run + backup v4 owner binding + restore-generation model. No restore/apply path exists.**

A restore flow must never be implemented as a blind `for (...) localStorage.setItem(...)` loop. Current work remains analysis-only.

## What exists now

1. `lab-restore-dry-run.html` parses backup JSON locally with `FileReader`;
2. `backup-restore-validator.js` validates canonical RPG / Finance / Health keys and rejects sensitive credentials/PINs;
3. merge and overwrite semantics are previewed without writing data;
4. `backup-owner-binding.js` provides a pseudonymous SHA-256 same-account binding for backup v4;
5. `restore-generation-model.js` defines executable safety semantics for stale/offline dirty data;
6. `restoreReady=false` remains unconditional.

## Backup generations

### v2 / v3
Legacy backups remain useful for dry-run inspection, but they have no trusted same-account binding. They must never become directly restorable.

### v4
New exports are created only for an authenticated owner and include:

- `owner.bindingType = "supabase-user-sha256-v1"`;
- a SHA-256 fingerprint derived from the authenticated Supabase user id plus a fixed namespace prefix;
- **no raw user id**.

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

1. verify expected owner and current generation;
2. compare the expected `updated_at` baseline for RPG, Finance and Health;
3. apply all selected domain states;
4. increment one shared restore generation;
5. commit the three domain rows as one restore event or fail the entire operation.

Do **not** mutate local storage first and hope cloud sync catches up. Cloud must become the authoritative restored generation first; devices then converge from that committed generation.

## Live app_state owner/generation foundation

On 2026-09-06 production Supabase received an additive Phase 0 schema change: `restore_generation BIGINT NOT NULL DEFAULT 0` plus `UNIQUE(user_id,key)`. The legacy `PRIMARY KEY(key)` is intentionally still present while older production/browser/Edge Function writers exist. See `APP-STATE-OWNER-SCOPE-CUTOVER.md`.

The next browser client stamps dirty journal entries with the current generation, explicitly reads `(user_id,key)`, and writes through the composite conflict target. This makes the client generation-aware, but **does not yet make restore safe**: before any restore apply path, server-side write gating must prevent stale/old clients from bypassing the generation rule.

## Dirty-journal generation rule

Every future generation-aware dirty entry must carry the restore generation in which it was created. Replay is permitted only when:

- `dirty.generation === cloud.restore_generation`, **and**
- `dirty.ts > remote.updated_at`.

Legacy dirty entries are generation `0`. Once a restore commits generation `1+`, those legacy/offline entries can never resurrect pre-restore state, even if their device clock timestamp is later.

`restore-generation-model.js` is deliberately analysis-only: it exposes precondition assessment and a commit envelope but **no mutation method**.

## Sensitive and unknown keys

Sensitive keys remain blocked even if present in a manually edited backup:
- `hevy_api_key`
- `rpg_pin_v1`

Unknown non-canonical keys are excluded by default. Future migrations may explicitly whitelist reviewed legacy keys; never import unknown keys merely because they are present in JSON.

## Rollout order

1. Ship backup v4 same-account binding.
2. Keep Restore Dry Run read-only and verify v2/v3/v4 real files.
3. Design database restore-generation storage + atomic RPC.
4. Make `sync.js` generation-aware with executable race regression coverage.
5. Add Phase 2 apply behind Lab/explicit opt-in only.
6. Verify multi-device/offline resurrection scenarios naturally.
7. Only then consider exposing Restore in normal Settings/Character UI.

**Do not ship Phase 2 until executable regression coverage proves stale cloud state cannot resurrect pre-restore data, including from offline devices.**
