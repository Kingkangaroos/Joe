from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]

# Machine-readable HQ state
state_path = ROOT / 'PROJECT-HQ-STATE.json'
state = json.loads(state_path.read_text(encoding='utf-8'))
state['updatedAt'] = '2026-09-06'

now = state.get('now', [])
old_restore = 'Try Restore Dry Run with a real exported backup; Phase 1 remains analysis-only and cannot apply data'
new_restore = 'Try Restore Dry Run with a real exported backup v4 and verify binding presence; restore/apply remains blocked until an authenticated owner-match, atomic server-side restore generation and generation-aware sync are implemented and regression-proven'
state['now'] = [new_restore if x == old_restore else x for x in now]

completed = state.setdefault('completedThisPass', [])
for item in [
    'Backup v4 safety foundation shipped: Character export now includes a pseudonymous SHA-256 same-account binding derived from the authenticated Supabase owner; raw user ID is never serialized',
    'Restore validator recognizes v4 binding presence but never grants offline owner proof; v2/v3 remain dry-run only and restoreReady stays false',
    'Analysis-only restore-generation model shipped and regression-locked: dirty edits may replay only in the exact current cloud generation and only when newer than the remote baseline; old/offline generations cannot resurrect pre-restore state',
    'Backup v4 release passed guarded full regression run 34001862091 and normal PR smoke run 34001954554; PR #33 merged to main as 00e60dc5cfe65819662cadab3694ac06a7875695'
]:
    if item not in completed:
        completed.append(item)

locked = state.setdefault('lockedDecisions', {})
locked['restoreImport'] = 'Phase 1.5 only: backup v4 has a pseudonymous same-account binding but it is not a signature or integrity proof. No apply/write path until authenticated owner-match, fresh three-domain cloud baselines, zero unresolved dirty state, pre-restore backup, explicit merge/overwrite confirmation, atomic cloud-first restore generation and generation-aware sync are all implemented and regression-proven.'

release = state.setdefault('release', {})
release['backupV4SafetyMainSha'] = '00e60dc5cfe65819662cadab3694ac06a7875695'
release['backupV4GuardedRegressionRun'] = '34001862091'
release['backupV4PrSmokeRun'] = '34001954554'
release['backupV4ProductionDeployment'] = None
release['backupV4ProductionState'] = 'PENDING_VERIFICATION'

state['restoreSafety'] = {
    'phase': '1.5',
    'backupFormat': 4,
    'ownerBindingType': 'supabase-user-sha256-v1',
    'rawOwnerIdSerialized': False,
    'ownerBindingIsSignature': False,
    'restoreReady': False,
    'applyPathExists': False,
    'generationModelExists': True,
    'syncIsGenerationAware': False,
    'atomicServerRestoreExists': False,
    'nextGate': 'Design and test database restore-generation storage/atomic RPC, then make sync.js generation-aware before any Lab apply path.'
}

state_path.write_text(json.dumps(state, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

# Human HQ
hq_path = ROOT / 'PROJECT-HQ.md'
hq = hq_path.read_text(encoding='utf-8')
hq = hq.replace(
    '5. **Restore Dry Run real-file test** — Phase 1 can validate and preview a real export but still has no apply/write path.',
    '5. **Restore Dry Run v4 real-file test** — backup v4 now carries a pseudonymous same-account binding. Dry Run can inspect binding presence, but account match is intentionally not trusted offline and there is still no apply/write path. Next engineering gate is an atomic cloud restore-generation protocol plus generation-aware sync.'
)
anchor = '- [x] **Restore Dry Run Phase 1** shipped read-only with local backup validation and merge/overwrite preview; there is no apply path.\n'
addition = anchor + '- [x] **Backup v4 safety foundation shipped**: authenticated Character export adds a pseudonymous SHA-256 same-account binding without serializing the raw owner ID. The binding is explicitly not a digital signature or file-integrity proof.\n- [x] **Restore-generation safety model shipped analysis-only**: stale/offline dirty state cannot replay across a future restore generation. No restore mutation method exists.\n- [x] Backup v4 guarded full suite `34001862091` + normal PR smoke `34001954554` passed; PR #33 merged to `main` as `00e60dc5cfe65819662cadab3694ac06a7875695`.\n'
if anchor in hq and 'Backup v4 safety foundation shipped' not in hq:
    hq = hq.replace(anchor, addition, 1)

old_tech = '- [ ] Safe restore/import design and implementation.'
new_tech = '- [ ] Restore Phase 2 remains blocked: design database restore-generation storage + atomic three-domain RPC, make `sync.js` generation-aware, prove stale/offline resurrection impossible, then add any apply path in Lab only.'
hq = hq.replace(old_tech, new_tech)

old_later = '- Restore/import UI after backup/export remains proven stable.'
new_later = '- Restore/import apply UI only after v4 owner-match, atomic restore-generation and generation-aware sync are proven; normal Settings exposure comes last.'
hq = hq.replace(old_later, new_later)

changelog_anchor = '## HUMAN CHANGELOG\n\n'
entry = '''### 2026-09-06 — backup v4 safety foundation\n- Backup export advanced to **v4** with a pseudonymous `supabase-user-sha256-v1` same-account binding derived only while authenticated; raw owner ID is not written to the backup.\n- This binding is only an account-match guard, **not** a signature and not proof that the JSON file was not edited.\n- Restore Dry Run remains read-only and `restoreReady=false`; v2/v3 remain inspection-only and v4 account match must still be checked against the current authenticated session before any future apply.\n- Added an analysis-only restore-generation model: dirty state can replay only inside the exact current cloud generation and only when newer than that generation's remote baseline.\n- Phase 2 is still blocked on an atomic server-side three-domain restore-generation transaction/RPC and generation-aware `sync.js` regression coverage.\n- Guarded full regression run `34001862091` and normal PR smoke `34001954554` passed; PR #33 squash-merged as `00e60dc5cfe65819662cadab3694ac06a7875695`.\n\n'''
if changelog_anchor in hq and '### 2026-09-06 — backup v4 safety foundation' not in hq:
    hq = hq.replace(changelog_anchor, changelog_anchor + entry, 1)

hq_path.write_text(hq, encoding='utf-8')

# Active bug/proof handoff
bugs_path = ROOT / 'BUGS-ACTIVE.md'
bugs = bugs_path.read_text(encoding='utf-8')
old_section = '''## 8. Backup restore/import\n\n**Status:** **OPEN PRODUCT + DATA-SAFETY FEATURE; export itself is fixed.**\n\nBackup export is now complete across canonical RPG + Finance + Health user-data scopes while explicitly excluding `rpg_pin_v1` and `hevy_api_key`.\n\nThere is currently **no restore/import path**. Do not add a blind importer.\n\nA safe future restore must include at minimum:\n- schema/format validation;\n- domain/key preview;\n- backup-before-restore;\n- explicit merge vs overwrite semantics;\n- owner/auth validation;\n- protection against stale cloud convergence resurrecting overwritten data;\n- regression proof before production use.\n'''
new_section = '''## 8. Backup restore/import\n\n**Status:** **PHASE 1.5 SHIPPED; APPLY/RESTORE STILL BLOCKED.**\n\nBackup export v4 is complete across canonical RPG + Finance + Health user-data scopes while explicitly excluding `rpg_pin_v1` and `hevy_api_key`. New v4 exports also carry a pseudonymous SHA-256 same-account binding derived from the authenticated Supabase owner; the raw owner ID is never serialized.\n\nImportant: that owner binding is **not a digital signature or file-integrity proof**. Restore Dry Run may inspect binding presence, but an actual account match must be recomputed from the currently authenticated session immediately before any future apply. Legacy v2/v3 files remain dry-run only.\n\nThere is still **no restore/import apply path** and `restoreReady` remains false. Do not add a blind importer.\n\nThe analysis-only restore-generation model is now regression-locked: a dirty edit may replay only if its generation exactly equals the current cloud restore generation and its timestamp is newer than the remote baseline. That prevents old/offline generations from resurrecting pre-restore state after a future generation bump.\n\nRemaining blockers before Phase 2 can mutate anything:\n- authenticated v4 owner match;\n- fresh RPG + Finance + Health cloud baselines;\n- zero unresolved local dirty state;\n- successful backup-before-restore;\n- explicit merge vs overwrite + two-step confirmation;\n- atomic server-side three-domain restore-generation transaction/RPC;\n- generation-aware `sync.js`;\n- executable race regression proof before any Lab apply path.\n\nBackup v4 release proof: guarded full suite `34001862091`, normal PR smoke `34001954554`, main release `00e60dc5cfe65819662cadab3694ac06a7875695`.\n'''
if old_section not in bugs:
    raise SystemExit('BUGS-ACTIVE restore section target not found')
bugs = bugs.replace(old_section, new_section, 1)
bugs_path.write_text(bugs, encoding='utf-8')

print('HQ/state/bugs synced for backup v4 safety release')
