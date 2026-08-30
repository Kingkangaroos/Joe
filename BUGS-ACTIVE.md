# Gamenfy — Active Bugs / Verification Needed

> Shared handoff for Claude + ChatGPT. A fix is not considered done until the real user flow has been verified on Joey's device.

## Daily Missions — intermittent state rollback
**Reported:** 30 Aug 2026
**Status:** test fix exists, real-device verification still required.

Observed non-deterministic flow:
1. Home → select Saturday / a previous day.
2. Check a mission such as **10k Steps**.
3. Navigate to Skills.
4. Return to Home.
5. Sometimes the mission appears unchecked again; on another retry it remained correctly checked.

This pattern points to a sync/navigation race rather than the mission toggle itself. Current hypothesis: a stale Supabase/realtime `app_state:rpg` payload can arrive after a newer local `rpg_habitlog_v1` write and overwrite the newer state.

**Current ChatGPT test branch:** `chatgpt/daily-mission-assets`
- `sync.js` adds a persistent dirty journal.
- Local synced-key changes remain protected as newer until a Supabase write is actually confirmed.
- Old realtime/cloud payloads may not overwrite a newer dirty local value.
- Dirty state survives navigation and retries.

Do **not** call this solved until Joey repeats the real iOS/PWA flow successfully several times.

---

## iOS/PWA bottom navigation drifts into content while scrolling
**Reported:** 30 Aug 2026
**Status:** test hardening exists, screenshot / real-device verification useful.

Joey reports that the bottom navigation (Main / Body / Skills / Finance / Jarvis) can visually travel upward while scrolling and end up in the middle of the content instead of remaining pinned to the bottom viewport edge.

The same test branch contains an iOS shell guard with stronger fixed-position / transform / safe-area rules. Verify on the installed iPhone PWA before merge.

---

## Daily Mission source-of-truth constraints
These are non-negotiable after prior AI mistakes:
- Public Daily Missions = `RPG_DEFAULT_SKILLS` entries where `isHabit === true`, `active !== false`, and `!private`.
- **Tennis, Reading, Finger Whistling are regular skills and must NEVER enter the Daily Mission grid.**
- **No Porn / Weed Control are separate private dailies** and must not appear in the public Daily Mission grid or public assets.
- Habit progress/evolution uses the persistent **0–10 consistency score**.

Current public Daily Mission set from the app definition: Budgeting, Sleep, Nutrition, 10k Steps, Brush Teeth 2×, Household, Meditation, Gratitude, Good Deed, Screen Time, Cold Shower. Grounding is disabled.
