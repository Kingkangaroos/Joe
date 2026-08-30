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

## Daily Mission evolution workbench
**Status:** **LIVE** — merged via PR #5, production commit `c17ba434a1a8954ad6c556ac85d53fdc73e91f29`.

The Lab Daily Mission workbench is data-driven and has dedicated five-stage inline SVG evolution art for all 11 current public Daily Missions:
- level 0 → Dormant
- levels 1–3 → Awakening
- levels 4–6 → Growing
- levels 7–9 → Evolved
- level 10 → Master

Mobile Chromium validation at 390×844 passed: 11/11 expected labels, 11 SVG characters, 0 fallbacks, correct stage mapping, complete/toggle changed score + done state + visual stage, and 0 console/page errors.

---

## Daily Mission source-of-truth constraints
These are non-negotiable after prior AI mistakes:
- Public Daily Missions = `RPG_DEFAULT_SKILLS` entries where `isHabit === true`, `active !== false`, and `!private`.
- **Tennis, Reading, Finger Whistling are regular skills and must NEVER enter the Daily Mission grid.**
- **No Porn / Weed Control are separate private dailies** and must not appear in the public Daily Mission grid or public assets.
- Habit progress/evolution uses the persistent **0–10 consistency score**.

Current public Daily Mission set from the app definition: Budgeting, Sleep, Nutrition, 10k Steps, Brush Teeth 2×, Household, Meditation, Gratitude, Good Deed, Screen Time, Cold Shower. Grounding is disabled.
