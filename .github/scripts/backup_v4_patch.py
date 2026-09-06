from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

def replace_once(rel, old, new):
    p = ROOT / rel
    text = p.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'Expected patch target not found in {rel}: {old[:120]!r}')
    text = text.replace(old, new, 1)
    p.write_text(text, encoding='utf-8')

# Character exporter: load owner-binding helper, fail closed if unavailable,
# and emit backup v4 with pseudonymous same-account binding only.
replace_once(
    'character.html',
    '<script src="sync.js?v=11.0" defer></script>\n',
    '<script src="sync.js?v=11.0" defer></script>\n<script src="backup-owner-binding.js?v=1" defer></script>\n'
)
replace_once(
    'character.html',
    "    if(!window.gamenfySupabase || !window.gamenfyUserId) {\n      return fail('Cloud backup unavailable — sign in first');\n    }\n\n",
    "    if(!window.gamenfySupabase || !window.gamenfyUserId) {\n      return fail('Cloud backup unavailable — sign in first');\n    }\n    if(!window.GamenfyOwnerBinding || typeof window.GamenfyOwnerBinding.fingerprintUserId !== 'function') {\n      return fail('Cloud backup unavailable — owner binding helper failed to load');\n    }\n    const ownerFingerprint = await window.GamenfyOwnerBinding.fingerprintUserId(window.gamenfyUserId);\n\n"
)
replace_once(
    'character.html',
    "      version: 3,\n      source: 'owner-cloud-plus-newer-local-dirty',\n",
    "      version: 4,\n      owner: window.GamenfyOwnerBinding.createManifest(ownerFingerprint),\n      source: 'owner-cloud-plus-newer-local-dirty',\n"
)

# Cloud backup regression now locks the v4 contract as well as existing
# cloud-authority/dirty-journal guarantees.
replace_once(
    'tests/cloud-backup-smoke.js',
    "assert.ok(src.includes(\"const domains = ['rpg','finance','health']\"), 'backup must cover all three durable user domains');\n",
    "assert.ok(src.includes(\"const domains = ['rpg','finance','health']\"), 'backup must cover all three durable user domains');\nassert.ok(src.includes('<script src=\"backup-owner-binding.js?v=1\" defer></script>'),\n  'Character must load the shared pseudonymous owner-binding helper');\nassert.ok(src.includes('const ownerFingerprint = await window.GamenfyOwnerBinding.fingerprintUserId(window.gamenfyUserId)'),\n  'backup must derive a same-account binding from the authenticated owner');\nassert.ok(src.includes('version: 4'), 'new cloud backups must use backup format v4');\nassert.ok(src.includes('owner: window.GamenfyOwnerBinding.createManifest(ownerFingerprint)'),\n  'backup v4 must store only the pseudonymous owner manifest');\nassert.ok(!/owner:\\s*\\{[^}]*userId\\s*:/s.test(src),\n  'backup JSON must never serialize the raw authenticated user id');\n"
)

# Dry-run UI: distinguish a present v4 binding from a verified authenticated match.
replace_once(
    'lab-restore-dry-run.html',
    'owner proof: '+"'+(manifest.ownerProof?'aanwezig':'ontbreekt')+'"+' · restoreReady: <b>NEE</b>',
    'owner binding: '+"'+(manifest.ownerBindingPresent?'aanwezig':'ontbreekt')+'"+' · account match: niet geverifieerd · restoreReady: <b>NEE</b>'
)
replace_once(
    'lab-restore-dry-run.html',
    'Backup v2 bevat geen verifieerbare owner/auth-manifest. Een echte restore mag pas bestaan nadat owner-check, pre-restore backup, expliciete bevestiging én cloud-convergence bescherming technisch bewezen zijn.',
    'Backup v2/v3 heeft geen same-account binding. Backup v4 kan die pseudoniem bevatten, maar deze offline dry-run verifieert bewust geen ingelogd account. Een echte restore mag pas bestaan nadat authenticated owner-match, pre-restore backup, expliciete bevestiging én generation-safe cloud convergence technisch bewezen zijn.'
)

# Extend the validator smoke with v4 binding semantics while retaining legacy dry-run support.
p = ROOT / 'tests/restore-dry-run-smoke.js'
text = p.read_text(encoding='utf-8')
needle = "assert.ok(good.warnings.some(x=>/Owner\\/auth proof is missing/.test(x)));\n"
insert = needle + "\nconst fp='a'.repeat(64);\nconst v4=V.validateBackup({app:'gamenfy',version:4,exportedAt:'2026-09-06T00:00:00Z',owner:{bindingType:'supabase-user-sha256-v1',fingerprint:fp},keys:{rpg_goals_v1:'[]'}});\nassert.equal(v4.valid,true,'credential-free v4 backup with pseudonymous owner binding should be analyzable');\nassert.equal(v4.manifest.ownerBindingPresent,true);\nassert.equal(v4.manifest.ownerProof,false,'offline parsing alone must never claim authenticated owner proof');\nassert.deepEqual(V.compareOwnerFingerprint(v4,fp),{verified:true,match:true,reason:'same-account'});\nassert.equal(V.compareOwnerFingerprint(v4,'b'.repeat(64)).match,false);\nconst rawV4=V.validateBackup({app:'gamenfy',version:4,owner:{userId:'raw-owner-id'},keys:{rpg_goals_v1:'[]'}});\nassert.equal(rawV4.valid,false,'v4 raw owner ids must hard-fail validation');\nassert.ok(rawV4.errors.some(x=>/raw user ID/i.test(x)));\n"
if needle not in text:
    raise SystemExit('restore-dry-run smoke insertion target missing')
text = text.replace(needle, insert, 1)
p.write_text(text, encoding='utf-8')

# Rewrite the durable safety contract so it matches the actual exporter generations
# and the new analysis-only generation model.
(ROOT / 'RESTORE-IMPORT-SPEC.md').write_text('''# Gamenfy Restore / Import Safety Contract\n\nStatus: **Phase 1.5 — dry-run + backup v4 owner binding + restore-generation model. No restore/apply path exists.**\n\nA restore flow must never be implemented as a blind `for (...) localStorage.setItem(...)` loop. Current work remains analysis-only.\n\n## What exists now\n\n1. `lab-restore-dry-run.html` parses backup JSON locally with `FileReader`;\n2. `backup-restore-validator.js` validates canonical RPG / Finance / Health keys and rejects sensitive credentials/PINs;\n3. merge and overwrite semantics are previewed without writing data;\n4. `backup-owner-binding.js` provides a pseudonymous SHA-256 same-account binding for backup v4;\n5. `restore-generation-model.js` defines executable safety semantics for stale/offline dirty data;\n6. `restoreReady=false` remains unconditional.\n\n## Backup generations\n\n### v2 / v3\nLegacy backups remain useful for dry-run inspection, but they have no trusted same-account binding. They must never become directly restorable.\n\n### v4\nNew exports are created only for an authenticated owner and include:\n\n- `owner.bindingType = "supabase-user-sha256-v1"`;\n- a SHA-256 fingerprint derived from the authenticated Supabase user id plus a fixed namespace prefix;\n- **no raw user id**.\n\nThis binding is only a privacy-minimal *same-account guard*. It is **not a digital signature and does not prove file integrity or authenticity**. A manually edited v4 file can still alter its JSON. Therefore a future restore must compare the backup fingerprint against the *currently authenticated* owner immediately before apply and must still perform all remaining gates below.\n\n## Mandatory gates before Phase 2 can write anything\n\n### A. Authenticated owner match\n- authenticated user exists;\n- current owner fingerprint is derived at restore time;\n- backup v4 binding matches exactly;\n- v2/v3, malformed binding, raw-owner-id manifest or mismatch hard-fails before mutation.\n\n### B. Fresh cloud baseline\nBefore planning a restore, re-read owner-scoped `app_state` rows for all three durable domains:\n- RPG;\n- Finance;\n- Health.\n\nCapture each row's `updated_at` and current restore generation in the same planning session. Missing or changed baselines invalidate the plan.\n\n### C. No unresolved local dirty state\nA real restore must not begin while there are unresolved local dirty-journal entries. First flush them successfully or explicitly abort the restore. Never silently discard them.\n\n### D. Backup-before-restore\nCreate a fresh credential-free backup of the current authoritative state immediately before applying. Surface its timestamp and success. If this export fails, restore does not start.\n\n### E. Explicit semantics\nUser must choose one:\n\n- **Merge:** incoming trusted keys replace same-name keys; current keys absent from backup remain untouched.\n- **Overwrite:** incoming trusted keys replace same-name keys and current trusted keys absent from the selected backup scope are removed.\n\nNever infer overwrite from file contents.\n\n### F. Domain preview + two-step confirmation\nBefore confirmation show per-domain counts for new, changed, unchanged and removed (overwrite only), plus blocked sensitive and excluded unknown keys. Do not require raw personal values on-screen. A destructive restore requires a review screen and a second explicit final confirmation naming the chosen strategy and affected domains.\n\n### G. Atomic cloud-first restore generation\nThis is the central convergence gate. A future server-side transaction/RPC must atomically:\n\n1. verify expected owner and current generation;\n2. compare the expected `updated_at` baseline for RPG, Finance and Health;\n3. apply all selected domain states;\n4. increment one shared restore generation;\n5. commit the three domain rows as one restore event or fail the entire operation.\n\nDo **not** mutate local storage first and hope cloud sync catches up. Cloud must become the authoritative restored generation first; devices then converge from that committed generation.\n\n## Dirty-journal generation rule\n\nEvery future generation-aware dirty entry must carry the restore generation in which it was created. Replay is permitted only when:\n\n- `dirty.generation === cloud.restore_generation`, **and**\n- `dirty.ts > remote.updated_at`.\n\nLegacy dirty entries are generation `0`. Once a restore commits generation `1+`, those legacy/offline entries can never resurrect pre-restore state, even if their device clock timestamp is later.\n\n`restore-generation-model.js` is deliberately analysis-only: it exposes precondition assessment and a commit envelope but **no mutation method**.\n\n## Sensitive and unknown keys\n\nSensitive keys remain blocked even if present in a manually edited backup:\n- `hevy_api_key`\n- `rpg_pin_v1`\n\nUnknown non-canonical keys are excluded by default. Future migrations may explicitly whitelist reviewed legacy keys; never import unknown keys merely because they are present in JSON.\n\n## Rollout order\n\n1. Ship backup v4 same-account binding.\n2. Keep Restore Dry Run read-only and verify v2/v3/v4 real files.\n3. Design database restore-generation storage + atomic RPC.\n4. Make `sync.js` generation-aware with executable race regression coverage.\n5. Add Phase 2 apply behind Lab/explicit opt-in only.\n6. Verify multi-device/offline resurrection scenarios naturally.\n7. Only then consider exposing Restore in normal Settings/Character UI.\n\n**Do not ship Phase 2 until executable regression coverage proves stale cloud or offline device state cannot resurrect pre-restore data.**\n''', encoding='utf-8')

print('backup v4 / restore-generation patch applied')
