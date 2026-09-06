from pathlib import Path
import json

# Machine-readable HQ state: structured update, no blind text surgery.
state_path = Path('PROJECT-HQ-STATE.json')
state = json.loads(state_path.read_text(encoding='utf-8'))

state['now'] = [
    s.replace(
        'Try Restore Dry Run with a real exported backup v4 and verify binding presence; restore/apply remains blocked until an authenticated owner-match, atomic server-side restore generation and generation-aware sync are implemented and regression-proven',
        'Try Restore Dry Run with a real exported backup v4 and verify binding presence; browser sync and backups are now owner/generation-aware, but restore/apply remains blocked until authenticated owner-match, an atomic three-domain server restore RPC, service-role owner scoping and the final composite-primary-key cutover are regression-proven'
    )
    for s in state.get('now', [])
]

new_completed = [
    'Supabase app_state Phase 0 applied additively: restore_generation BIGINT NOT NULL DEFAULT 0 plus UNIQUE(user_id,key); all existing rows stayed generation 0 and legacy PRIMARY KEY(key) was deliberately retained for compatibility',
    'Browser cloud sync shipped owner-scoped and generation-aware: reads filter by authenticated user_id+key, upserts use onConflict user_id,key, writes carry restore_generation and dirty replay is limited to the exact current generation',
    'Backup v4 dirty-overlay guard shipped: pending local edits are included only when newer than cloud AND from the exact same restore generation; legacy dirty entries map to generation 0 only',
    'Vercel preview budget guard shipped: chatgpt work branches skip automatic preview builds while main retains production deploys',
]
for item in new_completed:
    if item not in state.setdefault('completedThisPass', []):
        state['completedThisPass'].append(item)

state.setdefault('lockedDecisions', {})['appStateOwnershipCutover'] = (
    'Do not drop legacy PRIMARY KEY(key) until every service-role app_state reader/writer (including active Fitbit/Jarvis/push paths) is explicitly owner-scoped. Phase 0 UNIQUE(user_id,key) is additive compatibility only; final target is per-owner key identity.'
)

release = state.setdefault('release', {})
release['backupV4ProductionDeployment'] = 'dpl_H9Bfpwixfz7ptRCNQZAEDWckyyWV'
release['backupV4ProductionState'] = 'READY'
release['ownerGenerationSyncMainSha'] = 'b6062198250c77a65e1a461ebe63424e782531de'
release['ownerGenerationSyncProductionDeployment'] = 'dpl_H9Bfpwixfz7ptRCNQZAEDWckyyWV'
release['ownerGenerationSyncProductionState'] = 'READY'
release['backupGenerationOverlayGuardMainSha'] = '2bb05f746da0e684b0eb64560f05131d2d128341'
release['backupGenerationOverlayGuardGuardedRun'] = '34027899310'
release['backupGenerationOverlayGuardPrSmokeRun'] = '34027932770'
release['backupGenerationOverlayGuardProductionDeployment'] = 'dpl_5HNzU6VXciwQNgsLN97WJH4wxLKU'
release['backupGenerationOverlayGuardProductionState'] = 'READY'

rs = state.setdefault('restoreSafety', {})
rs['syncIsGenerationAware'] = True
rs['databasePhase0Exists'] = True
rs['restoreGenerationColumnExists'] = True
rs['ownerKeyUniqueConstraintExists'] = True
rs['legacyGlobalKeyPrimaryKeyStillPresent'] = True
rs['serviceRoleOwnerScopeCutoverComplete'] = False
rs['atomicServerRestoreExists'] = False
rs['restoreReady'] = False
rs['applyPathExists'] = False
rs['nextGate'] = (
    'Design and regression-test an authenticated atomic three-domain restore RPC with generation compare-and-swap; then owner-scope all active service-role app_state paths before dropping legacy PRIMARY KEY(key). Only after those gates may a Lab apply path exist.'
)

state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# Human HQ: precise known replacements only.
hq_path = Path('PROJECT-HQ.md')
hq = hq_path.read_text(encoding='utf-8')
replacements = {
    "5. **Restore Dry Run v4 real-file test** — backup v4 now carries a pseudonymous same-account binding. Dry Run can inspect binding presence, but account match is intentionally not trusted offline and there is still no apply/write path. Next engineering gate is an atomic cloud restore-generation protocol plus generation-aware sync.":
    "5. **Restore Dry Run v4 real-file test** — backup v4 carries a pseudonymous same-account binding, browser sync is now owner-scoped + generation-aware, and backups reject dirty state from another restore generation. Dry Run remains read-only. Next engineering gate is an authenticated atomic three-domain restore RPC plus owner-scoping of active service-role `app_state` paths before the legacy global `PRIMARY KEY(key)` can be replaced.",
    "- [x] **Restore-generation safety model shipped analysis-only**: stale/offline dirty state cannot replay across a future restore generation. No restore mutation method exists.":
    "- [x] **Restore-generation safety moved into production browser sync**: stale/offline dirty state cannot replay across a future restore generation, owner reads/writes use `(user_id,key)`, and no restore mutation method exists.",
    "- [ ] Restore Phase 2 remains blocked: design database restore-generation storage + atomic three-domain RPC, make `sync.js` generation-aware, prove stale/offline resurrection impossible, then add any apply path in Lab only.":
    "- [ ] Restore Phase 2 remains blocked: design + regression-test the atomic authenticated three-domain RPC; owner-scope active service-role `app_state` readers/writers; replace legacy global `PRIMARY KEY(key)` only after that cutover; then add any apply path in Lab only.",
    "- Phase 2 is still blocked on an atomic server-side three-domain restore-generation transaction/RPC and generation-aware `sync.js` regression coverage.":
    "- Browser `sync.js` is now generation-aware and owner-scoped in production. Phase 2 is still blocked on an atomic authenticated server-side three-domain restore transaction/RPC plus owner-scoping of active service-role `app_state` paths before the legacy global key PK can be removed.",
}
for old, new in replacements.items():
    if old not in hq:
        raise SystemExit(f'HQ replacement anchor missing: {old[:90]}')
    hq = hq.replace(old, new, 1)

marker = "## HUMAN CHANGELOG\n\n"
entry = """### 2026-09-06 — owner/generation production hardening\n- Applied additive Supabase `app_state` Phase 0: `restore_generation BIGINT NOT NULL DEFAULT 0` plus `UNIQUE(user_id,key)`. Existing rows remained generation 0; the old global `PRIMARY KEY(key)` deliberately remains for compatibility.\n- Browser sync is now explicitly owner-scoped and generation-aware in production (`b6062198250c77a65e1a461ebe63424e782531de`, deployment `dpl_H9Bfpwixfz7ptRCNQZAEDWckyyWV` READY).\n- Backup v4 now overlays a local dirty journal only when its normalized generation exactly equals the cloud row AND its timestamp is newer. Guarded run `34027899310` and normal PR smoke `34027932770` passed; merge `2bb05f746da0e684b0eb64560f05131d2d128341`, deployment `dpl_5HNzU6VXciwQNgsLN97WJH4wxLKU` READY and public production verified.\n- True multi-user/restore cutover is intentionally incomplete: active service-role paths must become owner-scoped before the legacy global key primary key can be dropped. Restore/apply remains OFF.\n- `chatgpt/**` work branches now skip automatic Vercel previews to protect build quota; `main` still deploys to production.\n\n"""
if entry not in hq:
    if marker not in hq:
        raise SystemExit('HQ changelog marker missing')
    hq = hq.replace(marker, marker + entry, 1)
hq_path.write_text(hq, encoding='utf-8')

# Active bug handoff: baseline + restore + multi-user truth.
bug_path = Path('BUGS-ACTIVE.md')
bugs = bug_path.read_text(encoding='utf-8')
old_baseline = """Latest verified functional head:\n- `e56dd3eb8b9ba084de90dd3389003e54dc791abc` — corrected iPhone Device QA fixed-bottom zero baseline; no production navigation behavior changed.\n- GitHub smoke suite: **run 229 — completed/success** on the PR merge combination.\n- exact Vercel production deployment: `dpl_81g6BRyafi8ssPpnZes6BPV94XUY`.\n- deployment state: **READY**, target `production`.\n\nThis baseline also contains Daily Missions 2.0, the goal-first WHY foundation, Swipe Navigation Lab + dormant engine, WHY Link Audit, Restore Dry Run, Fitbit audit owner-pairing hardening and Edge Function secret-cutover guard.\n"""
new_baseline = """Latest verified functional head:\n- `2bb05f746da0e684b0eb64560f05131d2d128341` — backup v4 dirty overlay is generation-safe on top of owner-scoped + generation-aware browser sync.\n- GitHub guarded regression: `34027899310` — completed/success; normal PR smoke: `34027932770` — completed/success.\n- exact Vercel production deployment: `dpl_5HNzU6VXciwQNgsLN97WJH4wxLKU`.\n- deployment state: **READY**, target `production`; public production source was also verified.\n\nThis baseline also contains Daily Missions 2.0, the goal-first WHY foundation, Swipe Navigation Lab + dormant engine, WHY Link Audit, Restore Dry Run, Fitbit audit owner-pairing hardening, Edge Function secret-cutover guard, additive `app_state.restore_generation`, `UNIQUE(user_id,key)`, and owner/generation-aware browser sync.\n"""
if old_baseline not in bugs:
    raise SystemExit('BUGS baseline anchor missing')
bugs = bugs.replace(old_baseline, new_baseline, 1)

old_restore = """The analysis-only restore-generation model is now regression-locked: a dirty edit may replay only if its generation exactly equals the current cloud restore generation and its timestamp is newer than the remote baseline. That prevents old/offline generations from resurrecting pre-restore state after a future generation bump.\n\nRemaining blockers before Phase 2 can mutate anything:\n- authenticated v4 owner match;\n- fresh RPG + Finance + Health cloud baselines;\n- zero unresolved local dirty state;\n- successful backup-before-restore;\n- explicit merge vs overwrite + two-step confirmation;\n- atomic server-side three-domain restore-generation transaction/RPC;\n- generation-aware `sync.js`;\n- executable race regression proof before any Lab apply path.\n\nBackup v4 release proof: guarded full suite `34001862091`, normal PR smoke `34001954554`, main release `00e60dc5cfe65819662cadab3694ac06a7875695`.\n"""
new_restore = """Restore-generation safety is now active in production browser sync: owner-scoped rows carry `restore_generation`, local dirty entries are tagged with that generation, and dirty replay only occurs inside the exact current cloud generation when newer than its baseline. Backup v4 applies the same generation rule, so an old/offline journal cannot contaminate a post-restore backup.\n\nSupabase Phase 0 is also live and additive: `app_state.restore_generation BIGINT NOT NULL DEFAULT 0` plus `UNIQUE(user_id,key)`. The legacy global `PRIMARY KEY(key)` intentionally remains until every active service-role `app_state` path is explicitly owner-scoped.\n\nRemaining blockers before Phase 2 can mutate anything:\n- authenticated v4 owner match;\n- fresh RPG + Finance + Health cloud baselines;\n- zero unresolved local dirty state;\n- successful backup-before-restore;\n- explicit merge vs overwrite + two-step confirmation;\n- atomic authenticated server-side three-domain restore-generation transaction/RPC with compare-and-swap behavior;\n- owner-scope active service-role `app_state` readers/writers (including Fitbit/Jarvis/push paths where applicable);\n- final composite owner/key primary-key cutover only after those server paths are safe;\n- executable race regression proof before any Lab apply path.\n\nBackup v4 foundation proof: guarded full suite `34001862091`, normal PR smoke `34001954554`, main `00e60dc5cfe65819662cadab3694ac06a7875695`. Owner/generation sync production: `b6062198250c77a65e1a461ebe63424e782531de` / `dpl_H9Bfpwixfz7ptRCNQZAEDWckyyWV` READY. Generation-safe backup overlay proof: guarded `34027899310`, PR smoke `34027932770`, main `2bb05f746da0e684b0eb64560f05131d2d128341`, production `dpl_5HNzU6VXciwQNgsLN97WJH4wxLKU` READY.\n"""
if old_restore not in bugs:
    raise SystemExit('BUGS restore anchor missing')
bugs = bugs.replace(old_restore, new_restore, 1)

old_multi = """**Status:** **CURRENT OWNER DATA HEALTHY; TRUE MULTI-USER REMAINS A DELIBERATE MIGRATION.**\n\nCurrent `app_state` ownership + RLS is healthy for Joey's one-account Gamenfy.\n\nThe table still uses a globally unique key rather than `(user_id,key)`. A genuine second account/test user therefore requires coordinated schema + client/server changes, backup and regression proof. Do not perform a casual index tweak.\n\nSeparate cloud workspaces are not active; Settings truthfully keeps that UI disabled.\n"""
new_multi = """**Status:** **PHASE 0 SHIPPED; LEGACY GLOBAL PK STILL BLOCKS TRUE MULTI-USER UNTIL SERVER CUTOVER.**\n\nCurrent `app_state` ownership + RLS remains healthy for Joey's one-account Gamenfy. Browser reads/writes now explicitly scope canonical sync by authenticated `(user_id,key)`.\n\nAdditive database Phase 0 is live: `restore_generation` exists and `UNIQUE(user_id,key)` is available for composite conflict targets. However the legacy `PRIMARY KEY(key)` still makes `key` globally unique, so a genuine second account cannot yet own its own `rpg`/`finance`/`health` rows.\n\nDo **not** drop that legacy PK casually: active service-role functions historically contain key-only `app_state` reads/upserts and service-role privileges bypass normal RLS protection. Owner-scope those paths first, regression-prove the cutover, then replace the global key PK with owner/key identity.\n\nSeparate cloud workspaces are not active; Settings truthfully keeps that UI disabled.\n"""
if old_multi not in bugs:
    raise SystemExit('BUGS multi-user anchor missing')
bugs = bugs.replace(old_multi, new_multi, 1)
bug_path.write_text(bugs, encoding='utf-8')

print('HQ/state/bugs synchronized to owner+generation production proof.')
