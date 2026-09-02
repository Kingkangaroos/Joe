# BUILDER — Current handoff

Last updated: 2026-09-02
Owner: Joey Siemons  
Primary builder: ChatGPT (OpenAI)

## Working agreement

This repository is the durable source of truth for Gamenfy. This chat is the **Builder**:

- The Builder reads the live repository before making claims or changes.
- The Builder owns implementation, integration, data wiring, tests, rollback and technical documentation.
- When new images, animation or other original visual assets must be created, a separate **Creator** is used. The Builder writes the exact asset brief and integrates the approved output.
- A chat claim is not treated as completed work until the relevant commit/files are verified in GitHub.
- Joey remains the decision-maker for meaningful product and visual choices.

## Hard product boundaries

- New work is built and reviewed inside the **normal app's Lab**.
- **Home / Main stays untouched unless Joey explicitly requests a Home change.**
- Existing experiments are not overwritten to make room for a new version.
- Park 3.0 remains intact as the rollback/reference version.
- Park 3.1 is a separate iteration, not a silent replacement of Park 3.0.
- Mobile verification must include a real iPhone-sized viewport and asset loading; visual work is not considered complete from syntax checks alone.

## Connected project

- GitHub: `Kingkangaroos/Joe`
- Default branch: `main`
- Vercel project: `joe`
- Supabase project: `Kingkangaroos's Project`
- Park implementation files on `main`: `park3.html`, `park3.css`, `park3.js`
- Lab entry point: `lab.html`
- Park 3.1 Lab release branch: `chatgpt/park31-lab-release`

## Park 3.1 — locked user decisions

Park 3.1 started with the **Steps / Walking** companion and now contains all eleven Daily Mission companion sets.

- The companion must remain recognizably the same character across Levels 1–10.
- Joey chose the **second Level-1 alternative**: the sleepy, yawning/gaping version.
- Known original attachment reference for the chosen Level 1:  
  `file_000000005f10821093cbeaefddd5e707` → `walking-l01.png`
- Canonical source filenames: `walking-l01.png` through `walking-l10.png`.
- Intended repository assets:  
  `img/lab/park31/steps/l01.webp` through `img/lab/park31/steps/l10.webp`
- Live `walking` score selects the corresponding Level 1–10 artwork.
- Score 0 remains a real technical level and may reuse Level-1 art with the existing critical treatment, consistent with Park 3.0.
- Tapping/clicking the large standalone Steps companion activates its light/glow interaction.
- The new version belongs in the existing Lab and must coexist with Park 3.0.
- Do not add Park 3.1 to Home.

## Verified status at handoff

Verified against GitHub on 2026-08-31:

- `main` contains Park 3.0 and the current Lab implementation.
- `chatgpt/park31-steps-hq` existed but had **0 unique commits** and was 7 commits behind `main`.
- No `img/lab/park31/steps/l01.webp`–`l10.webp` assets had been committed.
- The earlier statement that ten HQ assets were “prepared” did not become durable repository work.
- Only the exact Level-1 attachment ID above was recoverable from conversation context. The exact attachment IDs for Levels 2–10 were not recoverable.
- Existing Park 3.0 strip assets are upscaled exports from a low-resolution atlas. They are useful as the current Park 3.0 source, but they are not native HQ replacements for Park 3.1.

## Park 3.1 Steps — implemented 2026-08-31

- The ten approved native images were recovered and committed as `img/lab/park31/steps/l01.webp` through `l10.webp`.
- Level 1 is the exact selected second, yawning alternative; Levels 2–10 are the original approved progression.
- `park31.html`, `park31.css` and `park31.js` provide a separate Steps-only Lab test.
- The live `walking` score selects the matching artwork; technical Level 0 reuses Level 1 art with critical styling.
- Tapping only toggles light/glow and never writes mission completion or level data.
- Park 3.1 renders directly inside the normal Lab; Park 3.0 remains separately available and Home remains untouched.
- The Lab reserves a roster for all 11 Daily Mission companions (10 levels each); `img/lab/park31/ASSET-MAP.md` remains the canonical asset contract.

## Park 3.1 full Lab roster — implemented 2026-09-02

- Park 3.1 now has all 11 companion sets and all 110 level assets.
- Household, Gratitude, Nutrition and Brush Teeth use Joey's final Gouden Paard files.
- Their source checkerboard backgrounds were removed technically and exported as transparent WebP files; no replacement artwork was generated.
- The normal `lab.html` embeds the complete Park 3.1 roster directly.
- The Lab roster runs in Daily Mission mode: a short tap opens that companion's read-only evolution sheet, where `− / +` only previews Levels 1–10. Holding a public companion for 560 ms completes or uncompletes today's mission, updates XP and recalculates its live level through the existing habit engine.
- Moving more than 12 px cancels the hold, so normal Lab scrolling cannot accidentally claim a mission.
- Gardening and Discipline keep the established PIN gate and write to the existing private daily-quest store.
- Home/Main is deliberately unchanged in this release. The larger Home and persistence rebuild remains isolated until Joey explicitly approves that separate rollout.
- Park 3.0 remains available as the rollback/reference implementation.

## Park 3.1 artwork cleanup — implemented 2026-09-02

- All ten Cold Shower levels are now true transparent WebP cutouts. The embedded night amusement-park scenery is gone; characters, water effects and purple stone pedestals remain.
- All ten Brush Teeth levels were re-cleaned. Checkerboard fragments and ragged detached effect remnants are removed while the companion progression stays intact.
- Household Level 1 is now intentionally more confronting: the same companion is overwhelmed by trash, laundry, dirty dishes and dust, giving the mission a stronger immediate cleanup trigger.
- Good Deed, Steps and Sleep Levels 1–10 are now true transparent WebP cutouts. Their characters and progression effects remain intact; the fixed navy rectangular backdrops are gone.
- Every changed cutout was reviewed on pink, mint and dark backgrounds. Automated smoke coverage now verifies that the affected WebP files contain real alpha data.
- Asset URLs were bumped to Park 3.1 version 1.10 so the normal Lab cannot keep stale artwork in cache.

## Park 3.1 feedback layer — implemented 2026-09-02

- A mission that has not been completed for three or more days now writes **HELP** across its companion window, matching Joey's earlier motivation concept.
- A real mission completion that raises the live level triggers a short room expansion, light-up and confetti celebration showing the new level.
- Previewing with `− / +` never triggers the celebration and still cannot write mission data.
- The expanded companion now has an explicit `Voltooi vandaag` / `Ongedaan maken` button. The 560 ms card hold remains available as a shortcut, while previews disable the action entirely.
- Reduced-motion users receive the level-up status without movement. Park 3.1 cache URLs are now version 1.12.

## Chess audit — verified 2026-09-02

- The existing Chess skill already contains XP, eleven tiers, gates, assessment, logging and Lab visuals; the dedicated smoke test passes.
- No duplicate Chess implementation was added.

## Health Trail — Lab prototype implemented 2026-09-02

- Joey's earlier D-score replacement idea now exists directly in the normal Lab, not behind a preview link.
- The displayed 0–10 level combines 70% of the average public Daily Mission level with 30% of the available Fitbit recovery score.
- Recovery uses sleep plus HRV and resting-heart-rate movement against Joey's own recent baseline. Missing Fitbit data is omitted instead of being treated as failure.
- The existing Park 3.1 Steps evolution is reused as the runner; the prototype is read-only and cannot modify habits, XP or health data.
- Home/Main remains unchanged pending Joey's later judgment of the Lab prototype.

## Next build sequence

1. Keep reviewing the eleven companions and their HELP/level-up feedback in the normal Lab; correct concrete feedback there.
2. Keep Home untouched until Joey explicitly approves a separate Home rollout.
3. Treat convincing character movement as a separate frame/animation-asset job; do not fake it with a wobbling static image.

## Definition of done for Park 3.1 Steps

- All 110 approved companion assets are present in GitHub at the canonical paths.
- Levels 1–10 render the correct distinct images; Level 0 uses the agreed critical treatment.
- The chosen yawning Level-1 image is visibly the exact selected variant.
- Park 3.0 is still available and unchanged.
- Home is unchanged.
- Short tap opens the selected companion without changing mission data; the explicit live action or deliberate hold changes completion, while `− / +` previews remain read-only.
- A deliberate hold completes/uncompletes through the existing mission controller; scrolling cancels the hold.
- Refresh and live Daily Mission level changes update correctly.
- No black/corrupt assets on iPhone; layout and text remain usable.
- Commit and deployed normal-Lab route are verified before reporting completion.
