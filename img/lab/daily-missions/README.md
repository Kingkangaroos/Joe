# Daily Mission character/evolution assets

**Owner:** Joey / Gamenfy  
**Maintainer note:** ChatGPT (OpenAI)  
**Branch created for this work:** `chatgpt/daily-mission-assets`  
**Date:** 2026-08-30

## Source of truth

Daily Mission membership must never be guessed from visual concepts or general Skills.

The public Daily Mission UI is generated from `window.RPG_DEFAULT_SKILLS` using:

```js
d.isHabit && !d.private && d.active !== false
```

Current active public Daily Missions in `xp.js`:

1. `budgeting` — Budgeting
2. `sleep` — Sleep
3. `nutrition` — Nutrition
4. `walking` — 10k Steps
5. `teeth` — Brush Teeth 2×
6. `household` — Household
7. `meditation` — Meditation
8. `gratitude` — Gratitude
9. `good_deed` — Good Deed
10. `screen_time` — Screen Time
11. `cold_shower` — Cold Shower

`grounding` is a habit definition but `active:false`, so it must not be rendered.

## Private daily quests

These exist in the Daily flow but are deliberately **not** part of the public habit/evolution grid:

- `no_porn` — No Porn
- `weed_control` — Weed Control

They use the private/PIN daily-quest flow and must not be exposed through a public asset grid by accident.

## Explicit exclusions

The following are examples of normal skills and must **not** appear merely because character art exists for them:

- `tennis` — Tennis
- `reading` — Reading
- `whistling` — Finger Whistling
- `strength` / `gym` — strength training skills
- `piano` — Piano
- `ai_tools` — AI Tools

## Existing repo assets that may be reused

| Mission | Existing asset | Status |
| --- | --- | --- |
| Budgeting | `img/lab/park2/budgeting.png` | usable concept |
| Sleep | `img/lab/park2/sleep.png` | usable concept |
| 10k Steps | `img/lab/park2/walking.png` | usable concept |
| Meditation | `img/lab/park2/meditation.png` | usable concept |
| Good Deed | `img/lab/park2/good-deed.png` | usable concept |
| Nutrition | — | needs dedicated evolution character |
| Brush Teeth 2× | — | needs dedicated evolution character |
| Household | — | needs dedicated evolution character |
| Gratitude | — | needs dedicated evolution character |
| Screen Time | — | needs dedicated evolution character |
| Cold Shower | — | needs dedicated evolution character |

## Generated 2026-08-30 concept batch

ChatGPT generated a larger concept batch before validating the live Daily Mission list. It has been classified rather than discarded.

### Potentially relevant Daily concepts

- Sleep evolution card
- Steps evolution card
- No Porn evolution concept — private; do not place in public repo UI
- No Weed / clarity evolution concept — private; do not place in public repo UI

### Useful but **not Daily Mission** concepts

- Finger Whistling
- Tennis
- Reading
- Strength
- Hydration

These may be reused later for the normal Skills/character system, but they must not be wired into Daily Missions.

### Rejected as data references

The generated Daily Mission dashboard/mockups that showed Tennis, Reading or Finger Whistling as Daily Missions are visual references only and must never be used as membership data.

## Evolution behavior

Daily public habits use the persistent 0–10 score from `rpg_habits_v1`:

- completed day: +1, max 10
- missed day: -1, min 0
- no weekly reset
- level 10: Master

The workbench in `daily-garden.js` reads this real score and renders one square per active public Daily Mission. Missing artwork displays a deliberate placeholder until a mission-specific character is approved.

## Safety rule for future AI work

Before generating or wiring a Daily Mission asset:

1. Read `RPG_DEFAULT_SKILLS` / current app data.
2. Verify `isHabit`, `active`, and `private` state.
3. Never infer membership from previous concept art.
4. Keep private daily assets out of the public grid/repository surface.
5. Build on a branch and visually verify before merge.
