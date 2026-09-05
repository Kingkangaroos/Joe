# Gamenfy Project HQ

> Durable shared product memory for Joey + ChatGPT/Claude. The chat is not the source of truth. Update this file when product decisions, feedback, priorities, or major implementation status changes.

Last refreshed: 2026-09-05 by ChatGPT (OpenAI)

## NOW

1. **Installed-iPhone verification of Daily Missions 2.0** — confirm the new Home surface feels smooth, the tap-circle interaction is natural, and the detail sheet behaves well inside the embedded surface.
2. **Budgeting owl asset import** — the owl is the locked Budgeting direction, but its native 10-level asset set is not present in the current repo tree yet. Do not fabricate it.
3. **Meditation native level set** — waiting for Joey's approved art. Current fallback remains temporary.
4. **WHY-chain model** — design the durable link `action / skill -> intermediate reason -> concrete life goal / direction`, so Gamenfy and Jarvis can explain why today's move matters.
5. **Major-section swipe architecture** — design horizontal swiping between main app sections while preserving vertical page scrolling and bottom navigation; avoid gesture conflicts on iPhone.
6. **Life/dashboard taxonomy** — the old Love / Money / Freedom / Happiness / Exploration labels are not sacred as app navigation. Consolidate only if it makes the whole system clearer while preserving the underlying 100-year-plan WHY.

## COMPLETED THIS PASS

- [x] Park 3.1 promoted into **Daily Missions 2.0** on Home.
- [x] Home embed is **public-only**: canonical 11 public Daily Missions; private dailies do not leak into Home.
- [x] Long-press completion retired; each mission now has a dedicated **tap-circle** completion control.
- [x] Scene/card tap remains separate and opens mission detail/preview.
- [x] Park performance hardened: unnecessary roster rewrites reduced, artwork readiness probes no longer redraw on unchanged state, nearby/current mission art is preloaded, fallback polling throttled from 1.2s to 5s while explicit state events remain immediate.
- [x] **Daily Challenge stays** and difficulty now uses the selected challenge skill's own current level rather than the strongest of unrelated skills.
- [x] **Your Skills** removed from Home.
- [x] **Core Tracker** removed from Home.
- [x] Gratitude replaced with a persistent **living word-cloud board**; repeated concepts grow and tap opens count + first/latest date detail.
- [x] In-app **Project HQ** added with separate Gamenfy / Website Ventures state and a Joey feedback inbox.
- [x] Project HQ feedback inbox added to canonical RPG cloud-sync scope (`rpg_project_hq_notes_v1`).
- [x] Full guarded browserless smoke suite passed on the actual product patch in workflow run `33979142333` before the product commit was created.

## JOEY FEEDBACK INBOX — DURABLE DECISIONS FROM THE SPARRING SESSION

- Park 3.1 looks fun and should become the actual Home Daily Missions experience.
- Park became noticeably slow when moving between characters on iPhone; originally it felt smooth.
- Long-press is a bad completion interaction on iPhone because it collides with native browser/PWA press behavior.
- Daily Mission completion should use the familiar tap-circle interaction.
- Budgeting character set = **owl**.
- Meditation needs a new native level set from Joey; current fallback is temporary.
- Daily Missions 2.0 keeps the current multi-house / multi-scene overview; it is not the future open Skills world.
- Tapping a Daily Mission scene may keep roughly the existing detail behavior: history/days, reset and level detail. Lab may keep an all-level showcase for demos.
- Gratitude is a **word cloud**: repeated concepts grow. Selecting a concept only needs straightforward history/count information for now; do not overbuild a separate memory-trail product.
- Home is the overview/cockpit. Long-term interaction can combine vertical scrolling inside a section with horizontal swiping between major app sections.
- Gamenfy must preserve the **WHY chain** so Joey keeps remembering why a skill, season, mission or task exists.
- Health Trail's current character is prototype-only; final overall-health avatar should be a different character.
- A larger interactive Skills Park with roughly 50 skill characters is explicitly **later**.
- Characters should eventually behave like actors in a scene — posture, facial expression, locomotion, objects and environment — not just PNGs translated across a background.
- Low levels may visibly feel chaotic / overwhelmed; high levels should feel genuinely successful / “top of the world”. The fogged-window `HELP` idea remains in the idea bank.

## PRODUCT DECISIONS

### Daily Missions 2.0
- Park 3.1 is the visual framework for **Daily Missions 2.0**.
- It replaces the old Daily Missions presentation on Home while the canonical mission engine/history remains authoritative underneath.
- Public mission logic remains canonical: complete +1, miss -1, clamp 0–10, no weekly reset, `rpg_habitlog_v1` authoritative.
- Completion interaction = **tap-circle**, not long-press.
- Scene tap is separate from completion.
- Home shows only the canonical 11 public missions. PIN-backed private dailies remain separate outside that public Home surface.
- Reward animation should stay brief. Ordinary completion = small reaction; larger celebration should eventually be reserved for genuinely notable progression.
- Budgeting = owl asset direction.
- Meditation = native level set still needed from Joey.

### Daily Challenge
- Keep it on Home.
- Randomization must be constrained by the selected challenge skill's actual current difficulty band.
- The goal is a feasible daily nudge, not random impossible content.

### Home
- Home is the **overview/cockpit**, not a single-purpose goal screen.
- Preserve the current visual identity unless Joey explicitly approves a broader redesign.
- Your Skills and Core Tracker are retired from Home.
- Long-term direction: vertical scroll within a main section + horizontal swipe between major sections/tabs, while bottom navigation remains available.

### WHY graph
- Gamenfy should show why an action matters, e.g. `20 min Dance -> Social confidence -> easier dating/going out -> Love / Happiness direction`.
- Existing 100-year categories do not have to remain the final app-navigation taxonomy. Preserve the essence of the goals, not old labels for their own sake.
- Jarvis should eventually reason from this graph so advice reflects real priorities and trade-offs rather than generic motivation.

### Gratitude Board
- Persistent concept-based word cloud.
- Repeated gratitude concepts grow visually.
- Keep underlying aggregate/history data so words do not disappear and counts remain auditable.
- Simple count + date detail is enough for now.
- Future concept aliasing (e.g. `mam` / `mama` / `mijn moeder`) must be conservative; never silently merge ambiguous concepts.

### Project HQ
- Primarily builder-managed; Joey can add notes himself.
- Chat must never be the only place an important decision or feedback exists.
- Durable structure: Now, Backlog, Ideas, Joey Feedback, Decisions, Later, human changelog.
- Git remains the technical history; HQ is the human product memory.
- Gamenfy and Website Ventures remain separate projects while Gamenfy can act as the cockpit.

## BACKLOG

### Product / UX
- [ ] Natural installed-iPhone verification of Daily Missions 2.0 performance and feel.
- [ ] WHY-chain data model + UI.
- [ ] Horizontal swipe navigation architecture across major sections.
- [ ] Decide final top-level life/app domain taxonomy after WHY-chain mapping.
- [ ] Final overall Health avatar direction.
- [ ] Improve normal-vs-milestone reward animation distinction after real-device feel is known.

### Assets / Joey
- [ ] Locate/import approved Budgeting owl level assets into canonical Park 3.1 mapping.
- [ ] Meditation native level set.
- [ ] Dedicated Gamenfy PWA/app icon direction.

### Technical proof still open
- [ ] Installed-iPhone confirmation of the historical Daily Mission rollback fix.
- [ ] Natural Fitbit retrospective reconcile of currently missing historical qualifying days.
- [ ] Jarvis Edge Function server-secret migration.
- [ ] `send-daily-push` Edge Function server-secret migration.
- [ ] iOS standalone bottom-nav drift reproduction before any architecture patch.
- [ ] Safe restore/import design and implementation.

## IDEA TANK

- Characters should eventually behave as actors in a scene, not PNGs translated across a background.
- Level state can affect posture, facial expression, locomotion, environment, object interactions and overall mood.
- Low-level overwhelmed Cleaning character could write `HELP` on fogged/moist glass.
- High levels can feel genuinely successful / “top of the world” rather than only showing a larger number.
- Ordinary completion reaction target roughly 1–2 seconds; larger milestone reaction roughly 2–3 seconds.
- Long-term Skills world: interactive park/map with many skill characters; explicitly postponed until Daily Missions 2.0 and core app direction are solid.

## LATER

- Full Skills Park / game-world for roughly 50 skills.
- Rigged/sprite/WebGL/3D character-system research once static scene artwork becomes the limiting factor.
- Deeper Jarvis intervention/trade-off reasoning after WHY graph exists.
- Restore/import UI after backup/export remains proven stable.

## HUMAN CHANGELOG

### 2026-09-05 — sparring implementation pass
- Daily Missions 2.0 integrated on Home as a public-only Park 3.1 surface.
- Long-press completion removed and replaced by tap-circle controls.
- Park render/probe/preload/poll behavior hardened for lower iPhone churn; real-device feel still needs natural verification.
- Daily Challenge fixed to use each challenge's own skill level.
- Your Skills and Core Tracker removed from Home.
- Gratitude converted into a persistent growing word cloud with simple detail.
- Project HQ added in-app and Joey feedback inbox made cloud-durable.
- Website Ventures received its own durable HQ state alongside its human handoff.
- Guarded full smoke run `33979142333` passed on the actual patch before commit `3f7488d8758778f34aee7125508d3b3a6eb93479` was created.
- Not production-claimed here; merge/main CI and Vercel production verification remain separate proof steps.

### 2026-09-05 — afternoon product alignment
- Park 3.1 formally redefined as **Daily Missions 2.0**.
- Budgeting mapped to owl; Meditation flagged as native-asset gap.
- Long-press completion rejected; tap-circle chosen.
- Daily Challenge confirmed to stay but become level-aware.
- Home confirmed as overview/cockpit; Your Skills + Core Tracker approved for removal.
- WHY-chain promoted to core product layer.
- Gratitude clarified as persistent concept word-cloud.
- Project HQ workflow approved: builder-managed, user-editable, durable outside chat.

### 2026-09-05 — overnight technical hardening
- Final verified production baseline before this product pass: `4befd752adca5fbc7927736f0411826dc713d73c`.
- GitHub smoke run 190: success.
- Vercel production deployment `dpl_4oA4A47dQh9AASv5Gxptwq4ZTHSG`: READY.
- Goals overdue retention fixed.
- Settings/Main free-text rendering hardened.
- Private Settings skill leakage fixed.
- Legacy Settings reminder/quest code retired.
- Owner-cloud-aware backup v3 shipped.
