# Gamenfy v11 — Daily Mission Windows

**Decision owner:** Joey  
**Recorded / implementation by:** ChatGPT (OpenAI)  
**Status:** Lab experiment only — do not replace Home until Joey approves the concept.

## 2026-08-30 art lock

The character-family exploration has now produced an **approved Level 6 baseline**. Before generating, editing or wiring any Daily Mission companion, read:

`img/lab/daily-missions/APPROVED-LEVEL6-BASE.md`

That file supersedes earlier generic SVG placeholders and older unapproved missing-character briefs. Approved reference generation: `659d026b-2969-430d-a2da-2f7f99f8e297`.

The intended visible evolution milestone artwork is now explicitly:

- **Level 2** — early / weak form
- **Level 4** — developing form
- **Level 6** — **approved identity baseline**
- **Level 8** — expert form
- **Level 10** — Master, deliberately over-the-top final form

The underlying score remains 0–10; intermediate levels can use the nearest milestone identity plus behavior/energy/lighting/detail changes.

## Core concept

Replace the old Daily Mission Garden presentation with a wall / cluster of small square **Daily Mission Windows**. Every Daily Mission shown in this experience owns a tiny room and a character. The room itself communicates whether the mission was done today.

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

This experiment must not invent a parallel Daily Mission completion state.

Per-day completion source of truth: `rpg_habitlog_v1`.

Persistent score source: `rpg_habits_v1`.

The approved group image is an **art-direction lineup**. It does not itself authorize changes to public/private membership or Home wiring. Any difference between the art review lineup and current skill/private flags must be resolved explicitly in implementation rather than inferred from the picture.

In particular, private discipline / No Porn art must not expose the explicit private wording in public-facing art. Neutral presentation language such as `Discipline` is permitted where a visible label is needed.

Never add unrelated normal skills such as Tennis, Reading or Finger Whistling merely because character art exists for them.

## Persistent 0–10 evolution

The score never resets at the start of a week.

- completed day → +1, maximum 10
- missed day → -1, minimum 0
- level 10 remains 10 while the mission keeps being completed
- after a miss at 10 it becomes 9; completing again is required to return to 10

The character does not need eleven totally separate identities. Use the five approved milestone forms at 2 / 4 / 6 / 8 / 10. Intermediate numeric levels communicate progress through energy, movement, lighting, effects, props and room details.

Master is level 10 only. Level 8 or 9 must never visually read as Master.

## Character art direction

Canonical family: **the approved 2026-08-30 Park-D / Daily Mission companion family** documented in `img/lab/daily-missions/APPROVED-LEVEL6-BASE.md`.

Core family rules:

- premium toy-like / animated-film 3D finish
- expressive shared eye language
- compact, animation-friendly silhouettes
- one coherent universe despite very different mission-body concepts
- mission should read from body/silhouette, with props as support
- dark navy / purple night presentation is the preferred comparison environment
- preserve each character's identity across all forms
- no accidental style reset when only one character needs revision

Approved human exceptions at Level 6: Household, private Discipline, Sleep. Steps must remain an alternate-species sporty creature rather than becoming a normal human.

## Cold Shower — approved direction

Cold Shower is now locked at Level 6 as a crystalline blue cold-water / ice elemental: translucent blue body, strong crystalline facets/spikes, droplets and an energetic expression.

Evolution direction:

- **Level 2:** small hesitant cold-water/ice being
- **Level 4:** clearer facets, more confidence
- **Level 6:** approved crystalline baseline
- **Level 8:** powerful resilient ice/water guardian
- **Level 10:** extravagant crystalline Master form with exceptional silhouette/effects

Room behavior in the Windows concept:

- off: colder/darker blue room, subdued elemental, sparse/slower water
- on: cyan light and stronger water/ice motion; character visibly energised
- Master: rare crystalline/gold accent without making the whole room gold

## Current v11 prototype

Implementation lives on `chatgpt/daily-mission-windows-v11`:

- `daily-windows.html`
- `daily-windows.css`
- `daily-windows.js`
- `daily-windows-option-d.js`

Prototype already includes:

- compact room grid
- light-on / light-off completion state
- expanded focused room
- explicit complete / undo
- confetti
- persistent 0–10 score reading
- HELP state after multiple missed days
- special Cold Shower room treatment
- existing art / temporary bridge assets where available

Important: temporary SVG bridge assets are scaffolding and are **not** the new source of truth. The approved Level 6 lineup is.

## Next production phase

1. Extract/recreate each approved Level 6 character as an isolated reusable asset without changing its identity.
2. Review isolated Level 6 assets for consistency with the approved group image.
3. Build Level 2 and Level 4 backward from the approved Level 6 form.
4. Build Level 8 and Level 10 forward from the approved Level 6 form.
5. Add mission-specific room behavior and animation.
6. Only after Joey approves the Windows experience, decide what belongs on Home.
