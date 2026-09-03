# Gamenfy — Active Bugs / Verification Needed

> Shared handoff for Claude + ChatGPT. Technical fixes can be regression-covered automatically, but device/live-user-data behavior is not fully closed until Joey's real app state confirms it.

Last refreshed: 2026-09-04 by ChatGPT (OpenAI)

## 1. Daily Missions — intermittent state rollback
**Reported:** 30 Aug 2026  
**Status:** **TECHNICALLY FIXED + CI-LOCKED; real-device confirmation still useful.**

Original symptom: a backdated mission could appear checked, then return unchecked after navigating between Main and Skills.

Current `sync.js` uses a persistent dirty journal + monotone high-water mark so stale initial/realtime cloud snapshots cannot overwrite newer local edits or resurrect pre-auth deletions.

**Remaining verification:** previous-day mission edit → Skills → Main → background/reopen on Joey's installed PWA. If stable, move fully to resolved history.

---

## 2. Fitbit → Daily Missions retrospective reconciliation
**Reported/clarified:** 3 Sep 2026  
**Status:** **TECHNICAL CHAIN FIXED + CI/PRODUCTION VERIFIED; live cloud migration proof still pending natural Main use.**

Locked behavior:
- Walking auto-completes at 10,000 steps;
- Sleep auto-completes at 420 minutes / 7 hours;
- later Fitbit finalization can repair older qualified days;
- public 0–10 levels replay from `rpg_habitlog_v1`;
- no weekly reset;
- manual undo must not be fought by Fitbit;
- manual recheck clears suppression;
- Fitbit XP is exact-once across retries/crashes.

`autohabit-reconcile.js` v11.6 scans all available Fitbit dates, waits for safe sync convergence, writes genuinely missing qualified dates, replays canonical state, respects `manual-off`, reruns on foreground and keeps a retry-safe XP ledger.

Full integration regression proves:
**auto +15 → manual uncheck −15 → Fitbit blocked → manual recheck +15 → later Fitbit pass adds 0 extra XP.**

### Manual override routes
- Main current/backdated: protected;
- Park 3.1 host: protected;
- Character current-day: protected centrally;
- Character dated Daily Quest: protected by `sync.js` v11.8 with exact edited date + historical `(YYYY-MM-DD)` XP attribution;
- Daily Windows: self-contained `manual-off` fallback in v11.73.

### Live-data proof as of 4 Sep 2026
No history has been force-written through SQL.

Read-only Supabase audit showed:
- RPG cloud row still at `2026-09-03 11:12:10 UTC` with retrospective migration markers absent;
- Fitbit source continued updating normally and was healthy through the 00:15 Amsterdam hourly sync;
- latest sync touched 13 days, reported zero errors and did not require re-authentication;
- 12 Fitbit-qualified public completions are legitimately absent from the old canonical RPG history: 7 Walking + 5 Sleep;
- no historical Walking/Sleep undo XP evidence exists for those 12 candidates.

Expected first natural authenticated Main reconciliation against that state:
- 12 canonical backfills;
- Walking: +7 dates, +105 audit XP, level stays 10, streak expected 2 → 5;
- Sleep: +5 dates, +75 audit XP, level expected 0 → 1, streak 0 → 1;
- total +180 habit audit XP;
- both retrospective migration markers become set.

**Still open by design:** verify the actual cloud row after Joey naturally opens current Main. Never manufacture this proof with SQL.

---

## 3. Main legacy `lastChecked` → habitlog resurrection
**Status:** **FIXED + CI-LOCKED + PRODUCTION READY.**

Audit found Main's old v8.9 `hlogHas()` fallback could treat `rpg_habits_v1.lastChecked` as authority and write that date back into canonical `rpg_habitlog_v1` during rendering.

Now that `rpg_habitlog_v1` is cloud-synced/canonical, a stale materialized `lastChecked` must never be able to recreate a deliberately removed date.

`checkin.js` v7.7 installs a read-only `getHabits()` guard before Main boot:
- a materialized `lastChecked` absent from canonical day-log is hidden/rebased to the newest real canonical date;
- no canonical dates ⇒ exposed `lastChecked=null` and no ghost streak;
- valid canonical `lastChecked` is unchanged;
- the guard itself writes nothing; existing authoritative replay remains the writer.

Regression: `tests/main-habitlog-authority-smoke.js` simulates Main's actual legacy fallback and proves stale Walking/Sleep dates cannot resurrect.

Functional checkpoint `bff6f9d482547110b096130b1b6ec7e0b0760c9b` passed full CI and deployed production `READY`.

---

## 4. Character dated Daily Quest bypass
**Status:** **FIXED + CI-LOCKED + PRODUCTION READY.**

Character had a second public dated Daily control that wrote `rpg_habitlog_v1` directly. Before the fix:
- Walking/Sleep backdated undo/recheck bypassed exact-date `manual-off` symmetry;
- `±15 XP` for a backdated day lacked `(YYYY-MM-DD)`, so global streak could attribute it to the later write day.

`sync.js` v11.8 wraps only public dated Daily Missions:
- canonical day-log remains source of truth;
- Walking/Sleep exact edited date sets/clears suppression;
- replay runs after mutation;
- XP audit reason carries the real activity date;
- private quests delegate to Character's existing PIN/private route.

Regression: `tests/character-dated-daily-smoke.js`.

---

## 5. Character legacy v9.1 Daily backfill
**Status:** **RETIRED + CI-LOCKED.**

Character still contains an old one-time migration that scans legacy `rpg_daily_v1:<date>.quests` and copies public completions into `rpg_habitlog_v1` after a delay.

That migration is obsolete because `rpg_habitlog_v1` is now itself cloud-synced and canonical. Its old local-only flag could disappear on a clean/new device, allowing stale legacy data to resurrect a deliberately removed historical mission.

Modern `sync.js` v11.8 sets `rpg_daily_habit_backfill_v1=1` before Character's delayed migration can run. It deletes no legacy data; it only prevents old data from becoming authority again.

Regression: `tests/character-dated-daily-smoke.js` locks retirement ordering.

---

## 6. Global streak ghost / wrong-date / Jarvis writer bugs
**Status:** **FIXED + CI-LOCKED + PRODUCTION READY.**

Current `checkin.js` v7.7 activity sources:
- canonical public Daily Mission completion from `rpg_habitlog_v1`;
- XP netted per skill per actual activity date;
- completed venture steps;
- explicit evening check-in.

This closes three classes of error:
- `+15/-15` mission reversal no longer leaves a ghost day;
- historical XP with `(YYYY-MM-DD)` counts on the real day, not later write date;
- Jarvis can write a valid canonical Daily Mission without a habit-XP event and that completion still counts as real streak activity.

A dated `checkHabitFor()` wrapper schedules a post-write streak/UI refresh without taking ownership of the actual mission mutation.

Regressions:
- `tests/streak-net-activity-smoke.js`
- `tests/streak-backdated-xp-smoke.js`
- `tests/main-habitlog-authority-smoke.js`

---

## 7. Park 3.0 legacy mutation route from Lab
**Status:** **FIXED AT HOST BOUNDARY + CI-LOCKED + PRODUCTION READY.**

Park 3.0 is frozen rollback/reference, but its old iframe still contained a legacy Complete/Undo action that directly mutated `rpg_habitlog_v1` without the modern Walking/Sleep `manual-off` and XP contracts.

Do not rewrite `park3.html/css/js`; rollback/reference source must stay intact.

Current `park2.js` Lab host:
- still mounts Park 3.0 for cards/detail/visual reference;
- labels the mount read-only/frozen rollback;
- intercepts only the legacy `#p3Action` mutation click in capture phase;
- keeps the action labelled `Reference only · use Park 3.1`;
- leaves current mission mutation to Park 3.1/canonical controllers.

Regression: `tests/park2-smoke.js`.

Functional checkpoint `726438678a0cc6af7432c9a817528509b373a703` passed full CI and is Vercel production `READY`.

---

## 8. Jarvis habit XP audit consistency
**Status:** **NON-BLOCKING PRODUCT/CONSISTENCY DECISION.**

Jarvis `checkHabit` writes canonical completion and replay but currently does not create the usual public habit `+15 XP` audit event.

This no longer affects:
- visible Daily Mission 0–10 level;
- Character Level / Total Level;
- global streak, because canonical habitlog is independent activity evidence.

It can still make the legacy category-XP statistic differ depending on which writer completed the mission. Do not modify silently; decide later whether Jarvis should create optional habit audit XP or category-XP should exclude habits entirely.

---

## 9. Daily Mission authoritative reset
**Status:** **FIXED + CI-LOCKED.**

Reset prunes pre-reset canonical completion dates, protects pruned Fitbit-backed dates from automatic resurrection, preserves earned XP history, replays remaining dates and refreshes dependent views.

Regression: `tests/habit-reset-smoke.js`.

---

## 10. Daily Mission membership / source of truth
**Status:** **FIXED + CI-LOCKED.**

Canonical public 11:
Budgeting, Sleep, Nutrition, 10k Steps, Brush Teeth 2×, Household, Meditation, Gratitude, Good Deed, Screen Time, Cold Shower.

Private/PIN-backed and separate:
Weed Control / Gardening; No Porn / Discipline.

Public completion source: `rpg_habitlog_v1`. Public 0–10 cache: `rpg_habits_v1` rebuilt by authoritative replay. Tennis, Reading and Finger Whistling are normal skills; Grounding is disabled.

---

## 11. Habit XP versus visible levels
**Status:** **AUDITED — NO DOUBLE COUNT IN CHARACTER/TOTAL LEVEL.**

Habit-visible level uses canonical 0–10 score. Character Level and Skills Total Level/average explicitly exclude `isHabit` skills.

One legacy category-XP statistic includes habit XP. Treat that as a separate product-definition decision, not a Daily Mission correctness bug.

---

## 12. Fitbit ingest / sleep calendar mapping
**Status:** **AUDITED HEALTHY.**

Deployed `fitbit-sync` v16:
- syncs hourly at minute :15;
- uses `Europe/Amsterdam` civil-day semantics;
- daily metrics are stored on their civil calendar date;
- sleep is assigned to the wake/end civil date, not bedtime/start date;
- multiple sleep sessions ending on one civil date are summed;
- latest observed sync returned zero errors and `needs_reauth=false`.

Old `health-sync` and `fitbit-intraday` Edge Functions are JWT-protected and intentionally return HTTP 410; they are not active alternate ingest paths.

---

## 13. Edge Function credentials embedded in deployed source
**Status:** **OPEN SECURITY HARDENING — DO NOT COPY VALUES INTO REPO.**

Security sweep found server-only credentials embedded directly in the currently deployed source for:
- `send-daily-push`;
- `jarvis`.

No credential values belong in this repo, issues, handoffs or chat summaries.

Required remediation:
1. create dedicated Supabase Edge Function environment secrets;
2. rewrite each function to read server-only values through `Deno.env.get(...)` and fail closed when missing;
3. deploy and verify auth + normal behavior;
4. rotate the old credential values only after the env-secret version is proven working.

Current connector can deploy functions but cannot create/manage Supabase function secrets, so an env rewrite is intentionally **not** deployed yet; doing so could break production.

Durable instructions:
- `server/send-daily-push/README.md`
- `server/jarvis/README.md`

`send-daily-push` itself is functionally guarded: broad 10-minute cron polls are internally constrained to one jitter target per morning/evening mode/day, deduplicated by `push_jitter_state`, and evening is skipped if the day is already closed.

---

## 14. Supabase security advisories
**Status:** **OPEN LOW/ADMIN PRIORITY — DO NOT BLINDLY MODIFY.**

Latest security advisor notes:
- `public.integration_tokens`: RLS enabled with no client policy. This is intentional for service-role-only token storage; do not add a permissive client policy.
- private backup table: RLS enabled with no policy; informational.
- `pg_net` extension is installed in `public`; advisor recommends moving it, but audit cron/network dependencies before any migration.
- Auth leaked-password protection is disabled; enable later through a capability that can safely update Supabase Auth configuration.

Do not use `SECURITY DEFINER` or permissive RLS as a shortcut around any access issue.

---

## 15. Push scheduler / subscriptions
**Status:** **AUDITED HEALTHY.**

Current cron:
- Fitbit: `15 * * * *`;
- morning push poll: every 10 min in its broad UTC morning block;
- evening push poll: every 10 min in its broad UTC evening block.

The Edge Function itself resolves Europe/Amsterdam time and one jitter target per window. Read-only state showed 2 registered push subscriptions and exactly one morning + one evening mode marker for 3 Sep 2026. No duplicate-send evidence found.

The push client uses a public VAPID key, which is browser-safe. Server-only VAPID/private/request/AI credentials must remain server-side and are covered by item 13.

---

## 16. JS/PWA stale logic after deploy
**Status:** **FIXED + CI-LOCKED + PRODUCTION READY.**

`sw.js` is push-only: no fetch/cache handler. `vercel.json` serves own `*.js` with `Cache-Control: no-cache, must-revalidate`, so old query labels cannot silently pin stale logic. Daily Windows explicitly points at `daily-windows.js?v=11.73`.

Regression: `tests/cache-revalidation-smoke.js`.

---

## 17. iOS/PWA bottom navigation drifts into content while scrolling
**Reported:** 30 Aug 2026  
**Status:** **OPEN — DEVICE-DEPENDENT.**

Do not stack speculative transforms/`!important` fixes. If still reproducible, test an iOS-standalone-only shell/internal-scroller architecture and validate on Joey's actual installed PWA.

---

## 18. Park 3.1 asset gap
**Status:** **OPEN CREATOR TASK, NOT A LOGIC BUG.**

110 native Park 3.1 WebPs = 9 public sets ×10 + 2 private sets ×10. Missing native public ten-level sets:
- Budgeting — current labelled Park 2 fallback;
- Meditation — current labelled Park 2 staged fallback.

Do not fabricate replacements. See `img/lab/park31/ASSET-MAP.md`.

---

## 19. CI / deployment gate
**Status:** **LIVE.**

`.github/workflows/smoke.yml` runs every `tests/*-smoke.js` on pushes/PRs to `main` with Node 22.

Do not call a technical change complete until:
1. newest relevant GitHub Actions run is `completed/success`;
2. Vercel production deployment for that exact/latest commit is `READY` when deployment matters;
3. device/live-data behavior is separately verified when applicable.

Current latest functional checkpoint before documentation-only security notes:
`726438678a0cc6af7432c9a817528509b373a703` — full CI success + Vercel production `READY`.
