# BUILDER — Current handoff

Last updated: 2026-09-03  
Owner: Joey Siemons  
Primary builder: ChatGPT (OpenAI)

## Working mode

This repository is the durable source of truth for Gamenfy.

- Read current GitHub/data before making claims or changes.
- Builder owns implementation, integration, persistence, tests, rollback and technical documentation.
- New original visual assets belong to a separate Creator workflow; Builder integrates only approved output.
- A chat claim is not completed work until the relevant commit/files are verified.
- Joey decides meaningful product/visual choices.
- When Joey says **“ga verder, druk”**, continue autonomously inside the locked boundaries instead of stopping for routine clarification.
- Do not force live user data through SQL merely to make a feature look verified. Prefer real app execution + read-only verification.

## Hard boundaries

- New visual/product experiments live in the **normal app Lab** first.
- **Home/Main visual layout stays untouched unless Joey explicitly approves a Home rollout.** Authorized persistence/sync/Fitbit/Daily Mission logic may run on Main.
- Park 3.0 remains rollback/reference.
- Park 3.1 is the current Daily Mission Lab iteration and does not overwrite Park 3.0.
- Do not auto-generate missing companion art. Missing native art is a Creator/approval task.
- Device-specific iOS/PWA visual issues are not fully closed without Joey's real-device confirmation.

## Connected project

- GitHub: `Kingkangaroos/Joe`
- Default branch: `main`
- Vercel project: `joe`
- Supabase project id: `ttxjsoahmtennnufgeqx`
- Lab: `lab.html`
- Park 3.0: `park3.html`, `park3.css`, `park3.js`
- Park 3.1: `park31.html`, `park31.css`, `park31.js`, host controller `park31-lab.js`

## Automated regression gate — LIVE

`.github/workflows/smoke.yml` runs every `tests/*-smoke.js` on pushes and pull requests to `main`, using Node 22 and current GitHub Actions v7.

Current durable coverage includes:
- Park 3.1 interaction, canonical level bands, Level 0, native asset integrity, public/private roster and PIN/manual-off routes;
- exact Daily Mission membership versus `RPG_DEFAULT_SKILLS`;
- Daily Mission Garden;
- Park 2 rollback loader;
- Chess skill registry/gates;
- Health Trail scoring/events;
- Fitbit retrospective reconciliation and manual-off behavior;
- authoritative Daily Mission reset;
- global streak net-activity reconciliation;
- RPG sync scope;
- `sync.js` stale-realtime / pre-auth edit / pre-auth deletion races;
- remote-state refresh events + legacy storage bridge + Main refresh contract;
- website scroll prototypes.

The latest functional remote-refresh commit passed the full GitHub Actions suite and Vercel deployed that exact commit as production `READY`.

**Rule:** do not claim a new change is safe merely because a test file exists. Inspect the newest Actions run and repair failures first.

## Daily Mission source of truth — LOCKED

Public Daily Missions are active, non-private `RPG_DEFAULT_SKILLS` entries with `isHabit === true`.

Canonical public 11:
1. Budgeting
2. Sleep
3. Nutrition
4. 10k Steps / Walking
5. Brush Teeth 2×
6. Household
7. Meditation
8. Gratitude
9. Good Deed
10. Screen Time
11. Cold Shower

Private dailies, separate/PIN-backed:
- Weed Control / Gardening
- No Porn / Discipline

Never place Tennis, Reading or Finger Whistling into the public Daily Mission grid. Grounding is disabled.

Persistence:
- per-day public completion: `rpg_habitlog_v1`
- current public 0–10 state: `rpg_habits_v1`
- authoritative replay: `recomputeHabitFromLog(habitId)`
- Fitbit/manual suppression ledger: `rpg_autohabit_v1`
- authoritative reset markers: `rpg_habit_reset_v1`
- private per-day quests: `rpg_daily_v1:<date>`
- no weekly reset
- completed day: +1 up to 10
- missed completed calendar day: −1 down to 0
- today is not treated as missed before the day ends

Visual bands:
- 0–2 → Starter
- 3–4 → Apprentice
- 5–6 → Advanced
- 7–9 → Expert
- 10 → Master

## Park 3.1 — current Lab state

Park 3.1 displays the exact **11 canonical public Daily Missions**, followed by a visibly separate **2 private dailies** section. `tests/daily-membership-smoke.js` derives the public set from `RPG_DEFAULT_SKILLS`, preventing private companions from replacing public slots again.

Asset truth:
- **110 native Park 3.1 WebPs = 11 native sets ×10**;
- those native sets are **9 public + 2 private**;
- missing native public Park 3.1 sets are **Budgeting** and **Meditation**.

Current public art:
- native 10-level Park 3.1: Sleep, Nutrition, Steps, Brush Teeth, Household, Gratitude, Good Deed, Screen Time, Cold Shower;
- Budgeting: explicitly labelled existing Park 2 base-art fallback;
- Meditation: explicitly labelled Park 2 base / Advanced / Mastery fallback.

Private native sets remain:
- Gardening → `no-weed/l01–l10.webp`
- Discipline → `discipline/l01–l10.webp`

Do not fabricate Budgeting/Meditation replacements. See `img/lab/park31/ASSET-MAP.md`.

Interaction:
- short tap opens companion detail;
- `− / +` is read-only preview;
- explicit Complete/Undo changes real mission state;
- 560 ms hold is shortcut;
- >12 px movement cancels hold for scrolling safety;
- public changes route through host Daily Mission controller;
- private changes retain PIN route;
- 3+ inactive days can show HELP;
- real public level-up can trigger celebration.

Park mission undo no longer deletes the entire global streak day. Park cannot know every activity source, so Main's Streak engine performs authoritative multi-source reconciliation.

## Fitbit → Daily Missions retrospective reconciliation — v11.5

Locked behavior:
- Walking auto-completes at 10,000 steps;
- Sleep auto-completes at 420 minutes / 7 hours;
- later Fitbit finalization/correction can repair an older calendar day;
- public 0–10 level is replayed from the full canonical day log;
- deliberate manual uncheck must remain deliberate.

`autohabit-reconcile.js` v11.5:
- scans every available Fitbit day through today;
- leaves threshold misses reopenable;
- fetches Fitbit and current RPG cloud baseline together;
- waits for safe sync/local convergence before mutation;
- writes genuinely missing qualified dates to `rpg_habitlog_v1`;
- recomputes through authoritative replay;
- respects `manual-off`;
- protects Main, Park and Character/backdated unchecks;
- reruns on focus/foreground.

Legacy ambiguous auto-ledger booleans migrate once using `__retrospective_v2_migrated=true`. After migration, disappearance of a previously confirmed Fitbit-backed date from canonical habitlog is treated as deliberate removal rather than something Fitbit should re-add.

### Live-device status — still pending

Do **not** force this with SQL.

Latest read-only Supabase audit on 2026-09-03 still showed:
- RPG cloud row unchanged since `2026-09-03 11:12:10 UTC`;
- Walking score 10;
- Sleep score 0;
- Walking `2026-08-31` absent from canonical habitlog;
- Sleep `2026-09-03` absent;
- `__retrospective_v2_migrated` absent.

Therefore Joey's authenticated Main has **not yet exercised the deployed v11.5 reconciler**. After Joey naturally opens Main again, re-query read-only and verify migration/backfill. Never manufacture the proof.

## Authoritative Reset & start fresh

A confirmed reset now:
- writes/reset marker;
- prunes pre-reset canonical completion dates for that habit;
- suppresses pruned Fitbit-backed dates so they cannot immediately return;
- preserves earned XP history;
- recomputes from remaining post-reset log;
- emits refresh event for dependent Lab views.

Regression: `tests/habit-reset-smoke.js`.

## Global streak — v7.4

The old streak had two opposing bugs:
- any historical positive XP event permanently marked a day active, even if later reversed;
- one mission undo could erase an entire day even when another activity legitimately happened.

Current rule:
- XP is netted **per skill per day**;
- a +15/−15 mission pair cancels only that mission's activity contribution;
- another positive skill on the same date keeps the day active;
- completed venture steps independently count;
- explicit evening check-in independently counts;
- only dates represented by current retained evidence are reconciled destructively;
- older streak history outside capped XP evidence is preserved;
- historical `best` never shrinks during reconciliation.

Regression: `tests/streak-net-activity-smoke.js` plus Park mission smoke.

## Cloud sync + live refresh — v11.4

### Race protection

`sync.js` maintains a persistent dirty journal and monotone high-water mark so older remote/realtime snapshots cannot roll newer local state backwards.

`tests/sync-race-smoke.js` protects:
- local edit before Auth/initial cloud pull;
- stale initial remote snapshot;
- confirmed cloud healing push;
- stale realtime echo after newer local/cloud state;
- local deletion before Auth that must not be resurrected.

### Remote UI refresh contract

A real remote apply now produces two safe signals:
1. `gamenfy:remote-state-applied` with `{appKey, source}` for modern views;
2. one **key-less synthetic `storage` event** for older views already built around storage refresh.

The key-less bridge cannot trigger sync echo writes because sync schedules a push only when `event.key` matches its configured scope.

Covered views:
- Park 3.1 → dedicated remote event;
- Health Trail → dedicated remote event;
- Main → `checkin.js` v7.4 redraws existing Missions, character strip, streak/check-in, focus, agenda, next move, arc/workout surfaces;
- Daily Mission Garden → existing storage renderer via bridge;
- Character → existing active-tab storage renderer via bridge.

Identical remote state emits neither fake dedicated refresh nor fake storage bridge event. Regression: `tests/sync-remote-event-smoke.js`.

### Cache/PWA verification

`sw.js` has no fetch/cache handler, only push/notification behavior. Vercel serves `sync.js?v=11.0` with `Cache-Control: public, max-age=0, must-revalidate`; production fetch already returned the current v11.4 code despite the legacy query label. Do not rewrite giant HTML files solely to bump that query string unless caching behavior actually changes.

## Health Trail

Read-only Lab prototype replacing the old D-score concept:
- 70% public Daily Mission average;
- 30% available Fitbit recovery;
- recovery uses sleep, HRV and resting-heart-rate movement versus recent personal baseline;
- missing Fitbit signals are omitted rather than counted as failure.

It reads canonical `getHabits()` levels and refreshes after manual mission changes, Fitbit reconciliation, remote state application and focus/foreground changes.

## Other current facts

### Chess
Existing Chess implementation already has XP, eleven tiers/gates, assessment, logging and Lab visuals. Do not duplicate it.

### Park 3.0
Still rollback/reference and must remain intact.

### iOS/PWA navigation
Bottom navigation can visually drift upward while scrolling on iOS 26 standalone PWA. This remains device-dependent/open. Do not pile transforms onto the fixed nav without real-device evidence; see `BUGS-ACTIVE.md`.

## Next build sequence

1. After Joey next naturally opens Main, inspect Supabase **read-only** for v11.5 migration/backfill; never force history with SQL.
2. Verify Walking `2026-08-31`, current Sleep, resulting Walking/Sleep levels and migration marker.
3. Keep Daily Mission membership, reset, streak and sync contracts locked through CI.
4. Continue non-device-dependent consistency audits before adding speculative UI work.
5. Budgeting + Meditation native Park 3.1 ten-level art remains a Creator task.
6. Continue concrete Park interaction/visual fixes from Joey's feedback inside Lab.
7. Keep Home visual layout unchanged without explicit rollout approval.
8. Treat convincing locomotion as a real animation/frame asset problem, not a wobbling static-image trick.

## Definition of done for the current Daily Mission layer

- Main, Character and Park read the same public day log.
- Park public roster equals canonical RPG public 11.
- Private dailies are visibly/logically separate.
- Public 0–10 levels come from authoritative replay.
- No weekly reset.
- Manual, backdated, cloud and Fitbit changes converge.
- Fitbit cannot fight deliberate Walking/Sleep uncheck.
- Late Fitbit correction can restore a legitimately qualified older date.
- Reset cannot be undone by old log history.
- Global streak reflects net real activity, not ghost XP events.
- Remote cloud applies refresh Main, Character, Garden, Park and Health Trail without reload.
- Park uses canonical bands and visible Level 0 semantics.
- Automatic CI is green for newest functional commit.
- Production deployment is READY for newest functional commit.
- Park 3.0 remains rollback/reference.
- Device-only issues stay open until real iPhone/PWA confirmation.
