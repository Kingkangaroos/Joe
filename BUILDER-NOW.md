# BUILDER — Current handoff

Last updated: 2026-09-04  
Owner: Joey Siemons  
Primary builder: ChatGPT (OpenAI)

## Working mode

This repository is the durable source of truth for Gamenfy.

- Read current GitHub/data before making claims or changes.
- Builder owns implementation, integration, persistence, tests, rollback and technical documentation.
- New original visual assets belong to a separate Creator workflow; Builder integrates only approved output.
- A chat claim is not completed work until the relevant commit/files are verified.
- Joey decides meaningful product/visual choices.
- When Joey says **“ga verder, druk”**, **“keep it going”**, **“verder”**, or asks Builder to keep working while he is unavailable, continue autonomously inside locked boundaries instead of stopping for routine clarification.
- Do not force live user data through SQL merely to make a feature look verified. Prefer real app execution + read-only verification.
- Never copy server-only credentials from deployed Edge Function source into repository files, issues, handoffs or chat summaries.

## Hard boundaries

- New visual/product experiments live in the **normal app Lab** first.
- **Home/Main visual layout stays untouched unless Joey explicitly approves a Home rollout.** Authorized persistence/sync/Fitbit/Daily Mission logic may run on Main.
- Park 3.0 source remains frozen rollback/reference.
- Park 3.1 is the current Daily Mission Lab iteration and does not overwrite Park 3.0.
- Do not auto-generate missing companion art. Missing native art is a Creator/approval task.
- Device-specific iOS/PWA visual issues are not fully closed without Joey's real-device confirmation.
- Do not deploy an Edge Function rewrite that references new environment-secret names until those secrets definitely exist.
- Do not add a second server-side authority that rewrites the whole `app_state.rpg` row from Fitbit cron. The browser reconciler intentionally merges after RPG cloud/local convergence so a background Fitbit job cannot race a newer phone edit.

## Connected project

- GitHub: `Kingkangaroos/Joe`
- Default branch: `main`
- Vercel project: `joe`
- Supabase project id: `ttxjsoahmtennnufgeqx`
- Lab: `lab.html`
- Park 3.0: `park3.html`, `park3.css`, `park3.js` — frozen source; current Lab host blocks its legacy mutation action
- Park 3.1: `park31.html`, `park31.css`, `park31.js`, host controller `park31-lab.js`
- Daily Windows experiment: `daily-windows.html`, `daily-windows.js`, `daily-windows-option-d.js`

## Automated regression gate — LIVE

`.github/workflows/smoke.yml` runs every `tests/*-smoke.js` on pushes and pull requests to `main`, using Node 22.

Durable coverage includes:
- exact Daily Mission membership versus `RPG_DEFAULT_SKILLS`;
- Park 3.1 interaction, level bands, Level 0, native asset integrity, public/private roster and PIN/manual-off routes;
- Park 3.0 frozen/read-only Lab host contract;
- Daily Mission Garden and Daily Windows direct-log behavior;
- Fitbit retrospective reconciliation, manual-off behavior, symmetric uncheck/recheck and full manual-cycle integration;
- retry-safe / exact-once Fitbit XP awards;
- single-snapshot Fitbit XP-audit indexing per reconciliation pass;
- authenticated cross-surface Fitbit reconciler loading plus Main boot-order ownership;
- authoritative public habit replay after cloud baseline;
- Main stale materialized `lastChecked` resurrection protection;
- Character dated public Daily Mission writes, exact-date Walking/Sleep manual-off symmetry and historical XP attribution;
- retirement of Character's obsolete v9.1 `rpg_daily_v1` → habitlog migration;
- authoritative Daily Mission reset;
- global streak net-activity + historical activity-date attribution + canonical habitlog activity;
- venture UTC timestamp → local calendar streak-day conversion;
- RPG sync scope and stale-realtime/pre-auth edit/deletion races;
- remote-state refresh events + legacy storage bridge + Main refresh contract;
- local civil-day contract across active day-key writers;
- shared JS cache revalidation contract;
- Health Trail, Chess and existing Lab/website regressions;
- Jarvis database action boundary and Vault-backed push-cron contract.

**Rule:** do not claim a new change is safe merely because a test file exists. Inspect the newest Actions run and exact Vercel deployment first.

## Latest verified functional checkpoint

Current production checkpoint:

- `4b9c1c5be03c3e0d53c8fccea4994023af41a59f` — `autohabit-reconcile.js` v11.7 single XP-audit snapshot; full GitHub smoke suite `success`; exact Vercel production deployment `dpl_HkEvziQpbVLQQzi5NeoD2QeAxeEL` is `READY`.

Recent locked checkpoints underneath it:
- `8a9fc3a51e0e0dfccbabf7a71855c470768bf550` — repo local civil-day contract; CI success + production READY.
- `7b3228f45e56843cf3cc02a63e292e95c381e72f` — venture completion after Amsterdam midnight counts on the correct local streak day; CI success + production READY.
- `257d69ea42dd3bf9fab982219a849f73a6fafe40` — Main Fitbit loader boot-order regression lock; CI success + production READY.
- `1f15c32cc013e2aeae7e171906095bb4a9401af7` — authenticated cross-surface Fitbit reconciliation loader test; CI success + production READY.
- `726438678a0cc6af7432c9a817528509b373a703` — Park 3.0 Lab mount read-only while source stays frozen.
- `bff6f9d482547110b096130b1b6ec7e0b0760c9b` — Main stale materialized habit-cache resurrection guard.
- `99efac426a2b48293b0865eb49eea00f0b79ace6` — full Fitbit auto → manual uncheck → manual recheck cycle.

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

`sync.js` v11.8 treats the day log as authoritative after the safe RPG cloud baseline: every public habit is replayed once baseline convergence is known, and replay runs again after later RPG remote applies.

`checkin.js` prevents Main's old v8.9 rendering fallback from turning stale `rpg_habits_v1.lastChecked` into new canonical history. `getHabits()` is wrapped read-only: if materialized `lastChecked` is absent from canonical day-log, Main never sees it as proof. Existing replay remains the writer.

Visual bands:
- 0–2 → Starter
- 3–4 → Apprentice
- 5–6 → Advanced
- 7–9 → Expert
- 10 → Master

## Habit XP versus habit level — LOCKED

A public Daily Mission completion can still write `+15 XP` to the character XP audit/activity log. That does **not** create a second habit level:

- habit-visible level comes from `getSkillLevel()` → canonical 0–10 habit score;
- Character Level sums only non-habit skill XP;
- Skills Total Level/average likewise excludes habits.

One legacy category-XP statistic still aggregates habit XP. Treat that as a separate product-definition question.

Jarvis `checkHabit` currently writes canonical completion/replay but does not itself manufacture the usual habit `+15 XP` event. This is no longer a correctness risk for Daily level or global streak because canonical `rpg_habitlog_v1` completion itself is independent activity evidence. Decide separately later whether Jarvis should create optional habit-XP audit events for category-XP consistency.

## Fitbit → Daily Missions retrospective reconciliation — v11.7

Locked behavior:
- Walking auto-completes at 10,000 steps;
- Sleep auto-completes at 420 minutes / 7 hours;
- later Fitbit finalization/correction can repair an older calendar day;
- public 0–10 level is replayed from full canonical history;
- deliberate manual uncheck remains deliberate;
- deliberate manual recheck clears suppression;
- retries/crashes do not duplicate XP.

`autohabit-reconcile.js` v11.7:
- scans every available Fitbit day through today;
- leaves threshold misses reopenable;
- fetches Fitbit and current RPG cloud baseline together;
- waits for safe sync/local convergence before mutation;
- writes genuinely missing qualified dates to `rpg_habitlog_v1`;
- recomputes through authoritative replay;
- respects `manual-off`;
- reruns on focus/foreground;
- maintains retry-safe XP award ledger `__xp_awarded_v1:<habit>:<date>`;
- migrates legacy already-confirmed canonical Walking/Sleep days conservatively as historically paid;
- detects XP already written before ledger-save crash;
- repairs the opposite crash window where canonical completion was saved before +15 XP;
- builds one Walking/Sleep XP audit index per reconciliation pass, so a near-cap XP log is not reparsed/rescanned for every Fitbit date.

Legacy ambiguity marker: `__retrospective_v2_migrated=true`.  
XP award-ledger migration marker: `__xp_ledger_v1_migrated=true`.

### Authenticated loader

The reconciler is no longer Main-only. `auth.js` may load it after authentication when:
- an RPG cloud-sync registry exists;
- `getCharacter`, `addXP` and `recomputeHabitFromLog` are present.

Pages without the RPG engine cannot run it. Main retains its synchronous legacy-check blocker and owns boot ordering, so the old today/yesterday checker cannot race the modern module.

### Manual override routes — symmetric

- Main current/backdated: protected;
- Park 3.1 host controller: protected;
- Character current-day `checkHabit`/`uncheckHabit`: centrally protected;
- Character dated Daily Quest: wrapped by `sync.js` v11.8; exact edited date controls suppression and `±XP` carries `(YYYY-MM-DD)`;
- Daily Windows direct route: self-contained `rpg_autohabit_v1` fallback in v11.73.

### Live migration proof — still pending natural RPG session

Do **not** force with SQL.

Read-only live audit on 4 Sep after the 10:15 Amsterdam Fitbit sync:
- `health_fitbit.updated_at = 2026-09-04 08:15:05.897+00`;
- `rpg.updated_at = 2026-09-03 22:32:45.196+00`;
- Fitbit data is present through 4 Sep;
- exactly 12 Fitbit-qualified canonical completions are still absent: 7 Walking + 5 Sleep;
- therefore no suitable current authenticated RPG session has yet completed the migration after that Fitbit update.

Missing Walking dates:
- 2026-07-18
- 2026-07-20
- 2026-07-21
- 2026-07-27
- 2026-07-31
- 2026-08-02
- 2026-08-31

Missing Sleep dates:
- 2026-07-19
- 2026-07-22
- 2026-07-23
- 2026-07-30
- 2026-09-03

Expected first natural current authenticated RPG reconciliation against this state:
- +12 canonical dates;
- Walking: +105 audit XP; authoritative score remains **9** on 4 Sep because 3 Sep is now a completed missed Walking day; current streak remains 0;
- Sleep: +75 audit XP; authoritative score **0 → 1**; streak **0 → 1** with latest check 3 Sep;
- +180 total habit audit XP;
- retrospective + XP-ledger migration markers become set.

Current XP log is 194/200 rows. Twelve new awards would evict only six oldest retained rows. Read-only inspection found those six are ordinary positive Walking/Sleep/Good Deed entries, not undo/manual-off evidence. The durable XP ledger protects Walking/Sleep exact-once state before new awards. Do **not** raise `MAX_LOG` merely for this migration; that would make the hot whole-RPG sync row larger for little correctness benefit.

After Joey naturally opens a current authenticated RPG surface, inspect Supabase read-only and compare against this expected state. Never manufacture proof.

## Authoritative Reset & start fresh

A confirmed reset:
- prunes pre-reset canonical completion dates;
- suppresses pruned Fitbit-backed dates so they cannot immediately return;
- preserves earned XP history;
- recomputes remaining post-reset log;
- emits refresh event for dependent Lab views.

Regression: `tests/habit-reset-smoke.js`.

## Global streak — v7.8

Current activity sources:
- canonical public Daily Mission completion from `rpg_habitlog_v1`;
- XP netted per skill per actual activity day;
- completed venture steps;
- explicit evening check-in.

Consequences:
- canonical mission counts even if writer emitted no XP event;
- `+15/−15` pair cancels only that mission's XP contribution;
- another legitimate activity source on the date keeps the day active;
- historical `(YYYY-MM-DD)` audit reason is preferred over later physical XP write date;
- completed venture `doneAt` remains an absolute ISO timestamp but is converted to the **local calendar day** before streak attribution, so 00:30 Amsterdam cannot count as yesterday;
- older streak history outside retained evidence is preserved;
- historical best never shrinks.

Regressions:
- `tests/streak-net-activity-smoke.js`
- `tests/streak-backdated-xp-smoke.js`
- `tests/main-habitlog-authority-smoke.js`

## Cloud sync + live refresh — v11.8

`sync.js` maintains persistent dirty journal + monotone high-water mark so older remote/realtime snapshots cannot roll newer local state backwards.

Protected races:
- local edit before Auth/initial cloud pull;
- stale initial remote snapshot;
- confirmed cloud healing push;
- stale realtime echo after newer local/cloud state;
- local deletion before Auth that must not resurrect.

A real remote apply emits modern `gamenfy:remote-state-applied` plus one key-less synthetic storage event for legacy views. The bridge cannot schedule an echo write because sync only reacts to matching non-empty keys.

v11.8 additionally owns Character's dated public Daily guard and retires the obsolete Character v9.1 backfill.

## Calendar-day contract — LOCKED

Daily/state keys use local civil dates. Absolute event/audit timestamps may remain ISO UTC.

Recent audit covered Main, Character, Water, Daily Windows, Park 3.1, Health/Topbar, Finance, Quests, Ladders, Push and shared engines.

Important distinction:
- `updated_at`, `closedAt`, `doneAt`, finance entry/close timestamps and exports may be ISO timestamps;
- any value used as a Gamenfy day key must be local-calendar derived.

Daily Garden contains an old UTC fallback, but the supported normal Lab mount always receives local `viewedDateStr()` from `park31-lab.js`; there is no standalone Daily Garden page. Regression `tests/local-calendar-contract-smoke.js` locks the active contract.

## Fitbit ingest — audited healthy

Deployed `fitbit-sync` v16:
- cron: every hour at minute :15;
- Europe/Amsterdam civil date;
- sleep assigned to wake/end civil date, not bedtime/start;
- multiple sleep sessions ending same date are summed;
- latest observed source row updated at 10:15 Amsterdam on 4 Sep.

Old `health-sync` and `fitbit-intraday` routes are JWT-protected HTTP 410 stubs; do not revive them accidentally.

### Why Fitbit sync does not directly rewrite RPG

`app_state.rpg` is a merged whole-row JSON document. A background Fitbit cron that reads then rewrites that whole row could race a newer phone/local dirty edit and recreate the rollback class already fixed in `sync.js`.

Keep Fitbit ingest as health-source authority only. Let the authenticated reconciler merge canonical Daily Mission changes after RPG cloud/local convergence. If this architecture changes later, use a separate narrow canonical table or real compare-and-swap/transactional design rather than another whole-row writer.

## Push delivery — audited healthy, security hardening partly complete

Cron jobs:
- Fitbit: `15 * * * *`;
- morning push poll: every 10 min in broad UTC morning block;
- evening push poll: every 10 min in broad UTC evening block.

`send-daily-push` converts to Europe/Amsterdam, chooses one deterministic jitter target per mode/day, deduplicates with `push_jitter_state`, respects settings and skips evening when day is closed.

### Push cron auth — HARDENED

Both morning/evening cron commands now resolve their request authsecret from Supabase Vault. Read-only verification found zero literal copies of that secret in cron command text, and the first natural post-migration cron execution succeeded.

`pg_net` remains in `public` intentionally for now: dependency audit confirmed Fitbit + both push scheduler routes use it. Do not move/drop it blindly merely to silence the advisor.

Durable SQL: `server/database/push-cron-vault.sql`.

### Edge Function credential hardening — OPEN

Security sweep found server-only credentials embedded directly in deployed source for:
- `send-daily-push`;
- `jarvis`.

Never copy values into repo/docs/chat.

Migration contract:
1. create Supabase Edge Function environment secrets;
2. change functions to `Deno.env.get(...)` and fail closed when absent;
3. deploy and verify auth/normal operation;
4. rotate old credentials after successful env-secret deployment.

Current Supabase connector can deploy functions but exposes no secret-management operation. Plugin discovery on 4 Sep found no additional connected Supabase secret-management capability. Therefore do **not** deploy the env rewrite yet.

Durable instructions:
- `server/send-daily-push/README.md`
- `server/jarvis/README.md`

## Jarvis Daily Mission boundary

The deployed Jarvis Edge Function still has membership drift:
- Budgeting is not marked as a habit;
- Good Deed is missing from its skill map;
- Grounding is still marked as a habit.

Do not redeploy the stale source merely to fix this map while its provider credential is still embedded.

Database defense-in-depth is live:
- `public.gamenfy_filter_jarvis_actions()` is a `SECURITY INVOKER` BEFORE trigger on the `jarvis_actions` app-state row;
- it allows public `checkHabit` only for the canonical 11;
- rejects Grounding/private Daily routes and invalid explicit dates;
- preserves queue order and unrelated action types;
- existing owner RLS remains authoritative;
- real queue audit found 0 pending executable actions.

This prevents invalid stale actions but cannot make the old Edge Function generate missing valid Budgeting/Good Deed actions. Finish both map + secret migration together when secret management is available.

Durable SQL: `server/database/jarvis-action-guard.sql`.

## Supabase security advisories

Current interpretation:
- `public.integration_tokens` RLS enabled/no client policy — intentional service-role-only boundary; do not add a permissive client policy.
- private backup table RLS/no policy — informational.
- `pg_net` in `public` — advisor acknowledged, but active scheduler dependency verified; do not blindly move it.
- Auth leaked-password protection disabled — enable later with an authorized Auth configuration capability.

Do not introduce `SECURITY DEFINER` or permissive RLS to work around access errors.

## Cache/PWA correctness — LOCKED

`sw.js` is push-only: no fetch/cache handler.

`vercel.json` serves own `*.js` with:
`Cache-Control: no-cache, must-revalidate`

Daily Windows explicitly points at `daily-windows.js?v=11.73`.

Regression: `tests/cache-revalidation-smoke.js`.

## Park 3.0 — frozen rollback, Lab read-only

`park3.html/css/js` remain untouched rollback/reference.

Its old Complete/Undo writer predates modern Walking/Sleep suppression + XP contracts. Current `park2.js` host therefore blocks only `#p3Action` in capture phase while keeping cards/detail/visual preview usable and labels the mount read-only. Current mission updates belong to Park 3.1.

Regression: `tests/park2-smoke.js`.

## Park 3.1 — current Lab state

Park 3.1 displays exact 11 canonical public Daily Missions plus visibly separate 2 private dailies.

Asset truth:
- 110 native Park 3.1 WebPs = 9 public sets ×10 + 2 private sets ×10;
- missing native public ten-level sets: Budgeting and Meditation;
- Budgeting uses labelled Park 2 fallback;
- Meditation uses labelled Park 2 staged fallback.

Do not fabricate replacements. See `img/lab/park31/ASSET-MAP.md`.

Interaction:
- short tap opens detail;
- `− / +` preview is read-only;
- Complete/Undo changes real state;
- 560 ms hold shortcut;
- >12 px movement cancels hold;
- public writes route through host canonical controller;
- private writes retain PIN route;
- HELP and level-up celebration remain.

## Health Trail / Health Insights

Read-only Lab work exists for the D-score replacement / health-advice direction.

Health Trail prototype:
- 70% public Daily Mission average;
- 30% available Fitbit recovery;
- sleep/HRV/resting-HR vs personal recent baseline;
- missing Fitbit signals omitted rather than counted as failure.

Health Insights remains non-diagnostic/read-only: surface trends and practical low-risk suggestions rather than medical diagnoses. Keep Home unchanged until explicitly approved.

## Other current facts

### Chess
Already implemented: XP, eleven tiers/gates, assessment, logging and Lab visuals. Do not duplicate.

### iOS/PWA navigation
Bottom nav can visually drift upward while scrolling on iOS 26 standalone PWA. Device-dependent/open. Do not stack transforms without real-device evidence.

## Next build sequence

1. After Joey naturally opens any current authenticated RPG surface, inspect Supabase read-only for the expected 12 Fitbit backfills + migration markers; do not force migration with SQL.
2. Keep canonical writer/migration/calendar/exact-once invariants locked in CI; do not add alternate whole-RPG writers.
3. When a secure secret-management path is available, migrate `send-daily-push` and `jarvis` server-only credentials to environment secrets; in the same Jarvis deployment fix Budgeting/Good Deed/Grounding membership, verify, then rotate old credentials.
4. Keep Park 3.0 source frozen/read-only and all current mission writes in Park 3.1/current controllers.
5. Real-device verify the original state rollback and iOS bottom-nav issues when Joey is available.
6. Decide separately whether category-XP should exclude habits or Jarvis should emit optional +15 habit audit XP.
7. Budgeting + Meditation native Park 3.1 ten-level art remains Creator work.
8. Keep Home visual layout unchanged without explicit rollout approval.
9. Treat convincing locomotion as real animation/frame asset work, not static-image wobble.
10. If all blockers remain device/secret/Creator-bound, continue targeted invariant/performance audits or Lab-only Health Insights work rather than broad speculative redesign.

## Definition of done for current Daily Mission layer

- Main, Character, Park 3.1, Daily Windows and Jarvis converge on canonical public day-log.
- Park 3.0 cannot mutate current mission state from Lab.
- Public roster = canonical 11; private dailies separate.
- Public 0–10 levels come from authoritative replay; no weekly reset.
- Stale materialized `lastChecked` cannot resurrect canonical history.
- Manual/backdated/cloud/Fitbit changes converge.
- Fitbit cannot fight deliberate Walking/Sleep undo or duplicate manual recheck XP.
- Late Fitbit correction can restore legitimate older dates.
- Fitbit XP is retry-safe/exact-once.
- Reset cannot be undone by old history.
- Character/Total Level do not double-count habit XP.
- Global streak reflects real canonical/net activity date and local civil day.
- Remote cloud applies refresh dependent views without reload.
- Own JS revalidates after deploy; SW remains push-only.
- Automatic CI is green for newest functional commit.
- Production deployment is READY for newest functional commit.
- Device-only issues stay open until real iPhone/PWA confirmation.