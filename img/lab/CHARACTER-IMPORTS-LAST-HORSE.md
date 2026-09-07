# Approved character imports — The Last Horse

**Source:** Joey's project chat “The Last Horse” / “het laatste paard”  
**Rule:** do **not** regenerate or reinterpret these characters. Import the exact approved transparent assets from that chat.

## Budgeting — owl

Park 3.1 must use the existing Daily Mission score (0–10) as its level source. Level 0 uses level-1 artwork technically; level 1–10 use their matching evolution.

Integrated paths:

- `img/lab/park31/budgeting/l01.webp` … `l10.webp`

Character: **owl**. Background must remain transparent.

## Meditation — panda

Same existing Daily Mission score logic; no separate XP or level engine.

Integrated paths:

- `img/lab/park31/meditation/l01.webp` … `l10.webp`

Character: **panda**. Background must remain transparent.

## Home Daily Score — Joey

The Home headline is the **number of Daily Missions checked today**, not the average of mission levels and not `done / total`.

Character mapping:

- 0 checked → L1 artwork (technical floor)
- 1 checked → L1
- 2 checked → L2
- …
- 10 or more checked → L10

Integrated paths:

- `img/lab/daily-score/joey/l01.webp` … `l10.webp`

Character: Joey's approved transparent self-character from the same project chat. Do not substitute another avatar.

## Runtime behavior

- Budgeting and Meditation read the existing Daily Mission level directly and show the matching approved image.
- Home Daily Score reads today's checked mission count and shows the matching approved Joey image.
- Level 0 keeps the technical Level-1 artwork floor without changing the displayed live score.
- The Home star badge remains only as a safe image-load fallback.
