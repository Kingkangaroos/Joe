# Gamenfy Restore / Import Safety Contract

Status: **Phase 1 only — dry-run analysis exists. No restore/apply path exists.**

The current backup exporter writes Gamenfy backup version 2 and excludes `hevy_api_key` and `rpg_pin_v1`. A restore flow must never be implemented as a blind `for (...) localStorage.setItem(...)` loop.

## Phase 1 — shipped by this work

Read-only analysis only:

1. parse JSON locally with `FileReader`;
2. require root object, `app: "gamenfy"`, version >= 2, object-shaped `keys`;
3. reject sensitive credential/PIN keys;
4. exclude unknown non-canonical keys;
5. classify canonical RPG / Finance / Health state;
6. compare against current device without exposing values on-screen;
7. preview `merge` semantics;
8. preview `overwrite` semantics including which current in-scope keys would be removed;
9. keep `restoreReady=false` unconditionally.

`lab-restore-dry-run.html` is a product/UX proof, not an importer.

## Blocking gap in backup v2

Backup v2 has no signed-in owner manifest. Therefore a v2 file cannot prove that it belongs to the currently authenticated owner.

Dry-run may inspect it, but a real restore must remain blocked.

A future backup v3 should add a non-secret owner binding that can be checked against the authenticated session at restore time. Do not include tokens, passwords, API keys, PINs, push endpoints or secret material in that manifest.

## Required gates before Phase 2 can write anything

All gates below are mandatory:

### A. Owner/auth proof
- authenticated user exists;
- backup owner binding matches the authenticated owner;
- mismatch hard-fails before any local/cloud mutation.

### B. Backup-before-restore
- create a fresh credential-free export of the current state immediately before applying;
- surface its timestamp and success to the user;
- if pre-restore backup creation fails, restore does not start.

### C. Explicit semantics
User must choose one:

- **Merge:** incoming trusted keys replace same-name keys; current keys absent from backup remain untouched.
- **Overwrite:** incoming trusted keys replace same-name keys and current trusted keys absent from the selected backup scope are removed.

Never infer overwrite from file contents.

### D. Domain preview
Before confirmation, show per-domain counts for:
- new;
- changed;
- unchanged;
- removed (overwrite only);
- blocked sensitive keys;
- excluded unknown keys.

Do not require showing raw personal values in the preview.

### E. Two-step confirmation
A destructive restore should require:
1. explicit review screen;
2. explicit final confirmation that names the chosen strategy and affected domains.

### F. Cloud convergence protection
This is the hardest technical gate.

The app's owner-scoped cloud rows can re-apply older state after local mutation if dirty/version ordering is mishandled. A real restore must use a coordinated restore transaction/version marker so that:
- restored state becomes the authoritative next revision;
- pre-restore cloud snapshots cannot win a later race;
- all relevant scopes (RPG, Finance, Health) converge to the same restore generation;
- a crash between local apply and cloud commit can be detected/recovered without silently mixing generations.

Do not ship Phase 2 until executable regression coverage proves stale cloud state cannot resurrect pre-restore data.

## Sensitive and unknown keys

Sensitive keys remain blocked even if present in a manually edited backup:
- `hevy_api_key`
- `rpg_pin_v1`

Unknown non-canonical keys are excluded by default. Future migrations may explicitly whitelist old keys after their meaning is reviewed; never import unknown keys merely because they are present in JSON.

## Rollout order

1. Dry-run Lab on real backups.
2. Backup v3 owner manifest design.
3. Cloud restore-generation protocol + tests.
4. Phase 2 behind Lab/explicit opt-in.
5. Natural multi-device verification.
6. Only then consider exposing Restore in normal Settings/Character UI.
