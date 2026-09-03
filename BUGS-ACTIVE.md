# Gamenfy — Active Bugs / Verification Needed

> Shared handoff for Claude + ChatGPT. Technical fixes can be regression-covered automatically, but device/live-user-data behavior is not fully closed until Joey's real app state confirms it.

## 1. Daily Missions — intermittent state rollback
**Reported:** 30 Aug 2026  
**Status:** **TECHNICALLY FIXED + CI-LOCKED; real-device confirmation still useful.**

Original symptom: a backdated mission could appear checked, then return unchecked after navigating between Main and Skills.

Confirmed root cause was an out-of-order whole-row sync/realtime race. Current `sync.js` uses a persistent dirty journal and monotone high-water mark so a stale remote snapshot cannot overwrite a newer local edit.

Regression coverage protects:
- edit before Auth / initial cloud pull;
- stale initial cloud snapshot;
- newer-local healing write;
- stale realtime echo after newer state;
- pre-auth deletion that must not be resurrected.

**Remaining verification:** repeat a previous-day mission edit → Skills → Main → background/reopen on Joey's installed PWA. If stable, this can move fully to resolved history.

---

## 2. Fitbit → Daily Missions retrospective reconciliation
**Reported/clarified:** 3 Sep 2026  
**Status:** **TECHNICAL CHAIN FIXED + CI/PRODUCTION VERIFIED; live cloud migration proof still pending natural Main use.**

Locked behavior:
- Walking auto-completes at 10,000 steps;
- Sleep auto-completes at 420 minutes / 7 hours;
- later Fitbit finalization can repair older qualified calendar days;
- public 0–10 levels replay from authoritative `rpg_habitlog_v1`;
- no weekly reset;
- deliberate manual uncheck must not be fought by Fitbit;
- deliberate manual recheck must clear `manual-off`;
- Fitbit XP must be exact-once across retries/crashes.

### Current technical implementation

`autohabit-reconcile.js` v11.6:
- scans all available Fitbit dates through today;
- leaves misses reopenable for later corrections;
- fetches Fitbit and RPG cloud baseline together;
- waits for safe sync/local convergence before mutation;
- backfills genuinely qualified missing days;
- recomputes through authoritative replay;
- respects `manual-off`;
- reruns on focus/foreground;
- uses a retry-safe XP ledger (`__xp_awarded_v1:<habit>:<date>`);
- conservatively treats legacy already-confirmed canonical Fitbit days as historically paid;
- detects XP already written before a ledger-save crash, preventing duplicate +15;
- can recover the opposite crash window where canonical completion was saved before +15 XP.

`sync.js` v11.7 centrally protects Character/current-day routes:
- `uncheckHabit(walking|sleep)` ⇒ `manual-off` on;
- `checkHabit(walking|sleep)` ⇒ `manual-off` cleared.

Main, Park 3.1 and Daily Windows have equivalent protection for their own dated/direct-log routes.

Full integration regression proves:
**auto +15 → manual uncheck −15 → Fitbit blocked → manual recheck +15 → later Fitbit pass adds 0 extra XP.**

Relevant production-ready checkpoints include:
- `99efac426a2b48293b0865eb49eea00f0b79ace6` — full manual cycle;
- `d18864da02f2c2e82f6926dc554344854244efb0` — Daily Windows override symmetry.

### Live-data status — still open by design

No historical habit data has been force-written through SQL.

Latest read-only Supabase audit on 3 Sep still showed the RPG cloud row unchanged since `2026-09-03 11:12:10 UTC` and the retrospective migration marker absent. Therefore the stored cloud row had not yet proven a natural authenticated Main execution of the new reconciler at that read.

**Still verify after Joey naturally opens Main:** re-query read-only for migration markers, historical Walking backfill, current Sleep and resulting Walking/Sleep levels. Do not manufacture this proof.

---

## 3. iOS/PWA bottom navigation drifts into content while scrolling
**Reported:** 30 Aug 2026  
**Status:** **OPEN — device-dependent.**

Symptom: bottom navigation can visually travel upward into page content while scrolling in the standalone PWA.

Do not stack speculative transforms/`!important` rules. If still reproducible, the safer experiment is an iOS-standalone-only shell/internal-scroller architecture where navigation is outside the scrolling paint layer.

**Needed before closing:** real-device screenshot/reproduction and validation of any workaround.

---

## 4. Daily Mission membership / source of truth
**Status:** **FIXED + CI-LOCKED.**

Canonical public 11:
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

Private dailies remain separate/PIN-backed:
- Weed Control / Gardening
- No Porn / Discipline

Park 3.1 displays the exact public eleven plus a separate private section. Tennis, Reading and Finger Whistling are normal skills, never public Daily Missions. Grounding is disabled.

Public completion source: `rpg_habitlog_v1`.  
Public 0–10 cache: `rpg_habits_v1`, rebuilt by authoritative replay.

`sync.js` now replays every public mission after the safe RPG cloud baseline and after later remote applies, so stale score/streak/lastChecked cache state cannot outrank the canonical day log.

---

## 5. Daily Mission authoritative reset
**Status:** **FIXED + CI-LOCKED.**

Current reset:
- prunes pre-reset canonical completion dates;
- protects pruned Fitbit-backed dates from immediate re-addition;
- preserves earned XP history;
- recomputes from remaining post-reset dates;
- refreshes dependent Lab views.

Regression: `tests/habit-reset-smoke.js`.

---

## 6. Global streak ghost / wrong-date bugs
**Status:** **FIXED + CI-LOCKED + PRODUCTION READY.**

Current `checkin.js` v7.5 behavior:
- XP is netted per skill per activity date;
- +15/−15 mission reversal cancels only that mission;
- another real activity on the date keeps the day active;
- venture steps and evening check-ins independently count;
- old streak history outside capped XP evidence is preserved;
- historical `best` never shrinks;
- backdated Main/Fitbit XP uses trailing `(YYYY-MM-DD)` audit date rather than the later physical XP-write date.

Therefore a 31-Aug Fitbit backfill written on 3-Sep cannot falsely mark 3-Sep active.

Regression: streak net-activity + dedicated backdated-date smoke tests.

---

## 7. Habit XP versus visible levels
**Status:** **AUDITED — NO DOUBLE COUNT IN CHARACTER/TOTAL LEVEL.**

Daily Mission completion still writes audit/activity XP. This is intentional and separate from the mission's visible 0–10 level.

Verified:
- habit-visible level uses the canonical 0–10 score;
- Character Level sums only non-habit skill XP;
- Skills Total Level/average excludes habits.

One legacy category-XP statistic does aggregate all XP in its category, including habit XP. This is not currently treated as a correctness bug because it is a separate product-definition choice. Do not silently change it without deciding what category progression should mean.

---

## 8. JS/PWA stale logic after deploy
**Status:** **FIXED + CI-LOCKED + PRODUCTION READY.**

Audit found stale-looking query labels such as `sync.js?v=11.0` and Daily Windows `v11.71`. The service worker was confirmed push-only: no fetch handler and no Cache API use.

Rather than risk rewriting giant HTML files purely for query strings, `vercel.json` now explicitly sends all own `*.js` with:

`Cache-Control: no-cache, must-revalidate`

Daily Windows additionally points directly at `daily-windows.js?v=11.72`.

Regression `tests/cache-revalidation-smoke.js` protects:
- JS revalidation header;
- current Daily Windows cache key;
- push-only/non-caching service worker contract.

Commit `01dcd190ae06bfa0fbc29cf87ab27734ab89fce2` passed GitHub Actions and is Vercel production `READY`.

---

## 9. Park 3.1 asset gap
**Status:** **OPEN CREATOR TASK, NOT A LOGIC BUG.**

Repository asset truth:
- 110 native Park 3.1 WebPs = 11 native sets ×10;
- native sets represent 9 public + 2 private companions;
- Budgeting and Meditation still lack native Park 3.1 ten-level sets.

Current explicit fallbacks:
- Budgeting → existing Park 2 base art;
- Meditation → existing Park 2 base/Advanced/Mastery art.

Do not fabricate replacements. See `img/lab/park31/ASSET-MAP.md`.

---

## 10. CI / regression status
**Status:** **LIVE.**

`.github/workflows/smoke.yml` automatically runs every `tests/*-smoke.js` on pushes and PRs to `main` with Node 22.

Recent green coverage includes:
- exact public/private Daily Mission membership;
- authoritative habit replay and reset;
- sync race healing and remote refresh;
- Fitbit retrospective reconciliation;
- symmetric manual overrides across Character/Park/Daily Windows;
- exact-once Fitbit XP and full manual cycle;
- streak net activity and historical date attribution;
- JS cache revalidation;
- Park, Daily Garden, Health Trail, Chess and existing Lab/website regressions.

Before claiming any future functional change complete, inspect the newest Actions run **and** the exact production deployment.
