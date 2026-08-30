# Gamenfy v11 — Daily Mission Windows

**Decision owner:** Joey  
**Recorded / implementation by:** ChatGPT (OpenAI)  
**Status:** Lab experiment only — do not replace Home until Joey approves the concept.

## Core concept

Replace the old Daily Mission Garden presentation with a wall / cluster of small square **Daily Mission Windows**. Every public Daily Mission owns a tiny room and a character. The room itself communicates whether Joey has done the mission today.

- Compact square rooms/windows, visually related as one building/system.
- Uncompleted today: room is dark, character is low-energy / sleepy / subdued.
- Completed today: the light turns on and the character becomes lively/animated.
- Tap a room: it expands into a focused room/detail state.
- Completion happens through an explicit button in the expanded state, not by accidentally tapping the room.
- Completion gives a small celebratory confetti moment.
- The room collapses back with its light remaining on.
- Completed missions can be reopened and undone.
- A mission ignored for multiple days may visibly ask for attention — current prototype writes **HELP** on/in the window after 3 consecutive missed days.

## Data rules — non-negotiable

This experiment must not invent a parallel Daily Mission state.

Public Daily Missions come from `RPG_DEFAULT_SKILLS` where:
- `isHabit === true`
- `active !== false`
- `!private`

Per-day completion source of truth: `rpg_habitlog_v1`.

Current public set:
1. Budgeting
2. Sleep
3. Nutrition
4. 10k Steps / Walking
5. Brush Teeth 2×
6. Household
7. Meditation
8. Gratitude
9. Good Deed
10. Screen Time
11. Cold Shower

Never put Tennis, Reading or Finger Whistling into the public Daily Mission grid. No Porn and Weed Control stay separate private quests.

## Persistent 0–10 evolution

The score never resets at the start of a week.

- completed day → +1, maximum 10
- missed day → -1, minimum 0
- level 10 remains 10 while the mission keeps being completed
- after a miss at 10 it becomes 9; completing again is required to return to 10

Visible evolution bands:
- **0–2 — Starter**
- **3–4 — Apprentice**
- **5–6 — Advanced**
- **7–9 — Expert**
- **10 — Master**

Master is level 10 only. Level 9 must never visually read as Master.

The character does not need eleven totally separate identities. Use approximately five genuine visual forms; intermediate numeric levels can communicate progress through energy, movement, lighting, effects and room details.

## Character art direction

Canonical family: **Park 2.0 Option D — evolvable game companions**.

- premium toy-like / animated-film 3D finish
- transparent background
- expressive shared eye language
- playful, expressive, not babyish
- actual separate arms/legs and animation-friendly silhouette
- mission should read from the body/silhouette itself, not only a floating icon or costume
- restrained gold details tie the family together
- preserve each character's identity across all forms
- no baked-in background, UI, text or logo

Existing real Park-D Daily companions should be reused exactly where available. Missing companions stay explicitly pending rather than being replaced by a mismatched generic vector family.

## Cold Shower — locked character brief

Cold Shower must read as cold water before any accessory is noticed.

**Core silhouette:** a translucent water-droplet / ice-water companion with a shower-head or water-flow crest integrated into its silhouette.

**Identity cues:** clear blue/cyan materials, small ice facets, visible water-stream motif, a restrained gold valve/ring accent and an energetic posture. Do not turn it into a generic snowman or ice cube.

Evolution:
- **Starter (0–2):** small hesitant droplet; visibly unsure of the cold.
- **Apprentice (3–4):** sharper cold-water facets and more confidence.
- **Advanced (5–6):** stronger flowing-water / ice hybrid body.
- **Expert (7–9):** energetic and resilient; controlled water and ice detailing.
- **Master (10):** crystalline cold-water guardian with a powerful integrated shower-flow crest, premium transparent material and refined gold valve accent.

Room behavior in the Windows concept:
- off: colder/darker blue room, subdued droplet, sparse/slower falling water
- on: cyan light and stronger moving water streams; character visibly energised
- Master: crystalline/gold light accent without making the whole room gold

## Current v11 prototype

Implementation lives on `chatgpt/daily-mission-windows-v11`:
- `daily-windows.html`
- `daily-windows.css`
- `daily-windows.js`

Prototype already includes:
- all public Daily Missions generated from the canonical skill definitions
- compact room grid
- light-on / light-off completion state
- expanded focused room
- explicit complete / undo
- confetti
- five visual evolution bands with Master only at 10
- preview button to inspect levels 0, 3, 5, 7 and 10 without changing saved data
- HELP state after multiple missed days
- special Cold Shower water-flow room treatment
- real existing Park-D assets where available and explicit pending treatment where art is missing

## Next visual pass after Joey reviews the prototype

1. Decide whether the overall room/window language feels right before moving anything to Home.
2. Lock the six missing base Park-D companions, starting with the art queue already documented in `img/lab/park2/DAILY-MISSION-ART-QUEUE.md`.
3. Make each room more behavior-specific (e.g. Sleep settles into bed, Household visibly tidies, Screen Time dims/locks, Cold Shower braces then energises).
4. Add room-to-room ambient interaction only if it improves the life-RPG feeling without making the grid visually noisy.
5. Only after approval, decide how much of Daily Mission Windows belongs on Home versus Character/Lab.
