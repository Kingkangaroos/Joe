from pathlib import Path
import json, re

# ---------------- PROJECT-HQ.md ----------------
p=Path('PROJECT-HQ.md')
s=p.read_text()

now='''## NOW

1. **Test the visible 6 Sep product sprint on iPhone** — Finance → Ventures, the cleaned Home, Body/Fitbit, Routes book viewer and Jarvis → Lab/HQ are all live on production `0bc118f07ec793158dc58792b3cf13533a3890da` / `dpl_3e7cZxfnzHkPzBT4gRgCpGirsDGf` (READY).
2. **Fitbit auto-complete natural proof** — force-close/reopen the installed PWA so `autohabit-reconcile.js` v11.8 loads, then open Main/Body. Pre-release read-only audit showed 14 qualified dates still pending (8 Walking, 6 Sleep), including 6 Sep for both. Re-audit after a normal device session; never manufacture history with SQL.
3. **Choose the Day Score replacement** — the old Day Score is now visually retired. Joey wants a more game-like visualization, but the replacement must be sparred before implementation rather than guessed.
4. **Lock the visual production line before bulk generation** — Finance → Ventures now exposes the image/video production queue. Spar with Joey on the actual game-character pipeline, asset types, animation/video needs and Higgsfield usage before spending effort on more cutout-style characters.
5. **Test the walking-book viewer** — tap the book photo in Routes to open it full-screen. Existing old 400px uploads cannot gain detail; replace the photo once if a sharper viewer image is wanted.
6. **Ventures is now an in-Gamenfy personal workspace** — the Website Ventures ChatGPT may build directly in `Kingkangaroos/Joe`; personal-only surfaces should be marked `data-gamenfy-scope="personal"` so a future public build can exclude them.
7. **Keep Portfolio parked, not deleted** — its implementation remains dormant in Finance and should be revisited later when Joey wants investment tracking back.
8. **Project / AI time tracker — later** — investigate a lightweight accumulated-hours clock for Gamenfy/AI Tools so Joey can see roughly how much human + AI build time has gone into the project; do not prioritize above current product work.
9. **Installed-iPhone navigation proof remains useful** — Swipe Navigation Lab and iPhone Device QA stay available; do not activate the dormant swipe engine until Joey likes the feel.
10. **Goal/WHY proof remains open** — verify the real canonical Goals store on Joey's device before adding explicit `linkedSkills`; do not infer links or restore unrelated legacy June Goals.

'''
s=re.sub(r'## NOW\n.*?(?=## COMPLETED THIS PASS)',now,s,flags=re.S)

completed_insert='''## COMPLETED THIS PASS

- [x] **Finance → Ventures shipped:** visible Portfolio tab replaced by a personal Ventures workspace; Portfolio logic remains parked/dormant for later.
- [x] **Ventures workspace shipped inside Gamenfy:** shared RPG data, venture notes/steps, Lab + Headquarters links, explicit personal/public-export classification and a visible image/video production-line queue.
- [x] **Skills cockpit simplified:** visible toolbar is now Skills + Goals only; Ventures/Lab/HQ no longer clutter Skills.
- [x] **Jarvis workspace hub shipped:** direct Jarvis / Lab / Headquarters navigation.
- [x] **Home cleanup shipped:** Day Score visually retired pending replacement design; Evening Check-in, Weekly Review and Free Time retired; old Daily Missions 1.0 hard-hidden.
- [x] **Personal Daily Missions 2.0 expanded:** Home now includes public + PIN-backed private companions, dynamically grows to content height and shows useful mission copy under the artwork so Good Deed / Private Quest are not clipped below the frame.
- [x] **Gratitude presentation made more playful:** multi-colour card with a deterministic silhouette variation every five days while keeping the existing gratitude data underneath.
- [x] **Body/Fitbit false-paused bug fixed:** Character waits for Auth, does not permanently cache a failed pre-auth Fitbit read, and retries after auth/focus instead of falsely claiming Fitbit was paused for account security.
- [x] **Fitbit reconciler v11.8 shipped:** semantic JSON baseline comparison, longer bounded retry window and explicit reruns on RPG cloud-ready/apply events; still no direct cloud writes.
- [x] **Routes book photo viewer shipped:** tap to open full-screen; photo replacement is a separate action and new uploads retain viewer-useful resolution.
- [x] Visible sprint guarded full suite run `34053341052` and normal PR smoke `34053390826` passed; PR #44 merged as `0bc118f07ec793158dc58792b3cf13533a3890da`, Vercel `dpl_3e7cZxfnzHkPzBT4gRgCpGirsDGf` READY.
'''
s=s.replace('## COMPLETED THIS PASS\n',completed_insert,1)

s=s.replace('- Home shows only the canonical 11 public missions. PIN-backed private dailies remain separate outside that public Home surface.',
            '- Joey\'s personal Home shows the canonical 11 public missions **plus the PIN-backed private companions** inside Daily Missions 2.0. Public/exportable builds must still be able to exclude personal/private surfaces.')
s=s.replace('- Home is the **overview/cockpit**, not a single-purpose goal screen.\n- Preserve the current visual identity unless Joey explicitly approves a broader redesign.',
            '- Home is the **overview/cockpit**, not a single-purpose goal screen.\n- The old Day Score is visually retired. Its replacement must be a game-like visualization chosen with Joey rather than another generic score card.\n- Evening Check-in, Weekly Review and Free Time are retired from Home.\n- Preserve the current visual identity unless Joey explicitly approves a broader redesign.')
s=s.replace('- Gamenfy and Website Ventures remain separate projects while Gamenfy can act as the cockpit.',
            '- Gamenfy and Website Ventures may remain conceptually separate workstreams, but **Website Ventures now lives inside the same Gamenfy repo/app workspace**. A separate repo is not required merely to avoid touching Gamenfy. Personal-only modules should carry `data-gamenfy-scope="personal"` so they can be excluded from future public builds.')

s=s.replace('### Product / UX\n', '''### Product / UX
- [ ] Spar on the replacement for the retired Day Score: game-like overall state rather than another generic score tile.
- [ ] Test Finance → Ventures as the real Website Ventures workspace and let the other ChatGPT project build there directly.
- [ ] Spar on the visual production line before bulk character/image generation: target game vibe, asset taxonomy, animation method, Higgsfield/video inputs and what Joey actually needs to supply.
- [ ] Test full Daily Missions 2.0 height on iPhone: Good Deed and the PIN-backed Private Quest must remain reachable without iframe clipping.
- [ ] Test Routes book photo fullscreen viewer; replace the old low-resolution upload once if needed.
- [ ] Revisit the parked Portfolio tab later; implementation is preserved but hidden.
- [ ] Later: design a lightweight Gamenfy/AI Tools accumulated-hours tracker for human + AI project time.
''',1)

s=s.replace('## IDEA TANK\n', '''## IDEA TANK

- Daily Mission / skill characters should increasingly feel like a **video-game character system**, not carefully cut-out static pictures. Do not over-invest in cleaning every existing PNG until the final production pipeline is chosen.
- A future AI Tools / project-time counter could combine explicit focus sessions with approximate builder/AI activity; surface uncertainty rather than pretending the estimate is exact.
''',1)

s=s.replace('## HUMAN CHANGELOG\n', '''## HUMAN CHANGELOG

### 2026-09-06 — visible product sprint after Joey walkthrough
- Finance visible Portfolio tab → **Ventures**. Portfolio implementation preserved dormant for later.
- Added `ventures-workspace.html` as a personal in-Gamenfy workspace for Website Ventures and other ChatGPT builders, including a visible visual-production queue and explicit future-public-export classification.
- Skills toolbar now shows Skills + Goals only; Lab/HQ moved into a Jarvis workspace nav.
- Home visually retired Day Score, Evening Check-in, Weekly Review, Free Time and legacy Daily Missions 1.0. Day Score replacement remains intentionally undecided pending Joey sparring.
- Personal Daily Missions 2.0 now shows public + private companions, auto-resizes its embed and displays useful mission copy under art.
- Gratitude presentation gains rotating colourful silhouettes every five days.
- Body no longer caches a failed pre-auth Fitbit read; reconciler v11.8 improves cloud-baseline matching/retry triggers.
- Routes book image now opens full-screen; new replacement uploads keep higher useful resolution.
- Guarded run `34053341052` + PR smoke `34053390826` green; merge `0bc118f07ec793158dc58792b3cf13533a3890da`; production `dpl_3e7cZxfnzHkPzBT4gRgCpGirsDGf` READY.
''',1)

p.write_text(s)

# ---------------- PROJECT-HQ-STATE.json ----------------
p=Path('PROJECT-HQ-STATE.json')
d=json.loads(p.read_text())
d['updatedAt']='2026-09-06'
d['now']=[
    'Test the live visible product sprint on iPhone: Finance→Ventures, cleaned Home, full Daily Missions 2.0, Body/Fitbit, Routes book viewer and Jarvis→Lab/HQ',
    'Force-close/reopen the installed PWA and run a normal Main/Body session, then re-audit Fitbit auto-complete read-only; pre-release audit has 14 pending qualified dates (8 Walking, 6 Sleep), including 2026-09-06 for both',
    'Spar with Joey on the game-like replacement for the retired Day Score; do not invent another generic score card',
    'Use Finance→Ventures as the Website Ventures workspace inside Kingkangaroos/Joe; the other ChatGPT project may build there directly and personal-only surfaces should be marked data-gamenfy-scope="personal"',
    'Spar on and lock the visual production line before bulk Higgsfield/image generation: game-character direction, asset types, animation/video workflow and exactly what Joey needs to supply',
    'Test Routes book photo full-screen; replace the legacy low-resolution photo once if sharper detail is needed',
    'Keep Portfolio implementation parked for later rather than deleting it',
    'Later: design an AI Tools / Gamenfy project-hours tracker with honest approximate human+AI time accounting',
    'Keep Swipe Navigation Lab/device QA available but do not activate dormant production swipe until Joey approves iPhone feel',
    'Verify canonical Goals on Joey device before explicit linkedSkills; do not infer mappings or auto-restore legacy June goals'
]
new_completed=[
    'Visible sprint shipped: Finance Portfolio tab replaced by personal Ventures workspace while Portfolio implementation remains parked',
    'ventures-workspace.html shipped inside Gamenfy with shared RPG data, venture notes/steps, Lab/HQ links, personal/public-export classification and visible visual-production queue',
    'Skills cockpit simplified to visible Skills + Goals only',
    'Jarvis workspace nav now links Jarvis, Lab and Headquarters',
    'Home visually retired Day Score pending redesign plus Evening Check-in, Weekly Review, Free Time and legacy Daily Missions 1.0',
    'Personal Home Daily Missions 2.0 now includes public + PIN-backed private companions, useful mission copy and parent/iframe dynamic height to avoid clipped lower missions',
    'Gratitude presentation gains multi-colour five-day rotating silhouettes',
    'Character Body auth/cache bug fixed so a failed pre-auth Fitbit read is not cached as permanent no-data/paused state',
    'autohabit-reconcile.js v11.8 shipped with semantic JSON baseline matching, longer bounded retry and cloud-ready/apply reruns',
    'Routes book photo full-screen viewer shipped; replacement is separate and new uploads retain higher viewer resolution',
    'Visible product sprint guarded run 34053341052 and PR smoke 34053390826 passed; PR #44 merged as 0bc118f07ec793158dc58792b3cf13533a3890da; Vercel dpl_3e7cZxfnzHkPzBT4gRgCpGirsDGf READY'
]
d['completedThisPass']=new_completed+[x for x in d.get('completedThisPass',[]) if x not in new_completed]
locked=d.setdefault('lockedDecisions',{})
locked['personalHomeDailyMissions']='Personal Home uses Daily Missions 2.0 with the canonical 11 public missions plus PIN-backed private companions. Public/exportable builds must be able to exclude personal/private modules.'
locked['venturesWorkspace']='Website Ventures lives inside the Gamenfy repo/app workspace. Other ChatGPT builders may build directly in Kingkangaroos/Joe; mark personal-only modules with data-gamenfy-scope="personal" for future public-build exclusion.'
locked['skillsCockpit']='Visible Skills workspace contains Skills + Goals only. Lab and Project HQ belong to the Jarvis/settings workspace category.'
locked['dayScore']='Old Day Score is retired visually. Replacement remains intentionally undecided until Joey chooses a more game-like visualization.'
locked['portfolio']='Portfolio is parked/hidden, not deleted; revisit later.'
locked['visualProduction']='Do not bulk-generate/clean character assets until Joey and builder lock the game-character/image/video production pipeline.'

d['fitbitReconcileAudit']={
    'verifiedAt':'2026-09-06',
    'walkingQualified':29,
    'walkingCanonical':21,
    'walkingPending':8,
    'sleepQualified':11,
    'sleepCanonical':5,
    'sleepPending':6,
    'totalPending':14,
    'manualOffAmongPending':0,
    'xpAwardedAmongPending':0,
    'cloudRetrospectiveMigrationFlag':False,
    'cloudXpLedgerMigrationFlag':False,
    'pendingWalkingDates':['2026-07-18','2026-07-20','2026-07-21','2026-07-27','2026-07-31','2026-08-02','2026-08-31','2026-09-06'],
    'pendingSleepDates':['2026-07-19','2026-07-22','2026-07-23','2026-07-30','2026-09-03','2026-09-06'],
    'nextProof':'Force-close/reopen the installed PWA after the v11.8 release, run a normal authenticated Main/Body session, then repeat the read-only same-owner audit.'
}
release=d.setdefault('release',{})
release['currentProductMainSha']='0bc118f07ec793158dc58792b3cf13533a3890da'
release['currentProductProductionDeployment']='dpl_3e7cZxfnzHkPzBT4gRgCpGirsDGf'
release['currentProductProductionState']='READY'
release['visibleProductSprintPr']=44
release['visibleProductSprintGuardedRun']='34053341052'
release['visibleProductSprintPrSmokeRun']='34053390826'
release['visibleProductSprintMainSha']='0bc118f07ec793158dc58792b3cf13533a3890da'
release['visibleProductSprintProductionDeployment']='dpl_3e7cZxfnzHkPzBT4gRgCpGirsDGf'
release['visibleProductSprintProductionState']='READY'
d['productOpenQuestions']=[
    'What should replace Day Score visually? Must feel game-like and combine the right daily/health signals without becoming another generic score tile.',
    'What exact image/video/animation production line should Gamenfy use before Joey creates more characters/assets?',
    'When should the parked Portfolio tab return?',
    'How should a future project-hours tracker distinguish measured focus time from estimated AI/builder activity?'
]
d['later']=[
    'AI Tools / Gamenfy accumulated project-hours tracker; estimate honestly rather than pretending historical hours are exact',
    'Revisit Portfolio in Finance',
    'Broader videogame character system after the production pipeline is locked'
]
p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')

# ---------------- BUGS-ACTIVE.md ----------------
p=Path('BUGS-ACTIVE.md')
s=p.read_text()
old_base=re.search(r'## Current verified production baseline\n.*?(?=---)',s,re.S)
if not old_base: raise SystemExit('BUGS production baseline block not found')
new_base='''## Current verified production baseline

Latest verified functional/product head:
- `0bc118f07ec793158dc58792b3cf13533a3890da` — visible 6 Sep product sprint on top of the CAS/owner-generation safety layer.
- Visible sprint guarded regression: `34053341052` — success; normal PR smoke: `34053390826` — success.
- exact Vercel production deployment: `dpl_3e7cZxfnzHkPzBT4gRgCpGirsDGf` — **READY**.
- Production visibly contains Finance→Ventures, cleaned Home, personal Daily Missions 2.0 dynamic height/copy, Body Fitbit auth/cache retry, Routes book viewer and Jarvis Lab/HQ hub.

The underlying CAS writer, legacy-client compatibility bridge and restore safeguards remain intact. Do not confuse older infrastructure checkpoints with the current product head.

'''
s=s[:old_base.start()]+new_base+s[old_base.end():]
sec2=re.search(r'## 2\. Fitbit → Daily Missions retrospective migration\n.*?(?=---\n\n## 3\.)',s,re.S)
if not sec2: raise SystemExit('BUGS Fitbit section not found')
new2='''## 2. Fitbit → Daily Missions retrospective migration

**Status:** **v11.8 PRODUCT FIX SHIPPED; NATURAL DEVICE/CLOUD PROOF STILL OPEN.**

Locked rules remain Walking ≥ **10,000 steps**, Sleep ≥ **420 minutes / 7h**, canonical history `rpg_habitlog_v1`, +1 complete / −1 missed completed day, clamp 0–10, no weekly reset, `manual-off` respected and XP exactly-once.

The 6 Sep visible sprint fixed two likely blockers without direct database repair:
- Character Body now waits for Auth and no longer permanently caches a failed pre-auth Fitbit read as “no data / paused”.
- `autohabit-reconcile.js` is now **v11.8**: semantic JSON baseline comparison, longer bounded retry window and reruns when RPG cloud sync becomes ready/applies state. It still never direct-writes canonical cloud history.

### Latest pre-v11.8 live read-only audit — 6 Sep 2026

Walking: **29 qualified / 21 canonical / 8 pending**
- 2026-07-18
- 2026-07-20
- 2026-07-21
- 2026-07-27
- 2026-07-31
- 2026-08-02
- 2026-08-31
- 2026-09-06

Sleep: **11 qualified / 5 canonical / 6 pending**
- 2026-07-19
- 2026-07-22
- 2026-07-23
- 2026-07-30
- 2026-09-03
- 2026-09-06

Pending manual-off = 0; pending XP-paid = 0; both migration markers were still unset. Fitbit cloud itself was active on 6 Sep — it was not actually paused.

**Next proof:** force-close/reopen Joey's installed PWA so the new JS is loaded, open Main/Body normally, then run `server/database/fitbit-reconcile-audit.sql` read-only. Do not SQL-write the missing dates or count them as fixed before this natural proof.

'''
s=s[:sec2.start()]+new2+s[sec2.end():]
p.write_text(s)

print('HQ visible sprint sync complete')
