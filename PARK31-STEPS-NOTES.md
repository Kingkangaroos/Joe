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
- Inside the normal Lab roster, tapping a card opens its evolution sheet. The `− / +` controls are preview-only and never write mission or level data.
- Holding a card for 560 ms completes or uncompletes today's corresponding Daily Mission. Moving to scroll cancels the hold. The existing habit log, XP, level recomputation and cloud-sync scope remain authoritative.
- If a mission has no completion in the last three days, its artwork window visibly says `HELP`. Completing it removes the warning.
- When completion produces a real live-level increase, the card briefly expands and lights up while a level/confetti overlay confirms the new level. Read-only previews never trigger it.
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
- Sleep and Good Deed keep the original generated artwork from Joey's Paarse Paard branch. Their embedded navy backdrops were technically removed on 2026-09-02, preserving the clouds, beds, stone platforms, hearts and gold effects as transparent cutouts.
- Cold Shower keeps the approved Paarse Paard progression, but its ten amusement-park backgrounds were replaced and technically keyed to true transparency on 2026-09-02. The result is reviewed on pink, mint and dark backgrounds.
- Screen Time, Gardening and Discipline use the corrected individual assets from Joey's Witte Paard branch, including the intentionally extreme Level 1 forms.
- Gratitude and Nutrition use the final Gouden Paard files, technically cleaned to true transparency without generating replacement artwork.
- Brush Teeth was re-cleaned on 2026-09-02: the central characters stay intact while checkerboard fragments and ragged detached effect remnants are removed from all ten levels.
- Household Levels 2–10 keep their cleaned Gouden Paard artwork. Level 1 is intentionally replaced by a more confronting, overwhelmed starter form with trash, laundry, dishes and dust to make the cleanup mission motivating immediately.
- Steps Levels 1–10 were technically extracted from their navy rectangles on 2026-09-02. The exact approved companions and running trails remain; only the fixed rectangular scenery is transparent.
- In the embedded Lab, companions use a three-column card grid: recognizably based on Park 3.0, but slightly smaller so all eleven fit without one oversized focus image.
