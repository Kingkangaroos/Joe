# Claude task — Park 3.0 Retina / iPhone asset pass

Owner of product logic: **ChatGPT (OpenAI)**. This branch is intentionally isolated so Claude can work in parallel without touching live Daily Mission behavior.

## Problem
Park 3.0 now shows the correct companions and live levels, but the character art is visibly **soft / blurry on Joey's iPhone PWA**. The current implementation reconstructs a heavily compressed base64 WebP atlas from `img/lab/park3/atlas/part-*.txt` and uses CSS background-position to crop one of 110 frames. That pipeline is the quality bottleneck.

## Your task
Make the approved Park 3.0 character frames render materially sharper on iPhone / Retina while preserving the exact selected characters and evolution states.

### Hard constraints
- DO NOT redesign/regenerate the companions.
- DO NOT change the level meanings or evolution identities.
- DO NOT change `rpg_habits_v1`, `rpg_habitlog_v1`, `getHabits()`, `getSkillLevel()`, completion logic, decay, or any Today’s Missions behavior.
- DO NOT merge this branch to `main` yourself.
- Keep private mission naming/behavior private (`no_porn` displays as **Discipline** in Park).
- Park 2.0 remains untouched.

### Preferred technical direction
Replace the giant ultra-compressed atlas with a higher-resolution asset pipeline. Best outcome is normal static WebP/PNG assets or per-character sprite strips with enough source pixels for Retina. If repo/tool limitations make that impossible, use a high-quality canvas/crop/render pipeline, but do not hide the problem with blur/filters alone.

The approved source artwork was built as 11 rows x Levels 1–10. Mission order:
1. nutrition
2. teeth
3. household
4. gratitude
5. good_deed
6. screen_time
7. cold_shower
8. weed_control
9. no_porn → UI label `Discipline`
10. sleep
11. walking → UI label `Steps`

### Acceptance criteria
1. In the embedded `Lab → Park 3.0` view on a Retina iPhone, character edges/eyes/details are visibly sharper than current `main`.
2. No black image cards.
3. Live level mapping remains correct: habit score 0–10; score 0 shows Level-1 emergency/start artwork while the numeric badge stays L0; score 10 shows Level-10 Master artwork.
4. Private `weed_control`/`no_porn` do not mutate habit data from Park.
5. Modal preview `−/+` remains preview-only.
6. No visual regressions to Park 2.0 or Main.
7. Add a short note here or in the PR describing the asset dimensions/compression choice and why it is Retina-safe.

## Files most likely involved
- `park3.js`
- `park3.css`
- `park3.html`
- `img/lab/park3/**`

## Current implementation note
`main` is at the v12.4 iOS-safe WebP + live-level bridge. Preserve those fixes. The goal of this branch is **only to beat the current image sharpness**.
