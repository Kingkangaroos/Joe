# Daily Mission character and evolution assets

**Owner:** Joey / Gamenfy

**Current status:** complete and live

**Operational source:** `../../../GAMENFY-ASSET-OPERATIONS.json`

**Exact Park contract:** `../park31/ASSET-MAP.md`

## Canonical membership

Daily Mission membership comes from `window.RPG_DEFAULT_SKILLS`, never from a visual concept:

```js
d.isHabit && !d.private && d.active !== false
```

There are 11 public Daily Missions: Budgeting, Sleep, Nutrition, Steps, Brush Teeth, Household, Meditation, Gratitude, Good Deed, Screen Time and Cold Shower.

Two additional personal daily quests use anonymized presentation and stay private/PIN-backed internally: Gardening (`weed_control`) and Discipline (`no_porn`). Joey's personal Home presents all 13 as one roster without exposing the private meaning.

## Current artwork

- `img/lab/park31/` contains 13 approved native sets with `l01.webp` through `l10.webp`: 130 distinct WebPs.
- `img/lab/daily-score/joey/` contains the approved 10-stage Home Daily Score Joey / King evolution.
- `img/lab/park2/` is reference/prototype art, not the live Park 3.1 source.
- Normal skills such as Tennis, Reading, Finger Whistling, Gym, Piano and AI Tools are not Daily Missions merely because reference art exists.

Do not regenerate or reinterpret an approved live set. New visual work needs a named product slot, destination, provenance and pass gate in Gamenfy Asset Operations first.

## Verification

`tests/daily-membership-smoke.js` locks public/private membership. `tests/park31-smoke.js` verifies the 130-file Park inventory. `tests/gamenfy-asset-operations-smoke.js` verifies the complete operations, badge-intake and zero-credit contract.
