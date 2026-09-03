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

## Hard boundaries

- New visual/product experiments live in the **normal app Lab** first.
- **Home/Main visual layout stays untouched unless Joey explicitly approves a Home rollout.** Authorized Fitbit/Daily Mission logic may run on Main.
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

`.github/workflows/smoke.yml` now runs every `tests/*-smoke.js` on pushes and pull requests to `main` using Node 22.

The first full GitHub Actions run passed on a real checkout, including Park 3.1's native asset integrity checks. A later run also passed after adding the sync-race regression and after correcting Park 3.1 membership.

Current durable coverage includes:
- Park 3.1 interaction, level bands, Level 0, native asset integrity and public/private roster;
- exact Daily Mission membership versus `RPG_DEFAULT_SKILLS`;
- Daily Mission Garden;
- Park 2 rollback loader;
- Chess skill registry/gates;
- Health Trail scoring/events;
- Fitbit retrospective reconciliation and manual-off behavior;
- authoritative habit reset;
- `sync.js` stale-realtime / pre-auth edit / pre-auth deletion races;
- website scroll prototypes.

Do not claim a new change is safe merely because a test file exists: check the newest Actions run and repair failures before reporting completion.

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

Never place Tennis, Reading or Finger Whistling into the Daily Mission public grid. Grounding is disabled.

Persistence:
- per-day public completion: `rpg_habitlog_v1`
- current public 0–10 state: `rpg_habits_v1`
- authoritative replay: `recomputeHabitFromLog(habitId)`
- no weekly reset
- completed day: +1 up to 10
- completed missed calendar day: −1 down to 0
- today is not treated as missed before the day ends

Visual bands:
- 0–2 → Starter
- 3–4 → Apprentice
- 5–6 → Advanced
- 7–9 → Expert
- 10 → Master

## Park 3.1 — current Lab state

### Membership corrected — v1.14

Park 3.1 now displays the exact **11 canonical public Daily Missions**, followed by a visibly separate **2 private dailies** section. `tests/daily-membership-smoke.js` compares Park's public registry directly with `RPG_DEFAULT_SKILLS`, so private companions can no longer silently replace public slots.

Important asset truth:
- repository contains **110 native Park 3.1 WebPs = 11 native sets × 10 levels**;
- those native sets are **9 public + 2 private**, not eleven public sets;
- the missing native public Park 3.1 sets are **Budgeting** and **Meditation**.

Current public art:
- native 10-level Park 3.1 sets: Sleep, Nutrition, Steps, Brush Teeth, Household, Gratitude, Good Deed, Screen Time, Cold Shower;
- Budgeting: explicitly labelled existing Park 2 base-art fallback;
- Meditation: explicitly labelled existing Park 2 base / Advanced / Mastery three-stage fallback.

Current private art remains preserved:
- Gardening: native Park 3.1 `no-weed/l01–l10.webp`
- Discipline: native Park 3.1 `discipline/l01–l10.webp`

Do not generate Budgeting/Meditation replacements automatically. Their native ten-level sets remain an explicit Creator/approval task. See `img/lab/park31/ASSET-MAP.md`.

### Interaction

- short tap opens companion detail;
- `− / +` is read-only preview;
- explicit Complete/Undo changes real mission state;
- 560 ms hold is a shortcut;
- >12 px pointer movement cancels hold for scrolling safety;
- public changes route through host Daily Mission controller;
- private changes retain PIN-backed route;
- 3+ inactive days can show HELP;
- real public level-up can trigger the existing celebration.

Budgeting's fallback has no fake ten-frame preview. Meditation maps the live 0–10 level to its real existing three Park 2 stages until native assets exist.

### Level consistency

Park 3.1 follows the canonical bands everywhere. Technical Level 0 remains a real displayed level with 0% progress while optionally reusing Level-1 art for rendering.

## Fitbit → Daily Missions retrospective reconciliation — v11.5

Joey's locked behavior:
- Walking auto-completes at 10,000 steps;
- Sleep auto-completes at 420 minutes / 7 hours;
- later Fitbit finalization/correction can repair an older calendar day;
- the canonical 0–10 level is replayed from the full day log;
- a deliberate manual uncheck must remain deliberate.

`autohabit-reconcile.js` v11.5:
- scans every available Fitbit day through today;
- leaves threshold misses reopenable;
- fetches Fitbit and current cloud RPG baseline together;
- waits for safe sync/local convergence before mutation;
- writes genuinely missing qualified days to `rpg_habitlog_v1`;
- recomputes affected levels using the existing replay engine;
- records historical date in XP audit reason;
- respects `manual-off`;
- reruns on focus/foreground.

`checkin.js` synchronously gates the legacy today/yesterday checker while v11.5 loads so it cannot race initial cloud sync.

### Legacy auto-ledger migration

Old `rpg_autohabit_v1` boolean `true` was ambiguous. v11.5 performs one migration and stores `__retrospective_v2_migrated=true`.

After migration, a confirmed Fitbit-backed date disappearing from the canonical habitlog is interpreted as a deliberate uncheck and converted to `manual-off`. This protects Main, Park and Character/backdated edits.

### Live-device status

Do **not** force historical habit rows with SQL. At the last non-destructive Supabase audit before Joey opened Main again, the cloud RPG row still showed Walking 10, Sleep 0 and had not yet stored the migration marker. The deployed reconciler therefore still requires its first authenticated real Main exercise before this item can be marked device-verified.

## Authoritative Reset & start fresh

The previous reset only changed `rpg_habits_v1`, leaving old completion history able to reconstruct the old level. This is fixed.

A confirmed reset now:
- writes/reset marker;
- prunes pre-reset canonical completion dates for that habit;
- suppresses pruned Fitbit-backed dates so they cannot immediately return;
- preserves earned XP history;
- recomputes from the remaining post-reset log;
- emits a refresh event for dependent Lab views.

Regression: `tests/habit-reset-smoke.js`.

## Sync race protection — v11.2

`sync.js` maintains a persistent dirty journal and monotone high-water mark so older remote/realtime snapshots cannot roll newer local state backwards.

`tests/sync-race-smoke.js` now durably reproduces and protects:
- local edit before Auth/initial cloud pull;
- stale initial remote snapshot;
- confirmed cloud healing push;
- stale realtime echo after newer local/cloud state;
- local deletion before Auth that must not be resurrected.

This test is part of the automatic GitHub Actions gate.

## Health Trail

Read-only Lab prototype replacing the old D-score concept:
- 70% public Daily Mission average;
- 30% available Fitbit recovery;
- recovery uses sleep, HRV and resting-heart-rate movement versus recent personal baseline;
- missing Fitbit signals are omitted rather than counted as failure.

It reads the same `getHabits()` levels and refreshes after manual mission changes, Fitbit reconciliation, remote-state application and focus/foreground changes. Rapid events coalesce network reads.

## Other current facts

### Chess
Existing Chess implementation already has XP, eleven tiers/gates, assessment, logging and Lab visuals. Do not duplicate it.

### Park 3.0
Still rollback/reference and should remain intact.

### iOS/PWA navigation
Bottom navigation can visually drift upward while scrolling on iOS 26 standalone PWA. This remains device-dependent/open. Do not pile transforms onto the fixed nav without real-device evidence; see `BUGS-ACTIVE.md`.

## Next build sequence

1. After Joey next opens Main, inspect Supabase non-destructively for the v11.5 migration/backfill result; never force the history with SQL.
2. Verify Walking 2026-08-31, current Sleep, resulting levels and migration marker.
3. Keep Park 3.1 public/private membership locked through CI.
4. Budgeting + Meditation native Park 3.1 ten-level art remains a Creator task, not a Builder fabrication task.
5. Continue concrete Park interaction/visual fixes from Joey's feedback inside Lab.
6. Keep Home visual layout unchanged without explicit rollout approval.
7. Treat convincing locomotion as a real animation/frame asset problem, not a wobbling static-image trick.

## Definition of done for the current Daily Mission layer

- Main, Character and Park read the same public day log.
- Park public roster equals the canonical RPG public 11.
- Private dailies are visibly and logically separate.
- Public 0–10 levels come from authoritative replay.
- No weekly reset.
- Manual, backdated and Fitbit changes converge.
- Fitbit cannot fight a deliberate Walking/Sleep uncheck.
- Late Fitbit correction can restore a legitimately qualified older date.
- Reset is authoritative and cannot be undone by old log history.
- Park and Health Trail refresh after reconciliation.
- Park uses canonical bands and visible Level 0 semantics.
- Automatic CI is green for the newest functional commit.
- Park 3.0 remains rollback/reference.
- Device-only issues stay open until real iPhone/PWA confirmation.