# BUILDER — Current handoff

Last updated: 2026-08-31  
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
- Park 3.1 working branch: `chatgpt/park31-steps-hq`

## Park 3.1 — locked user decisions

Park 3.1 starts with the **Steps / Walking** companion only.

- The companion must remain recognizably the same character across Levels 1–10.
- Joey chose the **second Level-1 alternative**: the sleepy, yawning/gaping version.
- Known original attachment reference for the chosen Level 1:  
  `file_000000005f10821093cbeaefddd5e707` → `walking-l01.png`
- Canonical source filenames: `walking-l01.png` through `walking-l10.png`.
- Intended repository assets:  
  `img/lab/park31/steps/l01.webp` through `img/lab/park31/steps/l10.webp`
- Live `walking` score selects the corresponding Level 1–10 artwork.
- Score 0 remains a real technical level and may reuse Level-1 art with the existing critical treatment, consistent with Park 3.0.
- Tapping/clicking the Steps companion activates its light/glow interaction.
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

## Next build sequence

1. Creator supplies or re-exports the ten approved native Steps images, preserving the locked Level-1 choice and Level 1–10 identity.
2. Builder validates dimensions, transparency, color consistency, file integrity and iPhone-safe WebP decoding.
3. Builder commits the assets to `img/lab/park31/steps/l01.webp`–`l10.webp` on `chatgpt/park31-steps-hq`.
4. Builder integrates Park 3.1 into `lab.html` as a separate reviewable experiment while leaving Park 3.0 and Home unchanged.
5. Builder connects the live `walking` level and the glow/light interaction.
6. Builder runs behavior checks for Levels 0–10, private/normal state interactions, refresh persistence and mobile layout.
7. Builder verifies the Vercel preview on iPhone dimensions before proposing any merge.

## Definition of done for Park 3.1 Steps

- Ten approved HQ assets are present in GitHub at the canonical paths.
- Levels 1–10 render the correct distinct images; Level 0 uses the agreed critical treatment.
- The chosen yawning Level-1 image is visibly the exact selected variant.
- Park 3.0 is still available and unchanged.
- Home is unchanged.
- Tap/click glow works.
- Refresh and live Daily Mission level changes update correctly.
- No black/corrupt assets on iPhone; layout and text remain usable.
- Commit, branch and preview URL are verified before reporting completion.
