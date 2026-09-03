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
- When Joey says **“ga verder, druk”** or otherwise asks Builder to keep going, continue autonomously inside the locked boundaries instead of stopping for routine clarification.
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
- Daily Windows experiment: `daily-windows.html`, `daily-windows.js`, `daily-windows-option-d.js`

## Automated regression gate — LIVE

`.github/workflows/smoke.yml` runs every `tests/*-smoke.js` on pushes and pull requests to `main`, using Node 22 and current GitHub Actions v7.

Durable coverage now includes:
- exact Daily Mission membership versus `RPG_DEFAULT_SKILLS`;
- Park 3.1 interaction, level bands, Level 0, native asset integrity, public/private roster and PIN/manual-off routes;
- Daily Mission Garden and Daily Windows direct-log behavior;
- Fitbit retrospective reconciliation, manual-off behavior, symmetric uncheck/recheck and full manual-cycle integration;
- retry-safe / exact-once Fitbit XP awards;
- authoritative public habit replay after cloud baseline;
- authoritative Daily Mission reset;
- global streak net-activity + historical activity-date attribution;
- RPG sync scope and stale-realtime/pre-auth edit/deletion races;
- remote-state refresh events + legacy storage bridge + Main refresh contract;
- shared JS cache revalidation contract;
- Health Trail, Chess and existing Lab/website regressions.

**Rule:** do not claim a new change is safe merely because a test file exists. Inspect the newest Actions run and exact Vercel deployment first.

## Latest verified functional checkpoints

The following functional chains have been verified in GitHub Actions and deployed as Vercel production `READY`:

- `99efac426a2b48293b0865eb49eea00f0b79ace6` — full Fitbit auto → manual uncheck → manual recheck cycle;
- `d18864da02f2c2e82f6926dc554344854244efb0` — Daily Windows Fitbit override symmetry;
- `01dcd190ae06bfa0fbc29cf87ab27734ab89fce2` — shared JS revalidation/cache contract.

Earlier locked foundations include authoritative cloud-baseline replay, backdated streak attribution and retry-safe Fitbit XP awards.

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

Persistence contract:
- authoritative per-day public completion: `rpg_habitlog_v1`;
- materialized public 0–10 cache: `rpg_habits_v1`;
- authoritative replay: `recomputeHabitFromLog(habitId)`;
- Fitbit/manual suppression + reconciliation ledger: `rpg_autohabit_v1`;
- authoritative reset markers: `rpg_habit_reset_v1`;
- private per-day quests: `rpg_daily_v1:<date>`;
- no weekly reset;
- completed day: +1 up to 10;
- missed **completed calendar day**: −1 down to 0;
- today is not treated as missed before the day ends.

`sync.js` v11.7 now treats the day log as authoritative after the safe RPG cloud baseline: every public habit is replayed once baseline convergence is known, and replay runs again after later RPG remote applies. A stale `rpg_habits_v1` score/streak/lastChecked combination therefore cannot remain authoritative merely because `lastChecked` happens to match.

Visual bands:
- 0–2 → Starter
- 3–4 → Apprentice
- 5–6 → Advanced
- 7–9 → Expert
- 10 → Master

## Habit XP versus habit level — LOCKED

A public Daily Mission completion can still write `+15 XP` to the character XP audit/activity log. That does **not** create a second habit level:

- habit-visible level comes from `getSkillLevel()` → canonical 0–10 habit score;
- Character Level explicitly sums only **non-habit** skill XP;
- the Skills Total Level/average likewise excludes habits.

Do not remove habit XP merely to “fix” the 0–10 display. It is activity/audit data, not the habit's visible level.

One legacy category-XP statistic still aggregates all XP inside a category, including habit XP. Treat that as a separate product-definition question; do not silently change it as part of Daily Mission correctness work.

## Fitbit → Daily Missions retrospective reconciliation — v11.6

Locked behavior:
- Walking auto-completes at 10,000 steps;
- Sleep auto-completes at 420 minutes / 7 hours;
- later Fitbit finalization/correction can repair an older calendar day;
- public 0–10 level is replayed from the full canonical day log;
- deliberate manual uncheck must remain deliberate;
- deliberate manual recheck must clear that suppression;
- retries/crashes must not duplicate XP.

`autohabit-reconcile.js` v11.6:
- scans every available Fitbit day through today;
- leaves threshold misses reopenable;
- fetches Fitbit and current RPG cloud baseline together;
- waits for safe sync/local convergence before mutation;
- writes genuinely missing qualified dates to `rpg_habitlog_v1`;
- recomputes through authoritative replay;
- respects `manual-off`;
- reruns on focus/foreground;
- maintains a retry-safe XP award ledger using `__xp_awarded_v1:<habit>:<date>`;
- migrates legacy already-confirmed canonical Walking/Sleep days conservatively as historically paid;
- detects an XP event already written before a ledger-save crash, preventing duplicate +15;
- can repair the opposite crash window where canonical completion was saved but +15 was not yet written.

Legacy ambiguous auto-ledger booleans migrate once using `__retrospective_v2_migrated=true`. XP award-ledger migration uses `__xp_ledger_v1_migrated=true`.

### Manual override routes — now symmetric

- Main current/backdated flow: protected;
- Park 3.1 host controller: protected;
- Character current-day `checkHabit`/`uncheckHabit`: centrally protected by `sync.js` v11.7;
- Daily Windows direct dated-log route: explicitly calls `setAutoHabitManualOverride(key,date,suppressed)` because it intentionally bypasses the shared current-day wrappers.

A full regression proves: auto +15 → manual uncheck −15 → Fitbit cannot fight it → manual recheck +15 → Fitbit cannot add a second +15.

### Live-data status — still pending natural client exercise

Do **not** force this with SQL.

Latest read-only Supabase audit on 2026-09-03 still showed the RPG row unchanged since `2026-09-03 11:12:10 UTC`, with the retrospective migration marker absent. That means the stored cloud row had not yet proven that Joey's authenticated Main had naturally exercised the new reconciler at the time of that read.

After Joey naturally opens Main again, re-query read-only and verify migration/backfill. Never manufacture the proof.

## Authoritative Reset & start fresh

A confirmed reset:
- writes/reset marker;
- prunes pre-reset canonical completion dates for that habit;
- suppresses pruned Fitbit-backed dates so they cannot immediately return;
- preserves earned XP history;
- recomputes from remaining post-reset log;
- emits refresh event for dependent Lab views.

Regression: `tests/habit-reset-smoke.js`.

## Global streak — v7.5

Current rule:
- XP is netted **per skill per actual activity day**;
- a +15/−15 mission pair cancels only that mission's activity contribution;
- another positive skill on the same date keeps the day active;
- completed venture steps independently count;
- explicit evening check-in independently counts;
- only dates represented by current retained evidence are reconciled destructively;
- older streak history outside capped XP evidence is preserved;
- historical `best` never shrinks.

Backdated Main/Fitbit XP is physically written when reconciliation occurs, but its audit reason contains `(YYYY-MM-DD)`. `checkin.js` v7.5 prefers that explicit historical activity date, so filling 31 August on 3 September cannot falsely make 3 September an active streak day.

Regression: `tests/streak-net-activity-smoke.js` and the dedicated backdated streak smoke.

## Cloud sync + live refresh — v11.7

`sync.js` maintains a persistent dirty journal and monotone high-water mark so older remote/realtime snapshots cannot roll newer local state backwards.

Protected races:
- local edit before Auth/initial cloud pull;
- stale initial remote snapshot;
- confirmed cloud healing push;
- stale realtime echo after newer local/cloud state;
- local deletion before Auth that must not be resurrected.

A real remote apply emits:
1. `gamenfy:remote-state-applied` with `{appKey, source}` for modern views;
2. one key-less synthetic `storage` event for older storage-driven views.

The key-less bridge cannot cause sync echo writes because sync only schedules pushes for matching non-empty `event.key` values.

## Cache/PWA correctness — LOCKED

`sw.js` is intentionally **push-only**: it has no `fetch` listener and no Cache API use.

`vercel.json` now explicitly serves all own `*.js` with:

`Cache-Control: no-cache, must-revalidate`

This means legacy query labels such as `sync.js?v=11.0` cannot silently pin old app logic in Safari/WebView: the JS must revalidate after deploys. Daily Windows also explicitly points at `daily-windows.js?v=11.72`.

Regression: `tests/cache-revalidation-smoke.js` fails if the JS revalidation rule disappears or the service worker starts caching app files without a separate versioning contract.

## Park 3.1 — current Lab state

Park 3.1 displays exact **11 canonical public Daily Missions**, followed by a visibly separate **2 private dailies** section.

Asset truth:
- 110 native Park 3.1 WebPs = 11 native sets ×10;
- those native sets are 9 public + 2 private;
- missing native public Park 3.1 sets are **Budgeting** and **Meditation**.

Current public art:
- native 10-level Park 3.1: Sleep, Nutrition, Steps, Brush Teeth, Household, Gratitude, Good Deed, Screen Time, Cold Shower;
- Budgeting: explicitly labelled existing Park 2 base-art fallback;
- Meditation: explicitly labelled Park 2 base / Advanced / Mastery fallback.

Private native sets:
- Gardening → `no-weed/l01–l10.webp`;
- Discipline → `discipline/l01–l10.webp`.

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

Park mission undo no longer deletes the entire global streak day. Main's Streak engine performs authoritative multi-source reconciliation.

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

1. After Joey next naturally opens Main, inspect Supabase **read-only** for retrospective migration/backfill; never force history with SQL.
2. Verify Walking historical qualified days, current Sleep, resulting Walking/Sleep levels and migration markers.
3. Keep membership, reset, streak, exact-once XP, manual-off and sync contracts locked through CI.
4. Continue non-device-dependent consistency audits before speculative UI changes.
5. Decide separately whether category-XP cards should exclude habit XP; Character/Total Level already correctly exclude it.
6. Budgeting + Meditation native Park 3.1 ten-level art remains a Creator task.
7. Continue concrete Park interaction/visual fixes from Joey's feedback inside Lab.
8. Keep Home visual layout unchanged without explicit rollout approval.
9. Treat convincing locomotion as a real animation/frame asset problem, not a wobbling static-image trick.

## Definition of done for the current Daily Mission layer

- Main, Character, Park and Daily Windows converge on the same public day log.
- Park public roster equals canonical RPG public 11; private dailies stay separate.
- Public 0–10 levels come from authoritative replay; no weekly reset.
- Manual, backdated, cloud and Fitbit changes converge.
- Fitbit cannot fight deliberate Walking/Sleep uncheck or duplicate a manual recheck.
- Late Fitbit correction can restore a legitimately qualified older date.
- Fitbit XP is retry-safe/exact-once.
- Reset cannot be undone by old log history.
- Character/Total Level do not double-count habit XP.
- Global streak reflects net activity on the real activity date, not the audit-write date.
- Remote cloud applies refresh dependent views without reload.
- Own JS revalidates after deployments; service worker stays push-only.
- Automatic CI is green for newest functional commit.
- Production deployment is READY for newest functional commit.
- Park 3.0 remains rollback/reference.
- Device-only issues stay open until real iPhone/PWA confirmation.
