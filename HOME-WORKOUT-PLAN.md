# Workout + Mobility: short home routine

Implemented by ChatGPT (OpenAI), 2026-10-14, at Joey's request.

Entry: Home > Daily Missions > Workout + Mobility (including the Home park card).

- One existing public habit, `workout`; no additional mission or XP source.
- Monday/Wednesday/Friday suggest strength plus short mobility. Other dates suggest mobility, using the viewed local date. Users can change session type around tennis or recovery.
- Defaults to a mat-only, one-set routine. The longer mode gradually adds sets over explicitly selected training weeks 1-4. Habit score never changes the prescription.
- Optional one-dumbbell mode replaces light W-raises with actual rows. The short dumbbell routine allows 12-15 minutes because both arms need training. All strength sessions have a 20-minute ceiling, including warm-up, rest and mobility.
- Controls are presentation choices for the open sheet and reset on reopening. No workout logs, account settings, health metrics or new storage keys are written.
- Existing mission completion, undo, historical date handling, reset and evolution remain the authorities. Opening the routine or changing a selector never completes a habit.
- No images were generated; the approved workout art remains in the existing sheet.

## Validation

122 local smoke tests run: 119 pass. The new workout test and existing daily-membership test pass.
Three failures were reproduced on the unmodified parent commit d56bab309c67833bd94a3056a39401ea724ed741:

- `park31-smoke.js`: outdated artwork cache-version expectation (1.19 vs current 1.20).
- `spar-product-pass-smoke.js`: outdated Park script-version expectation.
- `why-chain-smoke.js`: expects the previous `lifeWhyCard` Home markup.

These unrelated assertions were left unchanged. No new smoke failure was introduced.
`git diff --check` passes. Browser QA was attempted, but no browser executable was installed and the browser download failed. Actual responsive appearance and iPhone behavior therefore remain unverified.

## Training basis

- ACSM 2026 resistance training guidelines: https://acsm.org/resistance-training-guidelines-update-2026/
- Mayo Clinic exercise and meals: https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/exercise/art-20045506
- Mayo Clinic stretching guidance: https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/stretching/art-20047931

This is a beginner template, not an individualized assessment. Mat-only pulling remains a limitation. A small pre-workout snack is practical when food intake has been low; it does not rule out other causes of dizziness. Extreme flexibility is not promised.
