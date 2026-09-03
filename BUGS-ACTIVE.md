# Gamenfy — Active Bugs / Verification Needed

> Shared handoff for Claude + ChatGPT. Technical fixes can be regression-covered automatically, but device-specific behavior is not fully closed until Joey's installed iPhone/PWA confirms it.

## 1. Daily Missions — intermittent state rollback
**Reported:** 30 Aug 2026  
**Status:** **technical fix LIVE + automated regression coverage; real-device confirmation still requested.**

Original symptom: a backdated mission could appear checked, then return unchecked after navigating between Main and Skills.

Confirmed root cause was an out-of-order whole-row sync/realtime race. `sync.js` v11.2 now maintains a persistent dirty journal and high-water mark so a stale remote snapshot cannot overwrite a newer local edit.

Durable automated coverage now exists in `tests/sync-race-smoke.js` for:
- edit before Auth / initial cloud pull;
- stale initial cloud snapshot;
- newer-local healing write;
- stale realtime echo after newer state;
- pre-auth deletion that must not be resurrected.

The test runs automatically in `.github/workflows/smoke.yml` and has passed in GitHub Actions.

**Still verify on Joey's installed PWA:** repeat a previous-day mission edit → Skills → Main → background/reopen. If stable, move this item to resolved/history.

---

## 2. Fitbit → Daily Missions retrospective reconciliation
**Reported/clarified:** 3 Sep 2026  
**Status:** **technical fix LIVE + CI-covered; waiting for first real authenticated Main exercise.**

Locked behavior:
- Walking auto-completes at 10,000 steps;
- Sleep auto-completes at 420 minutes / 7 hours;
- later Fitbit finalization can repair an older calendar day;
- public 0–10 levels are replayed from `rpg_habitlog_v1`;
- no weekly reset;
- deliberate manual uncheck must not be fought by Fitbit.

### Live-data failure confirmed before fix
Fitbit ingest was healthy, but several qualified Fitbit days were absent from the canonical habitlog. The pre-exercise audit found 7 qualified Walking dates and 5 qualified Sleep dates missing from the log. Canonical replay predicted Walking staying capped at 10 and Sleep moving from stale Level 0 to Level 1.

No historical habit data was force-written through SQL.

### Fix — v11.5
`autohabit-reconcile.js` now:
- scans all available Fitbit dates through today;
- keeps misses reopenable for later Fitbit corrections;
- fetches Fitbit and current RPG cloud baseline together;
- waits for `sync.js` convergence/newer-local evidence before mutation;
- backfills genuinely qualified missing days;
- recomputes through the existing authoritative replay engine;
- uses `manual-off` for deliberate Walking/Sleep unchecks;
- protects Main, Park and Character/backdated unchecks;
- reruns on focus/foreground.

`checkin.js` gates the legacy today/yesterday checker while the safer reconciler loads.

Legacy ambiguous `rpg_autohabit_v1` flags are migrated once using `__retrospective_v2_migrated=true`. After migration, disappearance of a previously confirmed auto-backed date from the canonical habitlog is treated as deliberate removal rather than something Fitbit should re-add.

Regression: `tests/autohabit-retrospective-smoke.js`, executed by GitHub Actions.

**Still verify after Joey opens Main:** non-destructively inspect the cloud row for the migration marker, Walking 2026-08-31, current Sleep and resulting Walking/Sleep levels. Do not force this with SQL.

---

## 3. iOS/PWA bottom navigation drifts into content while scrolling
**Reported:** 30 Aug 2026  
**Status:** **OPEN — device-dependent, likely iOS 26/WebKit fixed-position rendering.**

Symptom: bottom navigation can visually travel upward into page content while scrolling in the standalone PWA.

This closely matches known iOS 26/WebKit fixed/sticky painting failures. Previous speculative CSS hardening was intentionally not merged because visual correctness could not be established without Joey's device.

Do not stack transforms/`!important` rules blindly. If still reproducible, the safer experiment is an iOS-standalone-only shell/internal-scroller architecture where the navigation is not painted as a normal `position:fixed` footer.

**Needed before closing:** real-device screenshot/reproduction and validation of any workaround.

---

## 4. Park 3.1 Daily Mission membership
**Status:** **FIXED + CI-LOCKED.**

A 3 Sep audit found a genuine source-of-truth mismatch: Park 3.1 called its roster “11 Daily Mission companions” but its eleven were actually 9 public missions plus the two private dailies. Budgeting and Meditation were missing from Park, while Gardening and Discipline were occupying public slots.

Park 3.1 v1.14 now displays:
- exact canonical **11 public Daily Missions**;
- a separate **2 private dailies** section beneath them.

`tests/daily-membership-smoke.js` derives the canonical public set from `RPG_DEFAULT_SKILLS` and compares it with Park's public registry on every CI run.

### Asset truth
The repository's 110 native Park 3.1 WebPs are still valid, but they represent:
- 9 public native sets ×10;
- 2 private native sets ×10.

The two canonical public missions without native Park 3.1 ten-level sets are:
- Budgeting — currently an explicitly labelled existing Park 2 base-art fallback;
- Meditation — currently an explicitly labelled existing Park 2 base/Advanced/Mastery three-stage fallback.

No artwork was generated or fabricated to hide the gap. Native Budgeting/Meditation Park 3.1 sets remain a separate Creator/approval task. See `img/lab/park31/ASSET-MAP.md`.

---

## 5. Daily Mission authoritative reset
**Status:** **FIXED + CI-LOCKED.**

The old “Reset & start fresh” only reset current habit state while leaving old `rpg_habitlog_v1` dates intact. The replay engine could therefore reconstruct the supposedly reset level.

The current reset:
- prunes pre-reset canonical completion dates for that habit;
- protects pruned Fitbit-backed dates from immediate re-addition;
- preserves earned XP;
- recomputes from remaining post-reset dates;
- refreshes dependent Lab views.

Regression: `tests/habit-reset-smoke.js`.

---

## 6. Daily Mission source of truth
**Status:** **LIVE / unified.**

Canonical public set:
- Budgeting
- Sleep
- Nutrition
- 10k Steps
- Brush Teeth 2×
- Household
- Meditation
- Gratitude
- Good Deed
- Screen Time
- Cold Shower

Public day completion comes from `rpg_habitlog_v1`; public current level comes from `rpg_habits_v1` after authoritative replay. Main, Character and Park use this same public state.

Private dailies:
- No Porn / Discipline
- Weed Control / Gardening

These remain separate/PIN-backed and must never count toward the public eleven. Tennis, Reading and Finger Whistling remain normal skills, never Daily Missions. Grounding is disabled.

Canonical visual bands:
- 0–2 Starter
- 3–4 Apprentice
- 5–6 Advanced
- 7–9 Expert
- 10 Master

---

## 7. CI / regression status
**Status:** **LIVE.**

`.github/workflows/smoke.yml` automatically runs all `tests/*-smoke.js` on pushes and PRs to `main` with Node 22.

Recent green runs have covered:
- the full Park 3.1 native asset inventory and interaction suite;
- exact public/private Daily Mission membership;
- sync race healing;
- Fitbit retrospective reconciliation;
- authoritative reset;
- Health Trail;
- Chess;
- existing Lab/website regressions.

Before claiming a future functional change is complete, inspect the newest Actions run rather than relying on old test results.