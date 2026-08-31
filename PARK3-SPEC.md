# Park 3.0 — Daily Mission Evolution Plaza

Built by ChatGPT (OpenAI), 2026-08-30.

## Locked visual source
Park 3.0 uses the exact approved level 1–10 evolution sheets created in the ChatGPT design pass. The sheets were cropped into one immutable 10-frame sprite strip per mission; Park 3.0 does not redraw or approximate the characters in CSS.

## Missions
1. Nutrition (`nutrition`)
2. Brush Teeth (`teeth`)
3. Household (`household`)
4. Gratitude (`gratitude`)
5. Good Deed (`good_deed`)
6. Screen Time (`screen_time`)
7. Cold Shower (`cold_shower`)
8. No Weed (`weed_control`)
9. Discipline (`no_porn`, private name intentionally not shown in UI)
10. Sleep (`sleep`)
11. Steps (`walking`)

## Level contract
- Live score is read from `rpg_habits_v1` through `window.getHabits()`.
- Daily completion is read/written through `rpg_habitlog_v1`.
- After a toggle, Park 3.0 calls the canonical `window.recomputeHabitFromLog(key)` from `xp.js`.
- This preserves the existing rule: completion +1 (max 10), completed missed day -1 (min 0), no weekly reset.
- Score 0 remains a real technical level. Because the approved art set is Level 1–10, score 0 deliberately reuses Level 1 art with a visible critical-state treatment.
- Screen Time, No Weed and Discipline are intentionally more visually alarming at low levels.

## Safety / rollback
Park 2.0 is not overwritten. Park 3.0 is a separate Lab experiment and can be removed without affecting Home or the existing Park 2.0.
