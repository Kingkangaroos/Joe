from pathlib import Path
import json

# Durable HQ sync after Joey's 2026-09-06 production walkthrough follow-up.

hq = Path('PROJECT-HQ.md')
s = hq.read_text()

s = s.replace(
    '- [x] Home embed is **public-only**: canonical 11 public Daily Missions; private dailies do not leak into Home.',
    '- [x] Personal Home now presents **all 13 Joey Daily Missions in one visual roster**. The two anonymized private quests keep their existing PIN/private storage route internally but no longer receive a separate attention-grabbing section.'
)
s = s.replace(
    '- Home shows only the canonical 11 public missions. PIN-backed private dailies remain separate outside that public Home surface.',
    '- Joey\'s personal Home shows the full 13-mission visual roster. The two anonymized private quests remain separate internally for PIN/private storage and public-export safety, but must not be presented as a separate attention-grabbing product section.'
)

completed_anchor = '## COMPLETED THIS PASS\n\n'
completed_block = '''- [x] **2026-09-06 visible follow-up release shipped:** PR #46 merged to `main` as `745fbc8a2602eebe2501f122fbf53b135651c85b`; Vercel production `dpl_B8kk35VfjQDmNF71XuY5AHJFtqNY` verified READY.\n- [x] Daily Missions personal roster unified: the two anonymized private quests sit visually among the other missions while their existing private/PIN-backed route remains intact internally.\n- [x] Added a mission-only **Daily Level 0–10** aggregate placeholder on Home; do not spend time on ten temporary characters before Joey has approved the final level-character asset direction.\n- [x] Body + Walking/Sleep retrospective reads now use the already-authenticated Supabase client with explicit owner scoping instead of the fragile raw REST read path. Production serves `autohabit-reconcile.js` v11.9.\n- [x] Ventures boxed overview restored with Grip, Websites Verkopen, Gamenfy Public and Gamenfy Build visible as separate ventures. Finance → Ventures is split into Ventures / Venture Lab / Productielijn.\n- [x] General Lab is a Jarvis workspace by default; explicit return tokens send Venture-launched Lab back to Finance → Ventures instead of Character/Body.\n'''
if completed_block not in s:
    s = s.replace(completed_anchor, completed_anchor + completed_block, 1)

now_anchor = '## NOW\n\n'
now_block = '''1. **Real-device Body/Fitbit confirmation after v11.9** — backend owner data is healthy and the production client read path has been replaced. Reopen the installed PWA and verify Body renders Fitbit data. If it still says Waiting for Fitbit, capture it as an iPhone/runtime-only bug rather than repeating backend repair.\n2. **Visual follow-up check** — confirm the personal Daily Missions roster feels like one set, Daily Level reads clearly, Finance → Ventures shows the four boxed ventures, and General/Venture Lab returns land in the correct workspace.\n'''
if now_block not in s:
    start = s.index(now_anchor) + len(now_anchor)
    # Preserve existing NOW list but renumber it to follow the two new urgent checks.
    tail = s[start:s.index('\n## COMPLETED THIS PASS', start)]
    lines = tail.splitlines()
    renumbered=[]
    for line in lines:
        if line and line[0].isdigit() and '. ' in line:
            n, rest = line.split('. ', 1)
            try: line = f"{int(n)+2}. {rest}"
            except Exception: pass
        renumbered.append(line)
    s = s[:start] + now_block + '\n'.join(renumbered) + s[s.index('\n## COMPLETED THIS PASS', start):]

changelog_anchor = '## HUMAN CHANGELOG\n\n'
changelog_block = '''### 2026-09-06 — visible product follow-up from Joey device test\n- Personal Daily Missions presentation is one 13-mission roster; anonymized private quests retain their internal PIN/private route but no longer get a separate visible section.\n- Added mission-only Daily Level 0–10 placeholder; final level 1–10 character art is intentionally deferred until the asset direction is approved.\n- Verified live Supabase owner data exists and switched Body plus retrospective Fitbit reads to the authenticated owner-scoped client. No direct SQL/cloud-write repair path was introduced.\n- Restored the boxed Ventures overview and separated Finance → Ventures into Ventures / Venture Lab / Productielijn. General Lab remains distinct and belongs to Jarvis by default.\n- Lab return navigation is explicit and deterministic: Jarvis by default, Finance → Ventures when launched from Ventures; it no longer falls through Character\'s last active Body tab.\n- Full guarded suite run `34056084188` and normal PR smoke `34056168809` passed. PR #46 merged as `745fbc8a2602eebe2501f122fbf53b135651c85b`; production `dpl_B8kk35VfjQDmNF71XuY5AHJFtqNY` READY.\n\n'''
if changelog_block not in s:
    s = s.replace(changelog_anchor, changelog_anchor + changelog_block, 1)

hq.write_text(s)

bugs = Path('BUGS-ACTIVE.md')
b = bugs.read_text()
b = b.replace(
'''Latest verified functional head:\n- `2bb05f746da0e684b0eb64560f05131d2d128341` — backup v4 dirty overlay is generation-safe on top of owner-scoped + generation-aware browser sync.\n- GitHub guarded regression: `34027899310` — completed/success; normal PR smoke: `34027932770` — completed/success.\n- exact Vercel production deployment: `dpl_5HNzU6VXciwQNgsLN97WJH4wxLKU`.\n- deployment state: **READY**, target `production`; public production source was also verified.\n''',
'''Latest verified functional head:\n- `745fbc8a2602eebe2501f122fbf53b135651c85b` — Joey follow-up release: unified personal Daily Missions roster + Daily Level, owner-scoped Fitbit reads, restored Ventures/Venture Lab structure and deterministic Lab returns.\n- GitHub guarded regression: `34056084188` — completed/success; normal PR smoke: `34056168809` — completed/success.\n- exact Vercel production deployment: `dpl_B8kk35VfjQDmNF71XuY5AHJFtqNY`.\n- deployment state: **READY**, target `production`; production source for the v11.9 reconciler was directly verified.\n'''
)
b = b.replace('Current reconciler remains `autohabit-reconcile.js` v11.7. Never force migration proof with SQL.',
'''Current reconciler is `autohabit-reconcile.js` **v11.9**. On 6 Sep the live backend owner row was verified healthy/readable; Body and the reconciler were then moved off the fragile raw REST read path onto the already-authenticated owner-scoped Supabase client. Never force migration proof with SQL.\n\n**Remaining proof is now device/runtime-specific:** reopen the installed PWA and confirm Body renders the owner Fitbit row and a natural authenticated session performs retrospective reconciliation. If Body still says `Waiting for Fitbit`, capture that as a client/PWA runtime reproduction rather than treating it as missing backend data.''')

resolved_anchor = '# Regression-locked / resolved technical classes\n\n'
resolved_add = '''- Personal Daily Missions presentation regression (private quests separated visually) — resolved in PR #46; all 13 are one personal roster while private storage/public-export boundaries remain intact.\n- Missing Daily Missions aggregate after Day Score retirement — mission-only Daily Level 0–10 placeholder shipped in PR #46.\n- Ventures flattened into one Personal Module / missing Grip + Gamenfy venture boxes — restored in PR #46 with Ventures / Venture Lab / Productielijn separation.\n- Lab back navigation falling through Skills/Body — explicit Jarvis/Ventures return tokens shipped in PR #46.\n- Body/Fitbit raw REST read path despite healthy owner cloud data — replaced by authenticated explicit-owner Supabase reads in production v11.9; real-device display confirmation remains open under Fitbit verification.\n'''
if resolved_add not in b:
    b = b.replace(resolved_anchor, resolved_anchor + resolved_add, 1)
bugs.write_text(b)

state_path = Path('PROJECT-HQ-STATE.json')
data = json.loads(state_path.read_text())
data['updatedAt'] = '2026-09-06'

new_now = [
    'Reopen Body in the installed PWA and confirm the production v11.9 owner-scoped Fitbit read renders health data; backend owner data is already verified healthy, so any remaining Waiting for Fitbit symptom is a client/PWA runtime reproduction',
    'Visually confirm the unified 13-mission personal roster, mission-only Daily Level, restored four-box Ventures overview, Venture Lab separation and deterministic Lab return navigation on Joey device'
]
for item in reversed(new_now):
    if item not in data['now']:
        data['now'].insert(0, item)

completed = [
    '2026-09-06 visible follow-up release passed guarded full regression run 34056084188 and normal PR smoke 34056168809; PR #46 merged to main as 745fbc8a2602eebe2501f122fbf53b135651c85b and production deployment dpl_B8kk35VfjQDmNF71XuY5AHJFtqNY is READY',
    'Personal Home now presents all 13 Joey Daily Missions in one visual roster; anonymized private quests keep their internal private/PIN-backed storage route without a separate attention-grabbing section',
    'Mission-only Daily Level 0-10 aggregate placeholder shipped; temporary ten-character asset production is deliberately deferred',
    'Body and Walking/Sleep retrospective Fitbit reads now use the authenticated explicit-owner Supabase client; production reconciler is v11.9 and no direct cloud-write repair path was added',
    'Ventures boxed overview restored with Grip, Websites Verkopen, Gamenfy Public and Gamenfy Build; Finance Ventures now separates Ventures, Venture Lab and Productielijn',
    'General Lab belongs to Jarvis by default and explicit return tokens route Venture-launched Lab back to Finance Ventures instead of Character Body'
]
for item in completed:
    if item not in data['completedThisPass']:
        data['completedThisPass'].append(item)

locked = data['lockedDecisions']
locked['privateDailyPresentation'] = 'On Joey personal Home, all 13 missions are one visual roster. The two anonymized private quests remain separate internally for PIN/private storage and public-export safety, but do not get a separate attention-grabbing section.'
locked['dailyMissionAggregate'] = 'Use a mission-only Daily Level 0-10 aggregate placeholder now. Do not spend asset time on ten temporary characters; replace with Joey-approved level 1-10 character art later.'
locked['ventureStructure'] = 'Finance Ventures keeps the boxed venture overview (Grip, Websites Verkopen, Gamenfy Public, Gamenfy Build) and separates Ventures / Venture Lab / Productielijn. General Lab remains distinct.'
locked['labReturnNavigation'] = 'General Lab defaults back to Jarvis; Venture-launched Lab returns to Finance Ventures through explicit return tokens and must never fall through Character/Body last-tab state.'

fit = data.get('fitbitReconcileAudit', {})
fit['clientReadPathVerifiedAt'] = '2026-09-06'
fit['clientReadPath'] = 'authenticated Supabase client, explicit owner user_id scope, autohabit-reconcile.js v11.9'
fit['backendOwnerDataHealthy'] = True
fit['nextProof'] = 'Reopen installed PWA Body and run a natural authenticated session. Confirm Fitbit data renders and then repeat the read-only same-owner reconciliation audit; never force history with SQL.'

release = data.setdefault('release', {})
release['visibleFollowupMainSha'] = '745fbc8a2602eebe2501f122fbf53b135651c85b'
release['visibleFollowupGuardedRegressionRun'] = '34056084188'
release['visibleFollowupPrSmokeRun'] = '34056168809'
release['visibleFollowupProductionDeployment'] = 'dpl_B8kk35VfjQDmNF71XuY5AHJFtqNY'
release['visibleFollowupProductionState'] = 'READY'
release['fitbitReconcilerProductionVersion'] = '11.9'

state_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
print('HQ follow-up sync applied')
