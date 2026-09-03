# Park 3.1 asset contract

Park 3.1 displays the **canonical 11 public Daily Missions** plus **2 separate private dailies**.

The repository currently contains **11 native Park 3.1 evolution sets × 10 levels = 110 WebP assets**. Those 11 native sets are **9 public missions + 2 private dailies**. Do not describe the 110 files as eleven public Daily Mission sets.

## Canonical public Daily Missions

| Live data key | UI name | Current Park 3.1 art source | Status |
| --- | --- | --- | --- |
| `budgeting` | Budgeting | `../park2/budgeting.png` | **Fallback** — native 10-level Park 3.1 set not yet approved |
| `sleep` | Sleep | `sleep/l01.webp` … `l10.webp` | Native 10-level set |
| `nutrition` | Nutrition | `nutrition/l01.webp` … `l10.webp` | Native 10-level set |
| `walking` | Steps | `steps/l01.webp` … `l10.webp` | Native 10-level set |
| `teeth` | Brush Teeth | `teeth/l01.webp` … `l10.webp` | Native 10-level set |
| `household` | Household | `household/l01.webp` … `l10.webp` | Native 10-level set |
| `meditation` | Meditation | `../park2/meditation.png`, `meditation/advanced.png`, `meditation/mastery.png` | **3-stage fallback** — native 10-level Park 3.1 set not yet approved |
| `gratitude` | Gratitude | `gratitude/l01.webp` … `l10.webp` | Native 10-level set |
| `good_deed` | Good Deed | `good-deed/l01.webp` … `l10.webp` | Native 10-level set |
| `screen_time` | Screen Time | `screen-time/l01.webp` … `l10.webp` | Native 10-level set |
| `cold_shower` | Cold Shower | `cold-shower/l01.webp` … `l10.webp` | Native 10-level set |

All native paths above are beneath `img/lab/park31/`. The fallback paths are beneath `img/lab/park2/`.

## Separate private dailies

These retain their approved Park 3.1 companion art, but **do not count toward the public eleven** and remain PIN-backed:

| Live data key | UI name | Native asset directory |
| --- | --- | --- |
| `weed_control` | Gardening | `no-weed/l01.webp` … `l10.webp` |
| `no_porn` | Discipline | `discipline/l01.webp` … `l10.webp` |

## Native Park 3.1 inventory

The 110 committed WebPs are therefore:

- 9 public sets: Steps, Sleep, Nutrition, Brush Teeth, Household, Gratitude, Good Deed, Screen Time, Cold Shower;
- 2 private sets: Gardening, Discipline.

Every native set uses `l01.webp` through `l10.webp`.

## Artwork rules

- Do **not** generate replacement Budgeting or Meditation art automatically. Their native 10-level Park 3.1 sets remain an explicit Creator/approval task.
- Until then, the UI must label the Park 2 images as fallbacks rather than pretending they are ten distinct Park 3.1 evolutions.
- The companion must stay recognizably the same character across a native Level 1–10 progression.
- Technical mission Level 0 may reuse Level-1 artwork, but the displayed live level/progress remains 0 / 0%.
- Cold Shower uses true transparent cutouts without the old amusement-park scenery.
- Good Deed, Steps and Sleep use the cleaned transparent cutouts.
- Brush Teeth was re-cleaned for checkerboard/effect-edge remnants.
- Household Level 1 is intentionally the stronger mess-heavy starter form.

`tests/daily-membership-smoke.js` locks the public/private membership contract. `tests/park31-smoke.js` verifies the native 110-file inventory plus the fallback wiring.