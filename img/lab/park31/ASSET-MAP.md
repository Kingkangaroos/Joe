# Park 3.1 asset contract

Park 3.1 displays the **canonical 11 public Daily Missions** plus **2 separate private dailies**.

The repository contains **14 native Park 3.1 evolution sets × 10 levels = 140 WebP assets**: **11 current public missions + 2 private dailies + one archived Cold Shower set**.

## Canonical public Daily Missions

| Live data key | UI name | Current Park 3.1 art source | Status |
| --- | --- | --- | --- |
| `budgeting` | Budgeting | `budgeting/l01.webp` … `l10.webp` | Native 10-level owl set |
| `sleep` | Sleep | `sleep/l01.webp` … `l10.webp` | Native 10-level set |
| `nutrition` | Nutrition | `nutrition/l01.webp` … `l10.webp` | Native 10-level set |
| `walking` | Steps | `steps/l01.webp` … `l10.webp` | Native 10-level set |
| `teeth` | Brush Teeth | `teeth/l01.webp` … `l10.webp` | Native 10-level set |
| `household` | Household | `household/l01.webp` … `l10.webp` | Native 10-level set |
| `meditation` | Meditation | `meditation/l01.webp` … `l10.webp` | Native 10-level panda set |
| `gratitude` | Gratitude | `gratitude/l01.webp` … `l10.webp` | Native 10-level set |
| `good_deed` | Good Deed | `good-deed/l01.webp` … `l10.webp` | Native 10-level set |
| `screen_time` | Screen Time | `screen-time/l01.webp` … `l10.webp` | Native 10-level set |
| `workout` | Workout + Mobility | `workout/l01.webp` … `l10.webp` | Transparent 10-level strength progression |

All native paths above are beneath `img/lab/park31/`.

## Separate private dailies

These retain their approved Park 3.1 companion art, but **do not count toward the public eleven** and remain PIN-backed:

| Live data key | UI name | Native asset directory |
| --- | --- | --- |
| `weed_control` | Gardening | `no-weed/l01.webp` … `l10.webp` |
| `no_porn` | Discipline | `discipline/l01.webp` … `l10.webp` |

## Native Park 3.1 inventory

The 140 committed WebPs are therefore:

- 11 active public sets: Budgeting, Steps, Sleep, Nutrition, Brush Teeth, Household, Meditation, Gratitude, Good Deed, Screen Time, Workout + Mobility;
- one retired visual set: Cold Shower (assets retained for rollback);
- 2 private sets: Gardening, Discipline.

Every native set uses `l01.webp` through `l10.webp`.

## Artwork rules

- Do **not** generate or reinterpret the approved Budgeting, Meditation, or Daily Score artwork.
- The companion must stay recognizably the same character across a native Level 1–10 progression.
- Technical mission Level 0 may reuse Level-1 artwork, but the displayed live level/progress remains 0 / 0%.
- Cold Shower uses true transparent cutouts without the old amusement-park scenery.
- Good Deed, Steps and Sleep use the cleaned transparent cutouts.
- Brush Teeth was re-cleaned for checkerboard/effect-edge remnants.
- Household Level 1 is intentionally the stronger mess-heavy starter form.

`tests/daily-membership-smoke.js` locks the public/private membership contract. `tests/park31-smoke.js` verifies the native 130-file inventory and direct level wiring.

## Workout + Mobility (2026-10-11)

Approved 10-step shirtless black/gold G-headband mascot, lazy Level 1 to crowned muscular Level 10. Source: user's transparent ChatGPT images, optimized to alpha-preserving WebP for Daily Mission cards. This changes artwork only; completion and 0–10 scoring still use the existing canonical `workout` habit and `rpg_habitlog_v1` replay. Level 0 reuses Level 1 art, score 1 uses Level 2, score 10 caps at Level 10.
