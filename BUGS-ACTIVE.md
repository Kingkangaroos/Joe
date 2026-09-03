# Gamenfy — Active Bugs / Verification Needed

> Shared handoff for Claude + ChatGPT. Technical fixes may be merged when independently verified, but a device-specific issue is not considered fully closed until Joey's real iPhone/PWA flow confirms it.

## Daily Missions — intermittent state rollback
**Reported:** 30 Aug 2026  
**Status:** **technical root cause reproduced + fix merged to production; real-device confirmation still requested.**

Observed user flow:
1. Home → select Saturday / a previous day.
2. Check a mission such as **10k Steps**.
3. Navigate to Skills.
4. Return to Home.
5. Sometimes the mission appeared unchecked again; on another retry it remained correctly checked.

### Root cause confirmed
The previous whole-blob sync could have two writes/realtime events in flight at once. An older Supabase `app_state:rpg` snapshot could arrive after a newer local `rpg_habitlog_v1` change and `applyRemote()` would overwrite the newer local mission state.

This was reproduced in a synthetic delayed-Supabase regression test against the previous `main/sync.js`: **FAIL — stale realtime echo overwrote newer local mission state.**

### Fix now live
Merged via PR #4, production commit `c097358560c060e893d9d2299758abc9394773ff`.

`sync.js` v11.2 now:
- journals every synced local write immediately, including before Auth / initial pull finishes;
- keeps a persistent dirty journal across page navigation;
- prevents a remote row from touching a local dirty key when the local edit is newer;
- clears dirty state only after a confirmed write/realtime confirmation;
- uses a monotone version watermark so whole-row writes that physically commit out of order cannot roll state backwards;
- detects a later-arriving older row, ignores it locally and automatically heals Supabase from the newest local state;
- keeps unload/pagehide writes as a safety net without optimistically declaring them confirmed.

Regression checks passed against the exact merged implementation:
- stale realtime echo after newer local edit;
- edit before Auth / initial cloud pull;
- page navigation before cloud confirmation;
- normal update/delete convergence;
- two writes committing in reverse order (older write physically lands last → detected + healed).

Vercel production deployment is READY. The old `sync.js?v=11.0` URL was also fetched directly from production and already returns the new v11.2 implementation with `max-age=0, must-revalidate`, so no stale service-worker cache is involved (`sw.js` does not cache app assets).

**Still verify on Joey's installed iPhone PWA:** repeat the original Saturday/10k Steps → Skills → Home flow several times and background/reopen once. If all stays checked, this bug can move to resolved/history.

---

## Fitbit → Daily Missions retrospective reconciliation
**Reported/clarified:** 3 Sep 2026  
**Status:** **technical fix LIVE; waiting for first real Main open on Joey's device to exercise it against his authenticated local session.**

Joey's locked behavior:
- 10,000 Steps and Sleep can be completed automatically from Fitbit;
- late Fitbit finalization must repair an older calendar day retrospectively;
- the authoritative 0–10 Daily Mission level must be recomputed from the full day log;
- there is no weekly reset;
- a deliberate manual uncheck must remain deliberate and must not be fought by Fitbit.

### Live-data failure confirmed before fix
The Fitbit ingest was healthy, but finalized Fitbit-success days were missing from `rpg_habitlog_v1`. At the 3 Sep audit the live cloud state contained **7 Fitbit-qualified Walking days** and **5 Fitbit-qualified Sleep days** that were not present in the corresponding habit log.

Replaying the canonical +1/−1 rules after adding those qualified days gives:
- Walking → Level **10** (unchanged; already capped at 10);
- Sleep → Level **1** (from the stale cloud Level 0).

No historical habit data was force-written with SQL. The normal authenticated app/sync path remains authoritative.

### Fix now live
`autohabit-reconcile.js` v11.4:
- scans every available Fitbit calendar day through today, rather than only today + yesterday;
- treats a failed threshold as reopenable so later Fitbit corrections can still self-heal it;
- writes a missing qualified day to `rpg_habitlog_v1`, then calls the existing authoritative `recomputeHabitFromLog()`;
- stores deliberate Walking/Sleep unchecks as `manual-off` and respects them on future passes;
- reruns after app focus/visibility returns;
- fetches `health_fitbit` **and the current `rpg` cloud baseline** together;
- waits until `sync.js` has either applied that baseline locally or has proof of a genuinely newer local dirty write before it mutates anything;
- safely aborts/retries instead of running on a stale startup snapshot.

`checkin.js` v11.4 synchronously gates the legacy `xp.js` today+yesterday checker while the new reconciler loads, queues any early Main callback, and hands it to the cloud-baselined reconciler. This closes the startup race in which the legacy checker could otherwise run first.

Regression coverage lives in `tests/autohabit-retrospective-smoke.js`. Latest related Vercel production deployments are READY.

**Still verify on Joey's installed iPhone/PWA:** open Main after a Fitbit sync, then inspect an older qualified date (notably Walking 31 Aug) and today's Sleep. The app should self-reconcile through its normal sync engine.

---

## iOS/PWA bottom navigation drifts into content while scrolling
**Reported:** 30 Aug 2026  
**Status:** **OPEN — likely WebKit/iOS 26 rendering bug; intentionally kept out of the sync/visual production merges. Screenshot / real-device investigation still useful.**

Joey reports that the bottom navigation (Main / Body / Skills / Finance / Jarvis) can visually travel upward while scrolling and end up in the middle of the content instead of remaining pinned to the bottom viewport edge.

### Strong external match found
This symptom closely matches open WebKit bugs, not just a Gamenfy CSS mistake:
- WebKit #301172 — **“Fixed and sticky elements do not render in correct position while scrolling in PWA”**. Report explicitly describes standalone PWAs where fixed/sticky elements drift approximately halfway through the viewport during scrolling.
  https://bugs.webkit.org/show_bug.cgi?id=301172
- WebKit #312149 — **“iOS 26: position: fixed; bottom: 0 element painted at wrong vertical position”**. Report specifically describes bottom navigation/footer-style elements ending up mid-viewport after scroll gestures; it also notes that JS/CSSOM measurements can report the correct position while the element is visibly painted elsewhere.
  https://bugs.webkit.org/show_bug.cgi?id=312149

Both are iOS 26 / WebKit Layout & Rendering issues. This means a JS fix based only on `getBoundingClientRect()` / `visualViewport.height` may be unable to detect the visual failure, and blindly adding transforms / `!important` rules is not a reliable fix.

Important Gamenfy history:
- An early combined test branch contained stronger fixed-position/transform/safe-area CSS.
- That mixed branch was deliberately closed and **the bottom-nav hardening was NOT merged** because it could not be visually verified against the installed iOS PWA.
- Current production still uses the existing `topbar.js` bottom bar implementation.

Possible fallback if the bug proves persistent on Joey's device: prototype an **iOS-standalone-only non-fixed navigation architecture** (e.g. shell/internal scroller with nav as normal-flow sibling) instead of piling more CSS onto `position:fixed`. That is a larger layout change and should be tested on a branch first.

Next useful input: Joey's screenshot showing the wrong bar position, ideally while the issue is happening. Then compare the symptom with WebKit #301172/#312149 before choosing a workaround.

---

## Daily Mission state/source of truth
**Status:** **LIVE / unified** — Character, Main and Park 3.1 use the same public Daily Mission completion log and 0–10 habit score.

PR #8 / production commit `63aef5ca420e233b0adcde4b05bc15a48fcab21c` removed Character's old split-brain Daily implementation.

Public Daily Missions are generated from `RPG_DEFAULT_SKILLS` entries where `isHabit === true`, `active !== false`, and `!private`, and their per-day completion state comes from `rpg_habitlog_v1`. Their live level comes from `rpg_habits_v1` after authoritative replay of that log. Public Character toggles no longer mirror a competing completion flag into `rpg_daily_v1`; No Porn and Weed Control remain separate private quests.

Regression verification covered:
- exact 11 public + 2 private;
- Home check reflected in Character;
- backdated Character check/uncheck replaying canonical habit state;
- public mutations not creating public `rpg_daily_v1` quest flags;
- private mutation retaining its private quest flag;
- Park 3.1 reading the same live habit scores and routing public completion through the host mission controller.

Non-negotiable membership:
- **Tennis, Reading, Finger Whistling are regular skills and must NEVER enter the Daily Mission grid.**
- **No Porn / Weed Control are separate private dailies** and must not appear in the public Daily Mission grid or public assets.
- Current public set: Budgeting, Sleep, Nutrition, 10k Steps, Brush Teeth 2×, Household, Meditation, Gratitude, Good Deed, Screen Time, Cold Shower.
- Grounding is disabled.

---

## Daily Mission characters — Park 3.1 current / Park 2.0 rollback
**Status:** **Park 3.1 is the current Lab iteration with 11/11 companion sets and all 110 level assets. Park 2.0 is a frozen historical rollback/reference.**

Park 2.0 Option D is the art-direction origin for the evolvable game-companion approach, but its old “5 real + 6 pending” state is **historical**, not a current production queue. Do not rebuild placeholders from that old status.

Current source of truth:
- `BUILDER-NOW.md` for product/implementation status;
- `img/lab/park31/ASSET-MAP.md` for Park 3.1 asset mapping;
- `img/lab/park31/<mission>/l01.webp` through `l10.webp` for the actual current companion evolutions.

Current Park 3.1 facts:
- 11 companion sets × 10 levels = **110 committed assets**;
- the normal `lab.html` embeds Park 3.1 in Daily Mission mode;
- Park 3.0 remains separately available as rollback/reference;
- Home/Main has not received the Park 3.1 visual layout;
- the old `img/lab/park2/DAILY-MISSION-ART-QUEUE.md` may be useful as historical design context but is **not** the current missing-asset task list.

### Canonical level bands — fixed and regression-covered
The definitive Daily Mission visual bands are:
- 0–2 → Starter;
- 3–4 → Apprentice;
- 5–6 → Advanced;
- 7–9 → Expert;
- 10 → Master.

Park 3.1 v1.13 removed stale `BUILDING` / `ELITE` labels and now follows the same contract at boundary levels 0/2/3/4/5/6/7/9/10. Technical Level 0 remains a real level: it may reuse Level-1 artwork with the critical visual treatment, but the UI now displays **Level 0 and 0% progress**, not the fallback art level. Fitbit reconciliation also triggers an immediate Park refresh event instead of waiting for the periodic poll.
