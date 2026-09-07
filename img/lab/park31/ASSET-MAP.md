# Park 3.1 asset contract

Park 3.1 displays the **canonical 11 public Daily Missions** plus **2 separate private dailies**.

The repository contains **13 native Park 3.1 evolution sets × 10 levels = 130 WebP assets**: all **11 public missions + 2 private dailies**.

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
| `cold_shower` | Cold Shower | `cold-shower/l01.webp` … `l10.webp` | Native 10-level set |

All native paths above are beneath `img/lab/park31/`.

## Separate private dailies

These retain their approved Park 3.1 companion art, but **do not count toward the public eleven** and remain PIN-backed:

| Live data key | UI name | Native asset directory |
| --- | --- | --- |
| `weed_control` | Gardening | `no-weed/l01.webp` … `l10.webp` |
| `no_porn` | Discipline | `discipline/l01.webp` … `l10.webp` |

## Native Park 3.1 inventory

The 130 committed WebPs are therefore:

- 11 public sets: Budgeting, Steps, Sleep, Nutrition, Brush Teeth, Household, Meditation, Gratitude, Good Deed, Screen Time, Cold Shower;
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
