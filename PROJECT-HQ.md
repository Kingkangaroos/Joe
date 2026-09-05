# Gamenfy Project HQ

> Durable shared product memory for Joey + ChatGPT/Claude. The chat is not the source of truth. Update this file when product decisions, feedback, priorities, or major implementation status changes.

Last refreshed: 2026-09-05 by ChatGPT (OpenAI)

## NOW

1. Turn Park 3.1 into **Daily Missions 2.0** on Home while preserving the current overall Home visual style.
2. Replace long-press completion with the same clear **tap-circle completion interaction** used by current Daily Missions.
3. Investigate and fix Park 3.1 slow swipe / delayed character transitions on iPhone; target instant-feeling transitions after first load.
4. Make Daily Challenge randomization **skill-level aware**: random is allowed, impossible-for-current-level is not.
5. Remove **Your Skills** and **Core Tracker** from Home. Daily Challenge stays, but becomes level-aware.
6. Replace current Gratitude treatment with a persistent **living gratitude word-cloud board**.
7. Build a lightweight in-app **Project HQ** surface that ChatGPT primarily manages while Joey can add notes/items himself.

## JOEY FEEDBACK INBOX

- Park 3.1 looks fun and should become the actual Home Daily Missions experience.
- Park 3.1 became noticeably slow when moving between characters on iPhone; originally it felt smooth.
- Long-press is a bad completion interaction on iPhone because it collides with native browser/PWA press behavior.
- Daily Mission completion should use the familiar tap-circle interaction.
- Budgeting character set = **owl** level set already created elsewhere.
- Meditation needs a new native level set from Joey; current fallback is temporary.
- Daily Missions 2.0 should keep the current multi-house / multi-scene overview, not become the future open Skills world.
- Tapping a Daily Mission scene can keep roughly the current detail behavior: history/days, reset, details. Lab may keep an all-level showcase for demos.
- Gratitude should be a **word cloud**: repeated concepts grow as they are mentioned more often. Selecting a concept may show count/history in the existing straightforward workout/history style; no elaborate memory-trail product is needed now.
- Home should remain an overview/cockpit, with vertical scrolling inside the current section and eventual horizontal swipe navigation between major app sections.
- The app must constantly preserve the **WHY chain**: actions/skills -> intermediate reason -> concrete life goal/direction.
- Health Trail current character is prototype-only; final overall-health avatar should be a different character.
- Larger interactive Skills Park with ~50 characters is explicitly **later**, not part of Daily Missions 2.0.

## PRODUCT DECISIONS

### Daily Missions 2.0
- Park 3.1 is the visual framework for **Daily Missions 2.0**.
- It replaces the current Daily Missions presentation on Home once ready.
- Public mission logic remains canonical: complete +1, miss -1, clamp 0-10, no weekly reset, `rpg_habitlog_v1` authoritative.
- Completion interaction: tap-circle, not long-press.
- Scene tap is separate from completion.
- Reward animation should stay brief. Normal completion = small reaction. Larger celebration should be reserved for genuinely notable progression rather than every ordinary repeat.
- Budgeting = owl asset set.
- Meditation = new native level set still needed from Joey.

### Daily Challenge
- Keep it on Home.
- Randomization must be constrained by the user's current skill level / realistic difficulty band.
- The goal is a feasible challenge, not random impossible content.

### Home
- Home is the **overview/cockpit**, not a single-purpose goal screen.
- Preserve the current visual identity unless Joey explicitly approves a broader redesign.
- Remove Your Skills and Core Tracker.
- Long-term direction: vertical scroll within a main section + horizontal swipe between major sections/tabs, with bottom navigation remaining available.

### WHY graph
- Gamenfy should show why an action matters, e.g. `20 min Dance -> Social confidence -> easier dating/going out -> Love/Blijheid direction`.
- Existing 100-year categories do not have to remain the final app navigation taxonomy. Preserve the essence of the goals, not the old labels for their own sake.
- Jarvis should eventually reason from this graph so advice is grounded in real trade-offs rather than generic motivation.

### Gratitude Board
- Persistent concept-based word cloud.
- Repeated gratitude concepts grow visually.
- Keep underlying entries/history so words do not disappear and counts are auditable.
- Simple detail/history view is enough for now; do not overbuild a separate memory-trail product.
- Future concept aliasing (e.g. mam/mama/mijn moeder) must be conservative; never silently merge ambiguous concepts.

### Project HQ
- Primarily managed by ChatGPT/Claude; Joey can add items himself.
- Chat must never be the only place a decision or important feedback exists.
- Durable sections: Now, Backlog, Ideas, Joey Feedback, Decisions, Later, Changelog.
- Keep a human-readable product changelog; Git history remains the low-level technical log.
- Separate projects such as Gamenfy and Website Ventures can each have their own HQ while Gamenfy acts as the cockpit.

## BACKLOG

### Product / UX
- [ ] Daily Missions 2.0 Home integration.
- [ ] Park 3.1 swipe/load performance investigation + fix.
- [ ] Tap-circle completion interaction.
- [ ] Scene-detail interaction retained without accidental completion.
- [ ] Level-aware Daily Challenge engine.
- [ ] Gratitude word-cloud board.
- [ ] WHY-chain data model + UI.
- [ ] Horizontal swipe navigation architecture across major sections.
- [ ] In-app Project HQ UI and data model.
- [ ] Decide final top-level life/app domain taxonomy after WHY-chain mapping.
- [ ] Final overall Health avatar direction.

### Assets / Joey
- [ ] Meditation native level set.
- [ ] Confirm/import Budgeting owl level assets into canonical Park 3.1 asset mapping if not already mapped.
- [ ] Dedicated Gamenfy PWA/app icon direction.

### Technical proof still open
- [ ] Installed-iPhone confirmation of historical Daily Mission rollback fix.
- [ ] Natural Fitbit retrospective reconcile of currently missing historical qualifying days.
- [ ] Jarvis Edge Function server-secret migration.
- [ ] send-daily-push Edge Function server-secret migration.
- [ ] iOS standalone bottom-nav drift reproduction before any architecture patch.
- [ ] Safe restore/import design and implementation.

## IDEA TANK

- Characters should eventually behave as actors in a scene, not PNGs translated across a background.
- Level state can affect posture, facial expression, locomotion, environment, object interactions and overall mood.
- Low-level overwhelmed Cleaning character could write `HELP` on fogged/moist glass.
- High levels can feel genuinely successful / "top of the world" rather than only showing a larger number.
- Completion reaction target roughly 1-2 seconds; larger milestone reaction around 2-3 seconds.
- Long-term Skills world: interactive park/map with many skill characters; explicitly postponed until Daily Missions 2.0 and core app direction are solid.

## LATER

- Full Skills Park / game-world for ~50 skills.
- Rigged/sprite/WebGL/3D character-system research once static scene pipeline becomes the limiting factor.
- Deeper Jarvis intervention/trade-off reasoning after WHY graph exists.
- Restore/import UI after backup/export remains proven stable.

## HUMAN CHANGELOG

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
- Final verified functional head before this HQ branch: `4befd752adca5fbc7927736f0411826dc713d73c`.
- GitHub smoke run 190: success.
- Vercel production deployment `dpl_4oA4A47dQh9AASv5Gxptwq4ZTHSG`: READY.
- Goals overdue retention fixed.
- Settings/Main free-text rendering hardened.
- private Settings skill leakage fixed.
- legacy Settings reminder/quest code retired.
- owner-cloud-aware backup v3 shipped.
