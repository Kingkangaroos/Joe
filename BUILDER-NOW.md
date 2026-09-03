# BUILDER — Current handoff

Last updated: 2026-09-03  
Owner: Joey Siemons  
Primary builder: ChatGPT (OpenAI)

## Working agreement

This repository is the durable source of truth for Gamenfy. This chat is the **Builder**:

- Read live GitHub/current data before making claims or changes.
- Own implementation, integration, data wiring, tests, rollback and technical documentation.
- New original visual assets belong to a separate Creator workflow; Builder integrates approved output.
- A chat claim is not completed work until the relevant files/commit are verified in GitHub.
- Joey remains decision-maker for meaningful product/visual choices.
- When Joey says **“ga verder, druk”**, continue autonomously within these locked boundaries instead of stopping for routine clarification.

## Hard product boundaries

- New visual/product experiments are built and reviewed inside the **normal app's Lab**.
- **Home/Main visual layout stays untouched unless Joey explicitly requests a Home rollout.** The authorized Fitbit/Daily Mission logic may run on Main.
- Existing experiments are not overwritten merely to make room for a new version.
- Park 3.0 remains intact as rollback/reference.
- Park 3.1 is a separate current iteration, not a silent replacement of Park 3.0.
- Mobile/device-specific visual work is not fully closed until Joey's installed iPhone/PWA verifies it.

## Connected project

- GitHub: `Kingkangaroos/Joe`
- Default branch: `main`
- Vercel project: `joe`
- Supabase project: `Kingkangaroos's Project` (`ttxjsoahmtennnufgeqx`)
- Lab entry point: `lab.html`
- Park 3.0 implementation: `park3.html`, `park3.css`, `park3.js`
- Park 3.1 implementation: `park31.html`, `park31.css`, `park31.js`, host controller `park31-lab.js`

## Daily Mission source of truth — LOCKED

Public Daily Missions are active, non-private `RPG_DEFAULT_SKILLS` entries with `isHabit === true`.

Current public set (11):
- Budgeting
- Sleep
- Nutrition
- 10k Steps / Walking
- Brush Teeth 2×
- Household
- Meditation
- Gratitude
- Good Deed
- Screen Time
- Cold Shower

Grounding is disabled. Tennis, Reading and Finger Whistling are regular skills and must never enter the Daily Mission grid. No Porn and Weed Control are separate private dailies and retain the PIN-backed route.

Canonical persistence:
- Per-day completion: `rpg_habitlog_v1`
- Current 0–10 score/streak/last check: `rpg_habits_v1`
- `recomputeHabitFromLog(habitId)` is the authoritative public-habit replay engine.
- No weekly reset.
- Daily Mission score rule: complete day `+1` (max 10); completed missed calendar day `−1` (min 0); today is not considered missed before the day ends.

Canonical visual bands:
- 0–2 → Starter
- 3–4 → Apprentice
- 5–6 → Advanced
- 7–9 → Expert
- 10 → Master

## Park 3.1 — current Daily Mission Lab

Park 3.1 contains all **11 companion sets × 10 levels = 110 committed assets**. The old Park 2.0 “5 ready / 6 pending” status is historical and must not be treated as an active asset queue.

Current asset contract:
- `img/lab/park31/ASSET-MAP.md`
- `img/lab/park31/<mission>/l01.webp` through `l10.webp`

Locked Steps decisions:
- The same character remains recognisable across Levels 1–10.
- Joey selected the second Level-1 yawning/sleepy alternative.
- Technical Level 0 is real; it may reuse Level-1 artwork with critical styling, but the actual displayed level/progress remains **0 / 0%**.

Current interaction:
- Short tap opens the companion detail/evolution preview.
- `− / +` is read-only preview and cannot change live data.
- Explicit `Voltooi vandaag` / `Ongedaan maken` changes the real mission.
- Deliberate 560 ms hold is a shortcut for the same action.
- Moving >12 px cancels the hold so scrolling does not claim a mission.
- Public companions route through the host Daily Mission controller.
- Gardening / Discipline retain private PIN flow.
- After 3+ inactive days a companion may show **HELP**.
- A real completion that raises live level triggers the existing short level-up celebration.

### Park 3.1 consistency pass — 2026-09-03

`park31.js` v1.13 now uses the canonical bands everywhere. The stale labels `BUILDING` and `ELITE` were removed. Boundary regression coverage explicitly checks 0/2/3/4/5/6/7/9/10.

Technical Level 0 was also corrected:
- art fallback can remain `l01.webp`;
- live header/modal display `Level 0`;
- progress is 0%, not 10%;
- band label is Starter while the existing zero/critical visual treatment may remain.

Park 3.1 listens to `gamenfy:auto-habits-changed`, so a Fitbit retrospective reconciliation refreshes the companion level immediately rather than waiting for its periodic poll.

## Fitbit → Daily Missions retrospective reconciliation — LIVE code, device exercise pending

Joey explicitly requested automatic Steps/Sleep completion to work retrospectively when Fitbit finalizes/corrects an older day.

Thresholds remain:
- Walking: **10,000 steps**
- Sleep: **420 minutes / 7 hours**

### Live-data audit before first reconciler run

Supabase ingest was healthy. Before Joey's next Main open, the cloud audit found:
- **7** Fitbit-qualified Walking dates absent from `rpg_habitlog_v1`;
- **5** Fitbit-qualified Sleep dates absent from `rpg_habitlog_v1`.

Canonical replay after adding all currently qualified Fitbit dates predicts:
- Walking → **Level 10** (unchanged, already capped)
- Sleep → **Level 1** (cloud was stale at Level 0)

No historical habit data was force-written through SQL. The normal authenticated app/sync path remains authoritative.

### Implementation v11.4

`autohabit-reconcile.js` now:
- scans every available Fitbit calendar day through today instead of only today + yesterday;
- leaves threshold misses reopenable, so a later Fitbit correction can self-heal an old day;
- writes only genuinely missing qualified days to `rpg_habitlog_v1`;
- recomputes affected habit levels via existing `recomputeHabitFromLog()`;
- records audit-friendly XP reason with the actual historical date;
- stores deliberate manual Walking/Sleep unchecks as `manual-off` and will not fight them;
- can infer older manual unchecks from the existing XP log where possible;
- reruns when the app returns to focus/foreground.

### Startup/sync race hardening v11.4

The reconciler fetches `health_fitbit` and the current cloud `rpg` baseline together, then waits until `sync.js` has either:
- applied that cloud baseline to the critical local RPG keys, or
- recorded a genuinely newer local dirty edit in `__gamenfy_sync_dirty_v1:rpg`.

If the baseline is not safe yet, it aborts/retries rather than mutating stale local state.

`checkin.js` v11.4 synchronously replaces the legacy `xp.js` today+yesterday checker with a queueing placeholder before Main can call it. Once the safer module loads, queued UI callbacks are handed to the authoritative pass. This prevents the old checker from racing the initial cloud pull.

`park31-lab.js` records the same `manual-off` override when Joey deliberately unchecks Walking or Sleep in the Lab.

Regression file: `tests/autohabit-retrospective-smoke.js`.

## Health Trail — current Lab prototype

The D-score replacement prototype is mounted directly in the normal Lab and remains read-only.

Score model:
- 70% = average current public Daily Mission level
- 30% = available Fitbit recovery score
- recovery currently uses sleep plus HRV and resting-heart-rate movement against Joey's recent baseline
- missing Fitbit signals are omitted rather than counted as failure

`health-trail.js` v1.1 reads the same `getHabits()` public levels, so retrospective Daily Mission corrections feed the trail automatically. It now listens to:
- `gamenfy:daily-mission-change`
- `gamenfy:auto-habits-changed`
- `gamenfy:remote-state-applied`
- focus / foreground changes

Rapid events coalesce the Fitbit read rather than fanning out duplicate network requests. The runner reuses current Park 3.1 Steps artwork v1.13.

Regression file: `tests/health-trail-smoke.js`.

## Other verified project state

### Park 3.1 artwork
- Household, Gratitude, Nutrition and Brush Teeth use Joey's approved final files.
- Cold Shower, Brush Teeth, Good Deed, Steps and Sleep cleanup produced transparent WebP cutouts where intended.
- Household Level 1 is intentionally more confronting/messy for motivation.
- Park 3.0 remains rollback/reference.

### Chess
The existing Chess skill already contains XP, tiers/gates, assessment, logging and Lab visuals. Do not create a duplicate Chess system.

### Sync
`sync.js` v11.2 is the current whole-row race hardening layer: persistent dirty journal, newer-local protection, monotone watermark, stale realtime healing and unload safety net.

### Known device issue
The iOS/PWA bottom navigation can visually drift upward while scrolling. This remains open and is likely related to iOS 26/WebKit fixed-position rendering. Do not blindly pile CSS transforms onto it without device evidence; see `BUGS-ACTIVE.md`.

## Verification status

- GitHub contains the implementation/test changes above.
- Vercel production deployments for the Daily Mission/Park/Health Trail changes have been observed as READY after their commits.
- There is currently no `.github/workflows` CI in this repository; the Node smoke files are regression assets, not a claim that GitHub Actions executed them.
- Container-side internet/DNS was unavailable during this work session, so do not misreport the browserless smoke files as locally executed here.
- Joey's authenticated cloud `rpg` row had **not yet changed** after deployment at the last check; the first real Main open on his device is intentionally allowed to exercise the reconciler rather than force-writing history from the database.

## Next build sequence

1. After Joey's next real Main open, inspect Supabase non-destructively and verify that the missing qualified Fitbit dates reconciled through the normal app path; do not force them with SQL.
2. Verify Walking 31 Aug and current Sleep specifically, plus resulting Walking/Sleep scores.
3. Continue concrete Park 3.1 companion/interaction fixes in Lab if Joey gives visual feedback.
4. Keep Home visual/layout work untouched until explicit rollout approval.
5. Treat convincing character locomotion as a separate animation/frame-asset problem; do not fake leg movement by simply wobbling a static image.

## Definition of done for current Daily Mission layer

- Main, Character and Park 3.1 read the same public per-day completion log.
- All public 0–10 levels come from authoritative replay of that log.
- No weekly reset exists.
- Manual check/uncheck, backdated edits and Fitbit backfill converge to the same result.
- Fitbit cannot fight a deliberate manual Walking/Sleep uncheck.
- A late Fitbit correction can restore a legitimately qualified older day.
- Park and Health Trail refresh immediately after reconciliation.
- Park 3.1 uses canonical level bands and technical Level 0 remains visibly 0.
- Park 3.0 remains available as rollback/reference.
- Device-specific issues are not marked fully resolved until Joey's iPhone/PWA confirms them.
