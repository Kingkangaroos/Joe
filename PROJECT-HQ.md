# Gamenfy Project HQ

> Durable shared product memory for Joey + ChatGPT/Claude. The chat is not the source of truth. Update this file when product decisions, feedback, priorities, or major implementation status changes.

Last refreshed: 2026-09-06 by ChatGPT (OpenAI)

## NOW

1. **Installed-iPhone Device QA pass** — open `iPhone Device QA` from the normal Lab inside the installed Gamenfy PWA. Capture standalone mode, safe-area, Visual Viewport and max fixed-bottom drift. In the same pass test Daily Missions 2.0 and Swipe Navigation. Do not patch production bottom navigation or activate the dormant swipe engine before this real-device proof.
2. **Fitbit retrospective natural proof** — live same-owner audit still shows 12 historical qualifying completions missing from canonical history (7 Walking, 5 Sleep), none `manual-off` and none marked XP-paid. Run a normal authenticated Gamenfy session, then re-audit read-only. Never manufacture proof with SQL writes.
3. **Goal/WHY source verification on device** — the live RPG cloud row currently has no `rpg_goals_v1`; the 29 Aug private backup also had no `rpg_goals_v1`, so there is no evidence of a recent Goal-store deletion. Open Goals on Joey's device: if local Goals exist, canonical RPG sync should populate cloud; if local is also empty, enter current Goals deliberately rather than restoring the unrelated legacy June `goals` row.
4. **WHY linking** — once the actual Goal store is present, add `linkedSkills` only where Joey genuinely intends a relationship. Do not infer a competing taxonomy.
5. **Restore Dry Run v4 real-file test** — backup v4 now carries a pseudonymous same-account binding. Dry Run can inspect binding presence, but account match is intentionally not trusted offline and there is still no apply/write path. Next engineering gate is an atomic cloud restore-generation protocol plus generation-aware sync.
6. **Edge Function secret cutover** — Jarvis and `send-daily-push` require environment-secret creation through a supported secure path before redeploy/rotation. The current connector cannot create Edge Function secrets.
7. **Budgeting owl asset import** — locked direction; native 10-level set still not present. Do not fabricate it.
8. **Meditation native level set** — waiting for Joey's approved art; fallback remains temporary.
9. **Life/dashboard taxonomy** — decide only after real WHY links are visible; preserve the underlying 100-year-plan WHY even if old labels change.

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
- [x] **Goal-first WHY foundation shipped**: active `rpg_goals_v1` Goals can drive the Home reminder and Daily Challenge context through explicit `linkedSkills`.
- [x] `character.html#goals` now opens the canonical Goals view on initial load and hash changes; regression coverage added.
- [x] WHY release merged to `main` as `849c119f481f53c0dd477ddad80d96a00e2263b0`; production deployment `dpl_3hUiKkptRddroLxnjBeyT7Un2LxR` verified READY.
- [x] **Swipe Navigation Lab** shipped read-only with vertical-first axis lock and interaction exclusions; the reusable cross-page engine exists but remains dormant.
- [x] **WHY Link Audit** shipped read-only; it scores local active Goals on WHY, deadline and explicit skill links without inventing mappings.
- [x] **Restore Dry Run Phase 1** shipped read-only with local backup validation and merge/overwrite preview; there is no apply path.
- [x] **Backup v4 safety foundation shipped**: authenticated Character export adds a pseudonymous SHA-256 same-account binding without serializing the raw owner ID. The binding is explicitly not a digital signature or file-integrity proof.
- [x] **Restore-generation safety model shipped analysis-only**: stale/offline dirty state cannot replay across a future restore generation. No restore mutation method exists.
- [x] Backup v4 guarded full suite `34001862091` + normal PR smoke `34001954554` passed; PR #33 merged to `main` as `00e60dc5cfe65819662cadab3694ac06a7875695`.
- [x] Fitbit reconciliation audit hardened to pair `health_fitbit` + `rpg` by the same owner; live audit reconfirmed 12 pending qualified historical completions.
- [x] Edge Function security audit + durable cutover contract shipped; repo regression guards reject server credential/owner literals.
- [x] **iPhone Device QA Lab** shipped read-only in normal Lab: installed-PWA detection, safe-area probes, Visual Viewport telemetry, fixed-bottom drift, orientation/background logging and copyable diagnostics.
- [x] Device QA drift zero-baseline corrected and CI-locked: intentional `8px + safe-area-inset-bottom` is subtracted before drift is reported. Product commit `e56dd3eb8b9ba084de90dd3389003e54dc791abc`; production `dpl_81g6BRyafi8ssPpnZes6BPV94XUY` READY.

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
- **Foundation shipped:** active unfinished Goals in `rpg_goals_v1` are the primary WHY source. Skill-to-goal links are explicit through `linkedSkills`; Gamenfy must not silently invent links or a competing life taxonomy.
- Home can surface a compact priority-goal reminder; Daily Challenge can show `WHY → <goal>` when its selected skill is explicitly linked.
- The canonical Goals deep-link is `character.html#goals`.
- Next: validate Joey's real links, then extend the graph toward actions/seasons/tasks and eventually Jarvis reasoning so advice reflects real priorities and trade-offs rather than generic motivation.
- Existing 100-year categories do not have to remain the final app-navigation taxonomy. Preserve the essence of the goals, not old labels for their own sake.

- **Current data reality (6 Sep 2026):** the live `rpg` cloud row does not currently contain `rpg_goals_v1`. The private 29 Aug backup also did not contain that key. The only separate `goals` cloud row is legacy June data and is not the canonical Goal store. This is therefore not evidence of a recent Goal-store loss and must not trigger an automatic legacy restore.
- Next proof: open the canonical Goals editor on Joey's real device. If current Goals are present locally, let normal RPG sync populate the cloud store and re-audit. If local Goals are empty too, populate current Goals deliberately with Joey rather than guessing from old data.

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
- [ ] Run the iPhone Device QA Lab from the installed PWA and capture diagnostics while verifying Daily Missions 2.0 feel.
- [ ] Verify whether the canonical Goals store exists locally on Joey's device; sync it to cloud if present, otherwise enter current Goals deliberately, then add explicit `linkedSkills`.
- [ ] Test Swipe Navigation Lab on the installed iPhone; activate the dormant cross-page engine only after the gesture feels right.
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
- [ ] Use iPhone Device QA to reproduce/capture standalone bottom-nav drift before any production shell/internal-scroller patch.
- [ ] Restore Phase 2 remains blocked: design database restore-generation storage + atomic three-domain RPC, make `sync.js` generation-aware, prove stale/offline resurrection impossible, then add any apply path in Lab only.

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
- Restore/import apply UI only after v4 owner-match, atomic restore-generation and generation-aware sync are proven; normal Settings exposure comes last.

## HUMAN CHANGELOG

### 2026-09-06 — backup v4 safety foundation
- Backup export advanced to **v4** with a pseudonymous `supabase-user-sha256-v1` same-account binding derived only while authenticated; raw owner ID is not written to the backup.
- This binding is only an account-match guard, **not** a signature and not proof that the JSON file was not edited.
- Restore Dry Run remains read-only and `restoreReady=false`; v2/v3 remain inspection-only and v4 account match must still be checked against the current authenticated session before any future apply.
- Added an analysis-only restore-generation model: dirty state can replay only inside the exact current cloud generation and only when newer than that generation's remote baseline.
- Phase 2 is still blocked on an atomic server-side three-domain restore-generation transaction/RPC and generation-aware `sync.js` regression coverage.
- Guarded full regression run `34001862091` and normal PR smoke `34001954554` passed; PR #33 squash-merged as `00e60dc5cfe65819662cadab3694ac06a7875695`.

### 2026-09-06 — device QA, WHY data audit and security continuation
- Shipped read-only iPhone Device QA into normal Lab and corrected its fixed-bottom zero baseline before using it as proof.
- Final functional Device QA code: `e56dd3eb8b9ba084de90dd3389003e54dc791abc`; Vercel production `dpl_81g6BRyafi8ssPpnZes6BPV94XUY` READY; PR smoke run 229 succeeded.
- Live same-owner Fitbit audit still shows 12 pending historical qualifying completions (7 Walking, 5 Sleep); no direct SQL repair was performed.
- Live RPG cloud has no `rpg_goals_v1`; 29 Aug backup also lacked it. Legacy standalone `goals` contains only June-era data and is not a restore source. Next proof is the canonical Goals editor on Joey's device.
- Edge Function security audit confirmed Jarvis / daily-push secret cutover remains blocked until secure environment secrets can be created. Repo now has a cutover contract and literal-secret regression guard.

### 2026-09-05 — goal-first WHY release
- Recovered the unfinished WHY pass from PR #22 after chat loading became unreliable.
- Active unfinished Goals (`rpg_goals_v1`) are now the primary reminder source; skill links require explicit `linkedSkills`.
- Home receives a compact goal-first WHY reminder and Daily Challenge can display the linked goal.
- Found and fixed an integration bug before merge: `character.html#goals` previously did not route to the Goals view.
- Full browserless regression suite passed with the deep-link guard.
- PR #22 squash-merged to `main` as `849c119f481f53c0dd477ddad80d96a00e2263b0`.
- Vercel production deployment `dpl_3hUiKkptRddroLxnjBeyT7Un2LxR` verified `READY`.


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
