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
- Tapping the character only toggles the park light/glow. It does not complete a mission, change a level or start movement.
- `?level=0` through `?level=10` is available as a visual-review override; without it the live score is authoritative.

## Safety

- Park 3.0 files and assets are unchanged.
- Home/Main is unchanged.
- Park 3.1 renders directly inside the normal Lab; it is not hidden behind a separate preview card.
- Park 3.0 remains separately available as the reference version.

## Eleven-companion format

- Park 3.1 reserves roster slots for all eleven current Daily Mission habits.
- Each slot follows one fixed `l01.webp` through `l10.webp` asset contract documented in `img/lab/park31/ASSET-MAP.md`.
- Steps, Sleep, Good Deed and Cold Shower are live with ten separate level images each.
- The three new sets use the original generated files from Joey's Paarse Paard branch; the remaining seven slots stay labelled `artwork onderweg` until their artwork is supplied.
- In the embedded Lab, companions use a three-column card grid: recognizably based on Park 3.0, but slightly smaller so all eleven fit without one oversized focus image.
