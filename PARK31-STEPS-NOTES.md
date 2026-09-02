# Park 3.1 — Steps HQ integration

Built by ChatGPT (OpenAI), 2026-08-31.

## Locked artwork mapping

- Level 1 uses Joey's selected second alternative: the visibly sleepy, yawning Steps character.
- Levels 2–10 use the original approved progression of the same teal Steps character.
- Repository assets are `img/lab/park31/steps/l01.webp` through `l10.webp`.
- All ten files are native 1086×1448 WebP exports rather than enlarged crops from the Park 3.0 atlas.

## Behaviour

- Live level comes from the `walking` score in `rpg_habits_v1` through `window.getHabits()`.
- Levels 1–10 select their corresponding artwork automatically.
- Technical level 0 reuses Level 1 artwork with a visible critical treatment.
- On the standalone companion stage, tapping the large Steps character only toggles the park light/glow.
- Inside the normal Lab roster, tapping a card completes or uncompletes today's corresponding Daily Mission. The existing habit log, XP, level recomputation and cloud-sync scope remain authoritative.
- Gardening and Discipline retain the existing PIN-protected private-mission route.
- `?level=0` through `?level=10` is available as a visual-review override; without it the live score is authoritative.

## Safety

- Park 3.0 files and assets are unchanged.
- Home/Main is unchanged.
- Park 3.1 renders directly inside the normal Lab; it is not hidden behind a separate preview card.
- Park 3.0 remains separately available as the reference version.

## Eleven-companion format

- Park 3.1 reserves roster slots for all eleven current Daily Mission habits.
- Each slot follows one fixed `l01.webp` through `l10.webp` asset contract documented in `img/lab/park31/ASSET-MAP.md`.
- Steps, Sleep, Good Deed, Cold Shower, Screen Time, Gardening and Discipline are live with ten separate level images each.
- Sleep, Good Deed and Cold Shower use the original generated files from Joey's Paarse Paard branch.
- Screen Time, Gardening and Discipline use the corrected individual assets from Joey's Witte Paard branch, including the intentionally extreme Level 1 forms.
- Household, Gratitude, Nutrition and Brush Teeth use the final Gouden Paard files, technically cleaned to true transparency without generating replacement artwork.
- In the embedded Lab, companions use a three-column card grid: recognizably based on Park 3.0, but slightly smaller so all eleven fit without one oversized focus image.
