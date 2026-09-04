# Gamenfy — Active Bugs / Verification Needed

> Shared current-state handoff for Claude + ChatGPT. This file intentionally contains only real open verification/blockers plus a compact regression-locked section. Historical implementation detail belongs in `BUILDER-NOW.md` and git history.

Last refreshed: 2026-09-04 by ChatGPT (OpenAI)

## Current production baseline

Latest verified functional production head:
- `54b24ba73879f04df3805c4e93d688b77c8d9d9e`
- functional Main loader change introduced at `cca192c10723b629943b38adedcf3f1964b2eadb`
- GitHub smoke suite: `completed/success` (run 125)
- exact Vercel production deployment: `dpl_2mDncLGhBWHjAstPnKnFeTEY3gm5`
- deployment state: `READY`, target `production`

This production head closes both dynamic Fitbit reconciler loader failure modes. Cross-surface loading in `auth.js` and Main's synchronous loader in `checkin.js` now record success only after the reconciler script actually fires `onload`; failed script nodes are removed and bounded retries remain possible. Main still disables the legacy today/yesterday writer synchronously before the network request, so retry hardening does not reopen the old writer race. Both loaders request `autohabit-reconcile.js` v11.7. It retains Health Trail v1.28 recent-calendar evidence hardening, the exact 420-minute / 7-hour Sleep Daily Mission, stale-source gating, stable refresh behavior and the full Daily Mission/Fitbit correctness chain underneath it.

Later commits may be read-only audit/test/documentation work; do not confuse a docs-only head with the latest functional behavior unless the full production gates are reverified.

---

## 1. Daily Missions — real-device rollback confirmation

**Reported:** 30 Aug 2026  
**Status:** **TECHNICALLY FIXED + CI-LOCKED; installed-iPhone confirmation still useful.**

Original symptom: a backdated mission could appear checked and later return unchecked after navigation/reopen.

Current `sync.js` protects:
- local edits before Auth/initial cloud pull;
- stale initial remote snapshots;
- stale realtime echoes;
- pre-auth deletions;
- whole-row healing through persistent dirty journal + monotone high-water mark.

**Remaining device proof:** edit a previous-day mission → Skills → Main → background/reopen installed PWA. If stable on Joey's real device, this can move fully to resolved history.

Do not stack another sync writer or speculative workaround unless this still reproduces.

---

## 2. Fitbit → Daily Missions retrospective migration

**Reported/clarified:** 3 Sep 2026  
**Status:** **TECHNICAL CHAIN FIXED + CI/PRODUCTION VERIFIED; natural live cloud migration proof still pending.**

Locked behavior:
- Walking threshold = 10,000 steps;
- Sleep threshold = 420 minutes / 7 hours;
- later Fitbit finalization/correction repairs older qualified days;
- `rpg_habitlog_v1` is authoritative;
- 0–10 score replays from full canonical history;
- no weekly reset;
- deliberate manual undo stays undone via `manual-off`;
- deliberate manual recheck clears suppression;
- retry/crash paths cannot duplicate +15 XP.

Current reconciler: `autohabit-reconcile.js` v11.7.

v11.7 snapshots the retained Walking/Sleep XP audit **once per reconcile pass** instead of rescanning the near-cap XP log for every Fitbit date. Regression explicitly locks one `getCharacter()` audit read per pass.

### Authenticated surfaces

The reconciler is not Main-only anymore. Any authenticated surface loading `xp.js` registers the canonical `rpg` sync on DOM-ready; the loader may activate once RPG sync + required XP engine functions exist. Pages without the RPG engine cannot activate it.

Main retains the synchronous legacy-check blocker so the old today/yesterday checker cannot race the modern module. Loader reliability is now symmetric:
- cross-surface `auth.js` ownership is set only after successful script `onload`;
- Main `checkin.js` also keeps ownership synchronous but records successful session loading only after `onload`;
- failed script nodes are removed on `onerror`;
- temporary download/network failures receive bounded retry with capped backoff;
- loading-state dedupe prevents concurrent ready events from double-injecting;
- neither path restores the obsolete legacy writer after a modern script failure.

Regression coverage includes `tests/autohabit-session-loader-smoke.js` and `tests/main-autohabit-loader-retry-smoke.js`. The streak-only tests discover the Main loader boundary structurally rather than pinning a loader version comment.

### Live read-only proof on 4 Sep 2026

No history has been force-written through SQL.

Latest observed cloud state during the 4 Sep audit:
- `health_fitbit.updated_at = 2026-09-04 14:15:08.02+00` (16:15 Amsterdam);
- `rpg.updated_at = 2026-09-03 22:32:45.196+00`;
- Fitbit data exists through 4 Sep;
- exactly **12** Fitbit-qualified canonical completions are still absent;
- retrospective and XP-ledger migration markers are still unset;
- there is no evidence of a half-finished XP-ledger migration.

Missing Walking — 7:
- 2026-07-18
- 2026-07-20
- 2026-07-21
- 2026-07-27
- 2026-07-31
- 2026-08-02
- 2026-08-31

Missing Sleep — 5:
- 2026-07-19
- 2026-07-22
- 2026-07-23
- 2026-07-30
- 2026-09-03

Expected first natural current authenticated RPG reconciliation against this state:
- +12 canonical dates;
- Walking +105 audit XP;
- Walking authoritative score remains **9** on 4 Sep because 3 Sep becomes a completed missed Walking day; current streak remains 0;
- Sleep +75 audit XP;
- Sleep authoritative score **0 → 1**, streak **0 → 1**, latest check 3 Sep;
- +180 total habit audit XP;
- retrospective + XP-ledger migration markers set.

### Durable read-only audit

Use `server/database/fitbit-reconcile-audit.sql` for future cloud proof. It is regression-locked by `tests/fitbit-reconcile-audit-smoke.js` and explicitly follows the real canonical JSON orientation `rpg_habitlog_v1[habit_id][YYYY-MM-DD]`. It reports qualified source value, canonical presence, `manual-off`, XP-ledger state, migration markers and cloud timestamps without writing anything.

### XP-log capacity audit

Current retained XP log at that audit = 194/200. Twelve awards would evict six oldest rows. Read-only inspection showed those six are ordinary positive Walking/Sleep/Good Deed records, not undo/manual-off evidence. Existing canonical history + durable XP-ledger protect correctness.

**Decision:** do not raise `MAX_LOG` just for this migration; it would enlarge the hot whole-RPG sync row with little correctness benefit.

### Remaining proof

After Joey naturally opens a current authenticated RPG surface, inspect Supabase read-only with the durable audit for the 12 additions + migration markers. Never manufacture proof with SQL.

---

## 3. Jarvis Edge Function membership + credential migration

**Status:** **OPEN DEPLOY BLOCKER; unsafe output is mitigated at database boundary.**

Current deployed Jarvis membership drift:
- Budgeting is not marked as a habit;
- Good Deed is missing from the deployed skill map;
- Grounding is still marked as a habit.

The deployed function also still embeds a server-only AI-provider credential in source.

Do **not** redeploy merely to fix membership while re-embedding the same credential.

Required safe deployment:
1. create dedicated Supabase Edge Function environment secret;
2. switch provider credential access to `Deno.env.get(...)` and fail closed if absent;
3. simultaneously fix canonical Daily Mission membership;
4. deploy with `verify_jwt=true` + owner validation intact;
5. verify Budgeting + Good Deed generation and Grounding/private rejection;
6. rotate old credential only after env-secret version works.

Current Supabase connector exposes Edge Function deployment but **no secret-management operation**. Plugin discovery on 4 Sep found no additional connected Supabase secrets capability. This remains genuinely blocked until a secure secret-management path exists.

### Database defense-in-depth — LIVE

`public.gamenfy_filter_jarvis_actions()`:
- BEFORE trigger on `app_state` `jarvis_actions` row;
- `SECURITY INVOKER`, never `SECURITY DEFINER`;
- existing owner RLS remains authoritative;
- allows public `checkHabit` only for canonical public 11;
- rejects Grounding/private Daily routes and invalid explicit habit dates;
- preserves queue order and unrelated action types.

Real queue audit found 0 unconsumed executable actions.

This guard blocks unsafe stale actions but cannot make the old function create missing valid Budgeting/Good Deed actions.

Durable references:
- `server/jarvis/README.md`
- `server/database/jarvis-action-guard.sql`
- `tests/server-boundary-hardening-smoke.js`

---

## 4. send-daily-push Edge Function credential migration

**Status:** **PARTLY HARDENED; Edge Function source secret migration still open.**

Completed:
- both morning/evening cron commands now read request auth from Supabase Vault;
- read-only verification found 0 literal request-secret copies in cron command text;
- first natural post-migration cron execution succeeded.

Still open:
- deployed `send-daily-push` source contains server-only credential material that must move to Edge Function environment secrets;
- rotate old value only after env-secret deployment is verified.

Same tooling blocker as Jarvis: current connector has no Supabase Edge Function secret-management operation.

Durable reference:
- `server/send-daily-push/README.md`
- `server/database/push-cron-vault.sql`

---

## 5. iOS/PWA bottom navigation drifts into content

**Reported:** 30 Aug 2026  
**Status:** **OPEN — DEVICE-DEPENDENT.**

Observed on iOS 26 standalone PWA: fixed bottom navigation can visually drift upward while scrolling.

Do not stack speculative transforms / `!important` patches. If still reproducible, test an iOS-standalone-only shell/internal-scroller architecture and verify on Joey's installed PWA.

---

## 6. Park 3.1 native asset gap

**Status:** **OPEN CREATOR TASK, NOT A LOGIC BUG.**

Native Park 3.1 inventory:
- 110 WebPs = 9 public sets ×10 + 2 private sets ×10.

Missing native public ten-level sets:
- Budgeting — currently labelled Park 2 fallback;
- Meditation — currently labelled staged Park 2 fallback.

Do not fabricate replacements. See `img/lab/park31/ASSET-MAP.md`.

---

## 7. Jarvis habit XP audit consistency

**Status:** **NON-BLOCKING PRODUCT DECISION.**

Jarvis canonical `checkHabit` currently does not manufacture the same +15 habit audit XP event as some other writers.

This does **not** affect:
- Daily Mission visible 0–10 level;
- Character/Total Level (habits excluded);
- global streak (canonical habitlog is independent activity evidence).

One legacy category-XP statistic can still differ by writer. Decide later whether:
- Jarvis should emit optional +15 habit audit XP; or
- category-XP should exclude habit XP entirely.

Do not silently change this product definition during unrelated bug work.

---

## 8. Supabase account ownership + admin/security follow-ups

**Status:** **CURRENT SINGLE-OWNER DATA IS HEALTHY; low/admin follow-ups remain.**

Read-only owner audit on 4 Sep 2026:
- `public.app_state` has 14 rows;
- 14/14 have a non-null `user_id`;
- exactly one distinct owner exists across those rows;
- RLS is enabled on `app_state`;
- authenticated SELECT/INSERT/UPDATE policies require `auth.uid() = user_id`;
- `sync.js` normal upserts and unload/keepalive writes both attach `window.gamenfyUserId` and fail closed without the authenticated owner/token;
- `tests/sync-owner-contract-smoke.js` locks the client owner contract.

Current interpretation of other admin findings:
- `public.integration_tokens` RLS/no client policy is intentional service-role-only token storage;
- private backup table RLS/no policy is informational;
- `pg_net` is in `public`, but dependency audit confirmed Fitbit + both push scheduler routes currently use it — do not move/drop it merely to silence advisor;
- Auth leaked-password protection is disabled — enable later through an authorized Auth configuration capability.

Never introduce permissive RLS or `SECURITY DEFINER` as a shortcut.

### Future multi-user blocker — do not migrate casually

`app_state` currently has a globally unique primary key/index on `key`, not `(user_id, key)`. This is correct for Joey's current one-account Gamenfy, but a true second account/test user could not independently own its own `rpg`, `health`, `finance`, etc. rows without colliding on those global keys.

A real multi-user migration would require coordinated schema + client/server changes so every fetch/upsert/conflict target is owner-scoped. Treat that as a deliberate architecture migration with backup/regression proof, not as a quick index tweak. Current single-owner correctness does **not** require this migration.

---

## 9. Legacy health routes / rows

**Status:** **INERT + REGRESSION-LOCKED; no destructive cleanup needed.**

The active wearable source is `app_state.health_fitbit` via `fitbit-sync`. Read-only audit found:
- zero active repo references to `health_fitbit_intraday`, `/functions/v1/fitbit-intraday`, or `/functions/v1/health-sync`;
- deployed `fitbit-intraday` and `health-sync` objects are JWT-protected HTTP 410 stubs;
- zero cron references to those routes;
- zero database-function references to those routes/old intraday key.

The historical `app_state.health_fitbit_intraday` row is therefore inert and may remain as historical data. Do not delete it merely for tidiness. `tests/deprecated-health-source-smoke.js` prevents active `.js/.html/.ts` source from reviving those deprecated paths. See `FITBIT-SETUP.md`.

Note: `app_state.health` is **not** legacy; `health.html` uses it for the synced supplement stack/water state.

---

# Regression-locked / resolved technical classes

The following are not current blockers unless a regression is demonstrated:

- **Main legacy `lastChecked` → habitlog resurrection** — fixed/CI locked.
- **Character dated Daily Quest bypass** — fixed/CI locked.
- **Character legacy v9.1 `rpg_daily_v1` backfill** — retired/CI locked.
- **Global streak +15/−15 ghost days** — fixed/CI locked.
- **Backdated XP counted on write day instead of activity day** — fixed/CI locked.
- **Venture completion around Amsterdam midnight counted as UTC yesterday** — fixed in `checkin.js` v7.8; CI/production verified.
- **Park 3.0 legacy mutation route** — blocked at Lab host boundary; source frozen.
- **Daily Mission reset resurrecting old history** — fixed/CI locked.
- **Daily Mission public/private membership drift in client surfaces** — canonical client contract locked.
- **Habit XP double-count in Character/Total Level** — audited absent.
- **Fitbit sleep calendar mapping** — audited healthy; sleep uses wake/end civil date.
- **JS/PWA stale own-script cache after deploy** — `no-cache, must-revalidate`; SW push-only; CI locked.
- **Local civil-day keys** — active writers audited; repo contract locked.
- **Cross-surface Fitbit reconciler loading / Main boot race** — CI locked.
- **Cross-surface reconciler script-load false-positive** — fixed; session ownership waits for real `onload`, failed nodes are removed and bounded retry remains possible.
- **Main reconciler script-download dead session** — fixed at production head `54b24ba...`; Main keeps its synchronous legacy blocker but now retries failed v11.7 script downloads without reopening the old writer.
- **Version-pinned streak test boundary** — fixed; streak tests discover the Main loader structurally rather than splitting on a `// v11.x:` comment.
- **Cloud sync ownerless-row regression** — live state 14/14 owned + RLS healthy; normal and unload writers are CI-locked to attach `gamenfyUserId`.
- **Deprecated intraday/health-sync route revival** — active source contract locked; old routes remain inert 410 stubs and historical row remains non-destructively untouched.
- **Health Trail metadata key selected as a fake recovery day** — fixed; only real `YYYY-MM-DD` Fitbit keys are eligible.
- **Health Trail recovery flicker during focus/minute refetch** — fixed with in-memory last-good Fitbit snapshot; failed fetch preserves last visible recovery.
- **Health Trail HRV/RHR overreaction with thin history** — fixed; personal recovery baseline requires at least five valid historical values, otherwise component stays neutral.
- **Health Trail stale-source ambiguity** — fixed in v1.25; recovery readout labels `vandaag`, `gisteren`, or the exact older source date.
- **Health Insights stale data sounding current** — fixed in v1.26; data older than yesterday yields one neutral stale-source state, while current/yesterday cards disclose their source day.
- **Health Insights near-7h sleep over-warning** — fixed in v1.27; a miss of at most 15 minutes can be neutral advice, while the actual Sleep Daily Mission remains exactly 420 minutes and a clear personal-baseline decline still wins.
- **Health Trail stale historical baseline across data gaps** — fixed in v1.28; HRV/RHR/steps need enough measurements in a real recent calendar window, and sleep recent/baseline windows are calendar-bounded rather than "last available rows".
- **Brittle Health Trail version-pinned smoke assertions** — fixed; stale-source and sleep-nuance tests lock behavior/invariants rather than a prototype version number.
- **Fitbit cloud-audit JSON orientation ambiguity** — durable read-only audit + regression test lock `habitlog[habit][date]` and prevent future date-first audit mistakes.

---

## Definition of technical completion

Do not call a change complete until applicable gates pass:
1. newest relevant GitHub Actions run = `completed/success`;
2. exact/latest functional Vercel production deployment = `READY`;
3. live cloud data is checked read-only when behavior depends on real state;
4. device-specific behavior stays open until real iPhone/PWA confirmation;
5. user history is never force-written merely to make verification look green.