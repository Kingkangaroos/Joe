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
**Status:** **LIVE / unified** — Character and Main now use the same public Daily Mission source and completion log.

PR #8 / production commit `63aef5ca420e233b0adcde4b05bc15a48fcab21c` removed Character's old split-brain Daily implementation.

Public Daily Missions are now generated from `RPG_DEFAULT_SKILLS` entries where `isHabit === true`, `active !== false`, and `!private`, and their per-day completion state comes from `rpg_habitlog_v1` on both Main and Character. Public Character toggles no longer mirror a competing completion flag into `rpg_daily_v1`; No Porn and Gardening remain separate private quests there.

Regression verification passed on mobile Chromium:
- exact 11 public + 2 private;
- Home check is immediately reflected in Character;
- backdated Character check/uncheck replays canonical habit state;
- public mutations do not create public `rpg_daily_v1` quest flags;
- private mutation still writes its private quest flag;
- 0 page/console errors.

Non-negotiable membership:
- **Tennis, Reading, Finger Whistling are regular skills and must NEVER enter the Daily Mission grid.**
- **No Porn / Gardening are separate private dailies** and must not appear in the public Daily Mission grid or public assets.
- Current public set: Budgeting, Sleep, Nutrition, 10k Steps, Brush Teeth 2×, Household, Meditation, Gratitude, Good Deed, Screen Time, Cold Shower.
- Grounding is disabled.

---

## Daily Mission characters — Park 2.0 Option D
**Status:** **LIVE art direction, 5 real companions + 6 explicitly pending.**

Joey explicitly selected the existing **Park 2.0 Option D — evolvable game companions** as the canonical character family for Daily Missions. PR #9 / production commit `5075aab4ca900cdee129b9493650ac570fafa3a4` removed the newer generic inline-vector family from the Daily Mission workbench.

Real Option-D Daily companions currently reused in the app:
- Budgeting;
- Good Deed;
- Sleep (base + real Advanced + Mastery);
- 10k Steps / Walking (base + real Advanced + Mastery);
- Meditation (base + real Advanced + Mastery).

Missing companions are deliberately shown as **Park D art pending**, not replaced with another style:
- Nutrition;
- Brush Teeth 2×;
- Household;
- Gratitude;
- Screen Time;
- Cold Shower.

The detailed locked art brief and production order are in `img/lab/park2/DAILY-MISSION-ART-QUEUE.md` (commit `307257024bdea979ea153555defba5eae7ef48ea`). Claude and ChatGPT should use that file as the character-art source of truth.

Mobile preview verification for the live Park-D integration passed: 5 exact Park-D images loaded, 6 pending, 0 old `.mg-evo-svg` characters, 0 relevant asset 404s and 0 JS/page errors. The Park 2.0 loader was also changed so it no longer probes known-missing evolution files just to fall back.

### Open consistency cleanup — do not treat level 9 as Master
The definitive Daily Mission rule is that **Master belongs to level 10 only**. The intended visual bands are:
- 0–2 → Starter;
- 3–4 → Apprentice;
- 5–6 → Advanced;
- 7–9 → Expert;
- 10 → Master.

The art-queue already records this contract. However, an older threshold remains in `park2.js` where the historical Park engine uses `habitAt:9` for its mastery stage, and `daily-garden.js` still contains older intermediate labels/bands from the superseded vector workbench. This is a **known small consistency cleanup**, not permission to change the 0–10 scoring semantics. A test-only helper branch failed at GitHub workflow parsing before product code ran and was intentionally not merged. Fix these thresholds only through a clean, reviewable code write and verify boundary levels 0/2/3/4/5/6/7/9/10 before merging.
