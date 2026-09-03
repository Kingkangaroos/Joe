# Gamenfy — Active Bugs / Verification Needed

> Shared handoff for Claude + ChatGPT. Technical fixes can be regression-covered automatically, but device/live-user-data behavior is not fully closed until Joey's real app state confirms it.

Last refreshed: 2026-09-03 by ChatGPT (OpenAI)

## 1. Daily Missions — intermittent state rollback
**Reported:** 30 Aug 2026  
**Status:** **TECHNICALLY FIXED + CI-LOCKED; real-device confirmation still useful.**

Original symptom: a backdated mission could appear checked, then return unchecked after navigating between Main and Skills.

Current `sync.js` uses a persistent dirty journal + monotone high-water mark so stale initial/realtime cloud snapshots cannot overwrite newer local edits or resurrect pre-auth deletions.

**Remaining verification:** previous-day mission edit → Skills → Main → background/reopen on Joey's installed PWA. If stable, move fully to resolved history.

---

## 2. Fitbit → Daily Missions retrospective reconciliation
**Reported/clarified:** 3 Sep 2026  
**Status:** **TECHNICAL CHAIN FIXED + CI/PRODUCTION VERIFIED; live cloud migration proof still pending natural Main use.**

Locked behavior:
- Walking auto-completes at 10,000 steps;
- Sleep auto-completes at 420 minutes / 7 hours;
- later Fitbit finalization can repair older qualified days;
- public 0–10 levels replay from `rpg_habitlog_v1`;
- no weekly reset;
- manual undo must not be fought by Fitbit;
- manual recheck clears suppression;
- Fitbit XP is exact-once across retries/crashes.

`autohabit-reconcile.js` v11.6 scans all available Fitbit dates, waits for safe sync convergence, writes genuinely missing qualified dates, replays canonical state, respects `manual-off`, reruns on foreground and keeps a retry-safe XP ledger.

Full integration regression proves:
**auto +15 → manual uncheck −15 → Fitbit blocked → manual recheck +15 → later Fitbit pass adds 0 extra XP.**

### Manual override routes
- Main current/backdated: protected;
- Park 3.1 host: protected;
- Character current-day: protected centrally;
- Character dated Daily Quest: protected by `sync.js` v11.8 with exact edited date + historical `(YYYY-MM-DD)` XP attribution;
- Daily Windows: self-contained `manual-off` fallback in v11.73.

### Live-data status — still open by design
No history has been force-written through SQL. Latest recorded read-only audit still predated natural client proof of the new migration. After Joey naturally opens authenticated Main, re-query read-only for migration markers, historical Walking/Sleep repairs and resulting levels.

---

## 3. Character dated Daily Quest bypass
**Status:** **FIXED + CI-LOCKED + PRODUCTION READY.**

Audit found Character had a second public dated Daily control that wrote `rpg_habitlog_v1` directly. Before the fix:
- Walking/Sleep backdated undo/recheck bypassed exact-date `manual-off` symmetry;
- `±15 XP` for a backdated day lacked `(YYYY-MM-DD)`, so global streak could attribute it to the later write day.

`sync.js` v11.8 wraps only public dated Daily Missions:
- canonical day-log remains source of truth;
- Walking/Sleep exact edited date sets/clears suppression;
- replay runs after mutation;
- XP audit reason carries the real activity date;
- private quests delegate to Character's existing PIN/private route.

Regression: `tests/character-dated-daily-smoke.js`.

---

## 4. Character legacy v9.1 Daily backfill
**Status:** **RETIRED + CI-LOCKED.**

Character still contains an old one-time migration that scans legacy `rpg_daily_v1:<date>.quests` and copies public completions into `rpg_habitlog_v1` after a 300 ms delay.

That migration is obsolete because `rpg_habitlog_v1` is now itself cloud-synced and canonical. Its old local-only flag could disappear on a clean/new device, allowing stale legacy data to resurrect a deliberately removed historical mission.

Modern `sync.js` v11.8 sets `rpg_daily_habit_backfill_v1=1` before Character's delayed migration can run. It deletes no legacy data; it only prevents old data from becoming authority again.

Regression: `tests/character-dated-daily-smoke.js` locks retirement ordering.

---

## 5. Global streak ghost / wrong-date / Jarvis writer bugs
**Status:** **FIXED + CI-LOCKED + PRODUCTION READY.**

Current `checkin.js` v7.6 activity sources:
- canonical public Daily Mission completion from `rpg_habitlog_v1`;
- XP netted per skill per actual activity date;
- completed venture steps;
- explicit evening check-in.

This closes three classes of error:
- `+15/-15` mission reversal no longer leaves a ghost day;
- historical XP with `(YYYY-MM-DD)` counts on the real day, not later write date;
- Jarvis can write a valid canonical Daily Mission without a habit-XP event and that completion still counts as real streak activity.

A dated `checkHabitFor()` wrapper on Main schedules a post-write streak/UI refresh, without taking ownership of the actual mission mutation.

Regressions:
- `tests/streak-net-activity-smoke.js`
- `tests/streak-backdated-xp-smoke.js`

Current green production checkpoint: `dcb5676ce95aad39a0b264850441430b28ae1d97`.

---

## 6. Jarvis habit XP audit consistency
**Status:** **NON-BLOCKING PRODUCT/CONSISTENCY DECISION.**

Jarvis `checkHabit` writes canonical completion and replay but currently does not create the usual public habit `+15 XP` audit event.

This no longer affects:
- visible Daily Mission 0–10 level;
- Character Level / Total Level (habits are excluded there anyway);
- global streak (canonical habitlog is now independent activity evidence).

It can still make the legacy category-XP statistic differ depending on which writer completed the mission. Do not modify this silently; decide later whether Jarvis should create optional habit audit XP or category-XP should exclude habits entirely.

---

## 7. Daily Mission authoritative reset
**Status:** **FIXED + CI-LOCKED.**

Reset prunes pre-reset canonical completion dates, protects pruned Fitbit-backed dates from automatic resurrection, preserves earned XP history, replays remaining dates and refreshes dependent views.

Regression: `tests/habit-reset-smoke.js`.

---

## 8. Daily Mission membership / source of truth
**Status:** **FIXED + CI-LOCKED.**

Canonical public 11:
Budgeting, Sleep, Nutrition, 10k Steps, Brush Teeth 2×, Household, Meditation, Gratitude, Good Deed, Screen Time, Cold Shower.

Private/PIN-backed and separate:
Weed Control / Gardening; No Porn / Discipline.

Public completion source: `rpg_habitlog_v1`. Public 0–10 cache: `rpg_habits_v1` rebuilt by authoritative replay. Tennis, Reading and Finger Whistling are normal skills; Grounding is disabled.

---

## 9. Habit XP versus visible levels
**Status:** **AUDITED — NO DOUBLE COUNT IN CHARACTER/TOTAL LEVEL.**

Habit-visible level uses canonical 0–10 score. Character Level and Skills Total Level/average explicitly exclude `isHabit` skills.

One legacy category-XP statistic includes habit XP. Treat that as a separate product-definition decision, not a Daily Mission correctness bug.

---

## 10. JS/PWA stale logic after deploy
**Status:** **FIXED + CI-LOCKED + PRODUCTION READY.**

`sw.js` is push-only: no fetch/cache handler. `vercel.json` serves own `*.js` with `Cache-Control: no-cache, must-revalidate`, so old query labels cannot silently pin stale logic. Daily Windows explicitly points at `daily-windows.js?v=11.73`.

Regression: `tests/cache-revalidation-smoke.js`.

---

## 11. iOS/PWA bottom navigation drifts into content while scrolling
**Reported:** 30 Aug 2026  
**Status:** **OPEN — device-dependent.**

Do not stack speculative transforms/`!important` fixes. If still reproducible, test an iOS-standalone-only shell/internal-scroller architecture and validate on Joey's actual installed PWA.

---

## 12. Park 3.1 asset gap
**Status:** **OPEN CREATOR TASK, NOT A LOGIC BUG.**

110 native Park 3.1 WebPs = 9 public sets ×10 + 2 private sets ×10. Missing native public ten-level sets:
- Budgeting — current labelled Park 2 fallback;
- Meditation — current labelled Park 2 staged fallback.

Do not fabricate replacements. See `img/lab/park31/ASSET-MAP.md`.

---

## 13. CI / deployment gate
**Status:** **LIVE.**

`.github/workflows/smoke.yml` runs every `tests/*-smoke.js` on pushes/PRs to `main` with Node 22.

Do not call a technical change complete until:
1. newest relevant GitHub Actions run is `completed/success`;
2. Vercel production deployment for that exact/latest commit is `READY` when deployment matters;
3. device/live-data behavior is separately verified when applicable.

Current functional baseline `dcb5676ce95aad39a0b264850441430b28ae1d97` passed the full suite and is production `READY`.
