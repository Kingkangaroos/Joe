# Gamenfy feedback — 2026-09-13

Captured by ChatGPT (OpenAI) from Joey's first multi-day usage feedback round.

## P0 — Fitbit / Google Health sync is recurring
- Symptom: health data stops updating after working for several days.
- Backend diagnosis on 2026-09-13: `integration_tokens.google_health` has `needs_reauth=true` and `last_error={"error":"invalid_grant","error_description":"Bad Request"}`; last successful sync is 2026-09-09.
- Existing `FITBIT-SETUP.md` still instructs OAuth Publishing status = **Testing**.
- Google Health docs state Testing-mode refresh tokens expire after 7 days. This matches the recurring failure pattern.
- Permanent direction: move OAuth consent app to **In Production**, re-authorize once, then keep explicit stale-sync + reauth UI in Gamenfy so silent failure is impossible.

## P1 — Privacy / mission visibility
- Remove `Gardening` / `weed_control` from the normal visible Park roster.
- Do NOT delete historical data or the internal key. Keep it internal / settings-only if needed.
- `Discipline` can remain visible; it is generic enough.

## P1 — Daily Mission level-0 reward
- Current Park 3.1 behavior maps habit score 0 and 1 to the same `l01.webp` artwork, so completing a mission at level 0 can show no character evolution.
- Desired behavior: first completion must visibly change the companion immediately.
- Preferred long-term implementation: add a distinct dormant / level-0 visual (`l00`) and map score 0 -> L0 art, score 1 -> L1, … score 10 -> L10. Do not make Joey wait two successful days for visible progress.
- Until L00 assets exist, use a strong dormant treatment at score 0 (desaturated/sleeping/covered) and reveal L01 immediately on first completion.

## P1 — Asset transparency / crop QA
Fix first:
1. Steps
2. Brush Teeth
3. Good Deed

Problems to check:
- incorrect / fake transparency or white matte remnants;
- companion visibly clipped / half-cut inside its frame;
- inconsistent transparent padding and character scale across levels.

After these three, run the same QA across every Park 3.1 companion asset. This should become an asset-pipeline check, not repeated manual cleanup.

## P1 — Gratitude should auto-complete its mission
- When a non-empty gratitude entry is saved for date D, automatically mark the `gratitude` Daily Mission complete for D.
- Default behavior should be one-way: editing an existing entry keeps the mission complete; deleting text later should not silently remove earned completion.
- Must use the same date-aware habit log / recompute logic as a manual mission check so the level history remains correct.

## P2 — Gratitude cloud redesign
Current problem: words still occupy a square block with a decorative circular/cloud outline around it.
Desired: the **words themselves form the shape**.
- Use a real shape-constrained word-cloud / packed-word layout.
- Cloud/blob is preferred first; words can vary in size/position and limited rotation.
- Remove the visible square text-block feeling.
- Entries remain readable/tappable and tied to their original gratitude data.

## P2 — Flex Day, not Cheat Day
Problem: a socially rich / active day can look like a failed Gamenfy day simply because fewer checkbox-style missions were completed.
Direction:
- Do not create a consequence-free `Cheat Day` that falsifies individual missions.
- Prototype a **Flex Day / Life Day**: user chooses a smaller Core 3 for that day, while other individual missions still record truthfully as completed/not completed.
- Meta-day status can still count as a meaningful day when the day was socially, physically or personally valuable.
- Keep frequency constrained (e.g. limited weekly use) so it remains a flexibility mechanic, not an escape hatch.

## P2 — Evidence-based Daily Mission review
Run a separate research pass before adding more missions. Goal is not a bigger checklist; goal is the smallest set of repeatable behaviors with high leverage on Joey's goals (money, freedom, relationship/social life, happiness, exploration, health/energy).
Questions for the review:
- Which current missions deserve to stay daily?
- Which should be weekly/contextual instead?
- Which 3–7 behaviors have the strongest practical leverage?
- Which can be auto-detected rather than manually checked?
- Which missions create guilt/noise without changing outcomes?

## Suggested implementation order
1. Permanent Fitbit OAuth fix + stale/reauth warning.
2. Hide Gardening from normal roster without deleting data.
3. Gratitude -> automatic Daily Mission completion.
4. Make score 0 -> 1 visually evolve immediately.
5. Repair Steps / Brush Teeth / Good Deed transparency + crop, then full asset QA.
6. Rebuild gratitude visualization as true shaped word cloud.
7. Prototype Flex Day after Daily Mission research, not before.
