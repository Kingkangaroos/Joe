# Approved character imports — The Last Horse

**Source:** Joey's project chat “The Last Horse” / “het laatste paard”  
**Rule:** do **not** regenerate or reinterpret these characters. Import the exact approved transparent assets from that chat.

## Budgeting — owl

Park 3.1 must use the existing Daily Mission score (0–10) as its level source. Level 0 uses level-1 artwork technically; level 1–10 use their matching evolution.

Expected paths (WebP preferred, PNG accepted by the runtime bridge):

- `img/lab/park31/budgeting/l01.webp` … `l10.webp`
- or the same basenames as `.png`

Character: **owl**. Background must remain transparent.

## Meditation — panda

Same existing Daily Mission score logic; no separate XP or level engine.

Expected paths:

- `img/lab/park31/meditation/l01.webp` … `l10.webp`
- or the same basenames as `.png`

Character: **panda**. Background must remain transparent.

## Home Daily Score — Joey

The Home headline is the **number of Daily Missions checked today**, not the average of mission levels and not `done / total`.

Character mapping:

- 0 checked → L1 artwork (technical floor)
- 1 checked → L1
- 2 checked → L2
- …
- 10 or more checked → L10

Expected paths:

- `img/lab/daily-score/joey/l01.webp` … `l10.webp`
- or the same basenames as `.png` once PNG fallback is enabled for this surface

Character: Joey's approved transparent self-character from the same project chat. Do not substitute another avatar.

## Runtime behavior while files are unavailable

- Budgeting and Meditation keep their current Park 2 fallback art rather than showing broken images.
- Home Daily Score keeps the existing star badge rather than showing a broken Joey image.
- As soon as exact approved files exist at these paths, the wired runtime automatically prefers them without changing level logic.
