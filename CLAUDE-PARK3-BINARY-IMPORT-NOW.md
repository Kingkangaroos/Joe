# Claude — Park 3.0 binary import only

ChatGPT owns the Park 3.0 implementation/review. Your task is ONLY to finish the mechanical asset import so ChatGPT can review and merge.

## Branch
Work ONLY on: `chatgpt/park3-exact-assets-worker`

## Goal
Get the exact approved Park 3.0 per-level artwork into the repo as 110 individual WebP files under:

`img/lab/park3/levels/<mission>/l01.webp` … `l10.webp`

Missions (11):
- nutrition
- teeth
- household
- gratitude
- good_deed
- screen_time
- cold_shower
- weed_control
- no_porn
- sleep
- walking

## Important current state
ChatGPT already prepared the worker workflow on this branch. It expects a q45 package split into 21 chunks named:

`.park3-packs/q45-000.b64` … `.park3-packs/q45-020.b64`

and then a marker:

`.park3-packs/READY-Q45`

The workflow validates SHA-256, extracts exactly 110 WebPs, checks 10 levels for every mission, deletes temp packs + its own workflow, and commits the real assets.

Some early q45 chunks are already present. Do not change their contents unless you are replacing the entire q45 package coherently.

## Preferred method
If you have the original local asset bundle / ChatGPT-provided Park3 exact asset zip in your working environment, skip the base64 chunk ceremony entirely if easier: place the 110 WebPs directly in the exact folders above, validate 110/110, and commit them on this branch.

If you do NOT have the binary source files locally, ask Joey for the exact asset ZIP rather than regenerating anything.

## Hard boundaries
- DO NOT redesign, regenerate, crop differently, sharpen with AI, recolor, or reinterpret artwork.
- DO NOT touch Daily Mission logic.
- DO NOT modify `rpg_habits_v1`, `rpg_habitlog_v1`, `getHabits()`, `getSkillLevel()`, `recomputeHabitFromLog()`, Supabase sync, Main, or Park 2.0.
- DO NOT merge to `main`.
- DO NOT replace ChatGPT's Park 3.0 v14 implementation logic.

## Validation before stopping
Run/confirm:
- exactly 110 `.webp` files under `img/lab/park3/levels`
- exactly 10 for every mission
- each `l01.webp` through `l10.webp` is non-empty
- no accidental unrelated changes

Then commit to `chatgpt/park3-exact-assets-worker` and tell Joey/ChatGPT the commit SHA. ChatGPT will review, connect it to the v14 code branch, merge, and production-check.
