# Park 3.0 — exact per-level assets

Owner: Joey. Implementation lead: ChatGPT (OpenAI). Binary export may be performed by Claude, but the source and mapping below are locked.

## Why this replaces PR #11's image source

PR #11 improved loading architecture, but its 11 strips were re-exported from the **old 550×1063 atlas** (55×96 px per frame). That source is inherently soft. Joey has now supplied the actual approved evolution overview images again. These overview plates are the new visual source of truth.

Do **not** upscale/re-export from `img/lab/park3/strips/` or the old atlas. Crop from the approved overview plates themselves.

## Final repository shape

Create **110 independent WebP files**:

`img/lab/park3/levels/<mission>/l01.webp` … `l10.webp`

Missions:

- `nutrition`
- `teeth`
- `household`
- `gratitude`
- `good_deed`
- `screen_time`
- `cold_shower`
- `weed_control`
- `no_porn` (UI label remains **Discipline**)
- `sleep`
- `walking` (UI label remains **Steps**)

The app mapping must be deliberately boring:

`assetUrl(mission, level) => img/lab/park3/levels/${mission}/l${String(level).padStart(2,'0')}.webp`

Level 0 remains numeric level 0 but visually uses `l01.webp`. Levels 1–10 use their exact matching file.

## Approved overview sources and crop geometry

ChatGPT already generated all 110 crops locally from these exact boxes and visually spot-checked L1/L6/L10 for every mission. Crop only the character/art area; exclude the old LEVEL plaque.

### Sleep + Steps — approved overview `IMG_1203`
Source size: 1536×707.
Level centers X: `310,404,506,614,721,836,943,1046,1161,1296`.
Use midpoint boundaries between centers, inset 2 px from each side.
- `sleep`: Y `168..319`
- `walking`: Y `382..545`

### Screen Time + No Weed + Discipline — approved overview `IMG_1204`
Source size: 1536×707.
Level centers X: `359,455,546,634,721,811,900,986,1070,1163`.
Use midpoint boundaries, inset 2 px.
- `screen_time`: Y `137..263`
- `weed_control`: Y `323..445`
- `no_porn`: Y `504..632`

### Household + Gratitude — approved overview `IMG_1206`
Source size: 1536×707.
Level centers X: `210,323,442,563,682,803,922,1045,1168,1302`.
Use midpoint boundaries, inset 2 px.
- `household`: Y `171..339`
- `gratitude`: Y `445..603`

### Nutrition + Brush Teeth — approved overview `IMG_1207`
Source size: 1536×707.
Level centers X: `211,325,448,567,688,816,943,1064,1188,1311`.
Use midpoint boundaries, inset 2 px.
- `nutrition`: Y `181..349`
- `teeth`: Y `442..593`

### Good Deed + Cold Shower — approved overview `gamenfy_carnival_evolution_chart.png`
Source size: 1672×941.
Level centers X: `98,260,423,586,748,910,1072,1234,1396,1558`.
Use midpoint boundaries, inset 2 px.
- `good_deed`: Y `255..459`
- `cold_shower`: Y `602..834`

## Export settings

- Preserve the exact approved pixels/design. **No regeneration.**
- Crop from the overview source, not the old atlas.
- WebP quality around 92–95 is fine.
- A high-quality Lanczos 4× delivery resize is acceptable for Retina presentation; it does not change the design. Keep the untouched source crop as a master if convenient.
- Do not bake level text into the crop.
- Do not include neighboring characters/divider lines.

## Code constraints

Do not touch Daily Mission semantics or storage:
- `rpg_habits_v1`
- `rpg_habitlog_v1`
- `getHabits()`
- `getSkillLevel()`
- `recomputeHabitFromLog()`
- decay/check/uncheck logic
- Supabase sync

Park 2.0 and Main stay untouched.

Replace only Park 3.0's strip/background-position image mechanism with a normal individual-image URL. The modal preview `−/+` stays preview-only.

## Validation before merge

1. Exactly 110 files exist (11×10).
2. Every mission has L01 through L10, no gaps.
3. Park reads the existing live current level.
4. Level 0 shows L01 art but L0 badge.
5. L10 shows the Master image.
6. No CSS background-position sprite/strip math is required anymore.
7. Check on iPhone in the embedded Lab view.
