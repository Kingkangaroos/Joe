# Gamenfy — Active Bugs / Verification Needed

> Shared current-state handoff for Claude + ChatGPT. Keep this file focused on real open blockers / proof still needed. Historical implementation detail belongs in `BUILDER-NOW.md`, `BUILDER-CHECKPOINT-2026-09-05.md`, `HEALTH-INSIGHTS.md`, and git history.

Last refreshed: **2026-09-05** by ChatGPT (OpenAI)

## Current verified production baseline

Latest verified head:
- `5c85c8d0cf5856bf8c5f3aa31e6183bcb36897d0`
- GitHub smoke suite: **run 169 — completed/success**
- exact Vercel production deployment: `dpl_HHMkv8YyNUBYVu9YVpXdTZHKNLYT`
- deployment state: **READY**, target `production`

Important functional commit directly underneath it:
- `8a3cc696d662c1afbd9259373a896e8bbfd1eda6` — unfinished Goals no longer disappear after three overdue days; overdue only changes urgency copy, while manual 100%/archive remains authoritative.

This head also includes the earlier non-health durability pass: Goals/Ventures source-of-truth guard, manual Body-weight cloud durability, real push subscribe/unsubscribe Settings behavior, truthful PIN boundary, truthful push-window copy, disabled fake workspace isolation, and complete credential-free backup export.

Do not confuse an older handoff checkpoint with current functional production if the commit/run/deployment above is newer.

---

## 1. Daily Missions — installed-iPhone rollback confirmation

**Status:** **TECHNICALLY FIXED + CI-LOCKED; real-device confirmation still useful.**

Original symptom: a backdated mission could appear checked and later return unchecked after navigation/reopen.

Current sync protections cover:
- local edits before Auth/initial cloud pull;
- stale initial remote snapshots;
- stale realtime echoes;
- pre-auth deletions;
- persistent dirty journal + monotone high-water healing.

**Remaining device proof:** edit a previous-day mission → Skills → Main → background/reopen installed PWA. If stable on Joey's real device, move this fully to resolved history.

Do not stack another sync writer or speculative workaround unless the bug reproduces.

---

## 2. Fitbit → Daily Missions retrospective migration

**Status:** **TECHNICAL CHAIN FIXED + CI/PRODUCTION VERIFIED; natural live cloud migration still pending.**

Locked rules:
- Walking threshold = **10,000 steps**;
- Sleep threshold = **420 minutes / 7h**;
- canonical history = `rpg_habitlog_v1`;
- completed day +1 / missed completed day −1, 0–10 clamp;
- no weekly reset;
- later Fitbit finalization can repair old qualified days;
- `manual-off` suppression is respected;
- XP migration is exactly-once via durable ledger.

Current reconciler remains `autohabit-reconcile.js` v11.7. Never force migration proof with SQL.

### Latest live read-only audit — 5 Sep 2026

Cloud timestamps:
- `health_fitbit.updated_at = 2026-09-05 02:15:07.126+00` (**04:15 Amsterdam**);
- `rpg.updated_at = 2026-09-04 18:00:54.187+00` (**20:00 Amsterdam, 4 Sep**).

Despite the newer RPG write, the same **12 Fitbit-qualified canonical completions are still missing**.

Walking — 7 missing:
- 2026-07-18
- 2026-07-20
- 2026-07-21
- 2026-07-27
- 2026-07-31
- 2026-08-02
- 2026-08-31

Sleep — 5 missing:
- 2026-07-19
- 2026-07-22
- 2026-07-23
- 2026-07-30
- 2026-09-03

Current migration state remains untouched:
- `__retrospective_v2_migrated` = unset;
- `__xp_ledger_v1_migrated` = unset;
- Walking score 9, streak 0, lastChecked 2026-09-02;
- Sleep score 0, streak 0, lastChecked 2026-08-30;
- retained XP log = 194/200.

There is no evidence of a half-finished migration.

Expected first successful natural reconciliation against this historical state remains:
- +12 canonical dates;
- Walking +105 audit XP;
- Sleep +75 audit XP;
- +180 total habit audit XP;
- migration markers set;
- authoritative scores replayed from the full canonical log.

Use `server/database/fitbit-reconcile-audit.sql` for future read-only proof. Do not manufacture the result.

---

## 3. Jarvis Edge Function membership + credential migration

**Status:** **OPEN DEPLOY BLOCKER; unsafe stale actions are mitigated at the database boundary.**

Current deployed membership drift:
- Budgeting not marked as a habit;
- Good Deed missing from deployed skill map;
- Grounding still marked as a habit.

The deployed function also still embeds a server-only AI-provider credential in source.

Required safe cutover:
1. create dedicated Edge Function environment secret(s);
2. read them via `Deno.env.get(...)` and fail closed if absent;
3. fix canonical Daily Mission membership in the same deployment;
4. preserve JWT/owner validation;
5. verify Budgeting + Good Deed and Grounding/private rejection;
6. rotate the old credential only after the secret-backed version is proven.

Current Supabase connector still exposes no Edge Function secret-management operation. Do **not** redeploy merely to fix membership while re-embedding the same credential.

Database defense-in-depth remains live via `public.gamenfy_filter_jarvis_actions()` and owner RLS.

---

## 4. send-daily-push Edge Function credential migration

**Status:** **PARTLY HARDENED; Edge Function source secret migration still open.**

Completed:
- morning/evening pg_cron request auth is resolved from Supabase Vault;
- no literal request-secret copies remain in cron command text;
- natural post-migration cron execution succeeded.

Still open:
- deployed function source still contains server-only credential material;
- move to Edge Function environment secrets, verify, then rotate old values.

Same tool blocker as Jarvis: no supported connected secret-management operation yet.

Read-only push-subscription audit on 5 Sep:
- owner-bound row;
- **2** registered device subscriptions;
- **0** duplicate endpoints.

Never copy endpoints/tokens into handoffs or logs.

---

## 5. iOS standalone PWA bottom navigation drift

**Status:** **OPEN — DEVICE-DEPENDENT.**

Observed on iOS 26 standalone PWA: fixed bottom navigation can visually drift upward while scrolling.

Do not stack speculative transforms / `!important` patches. If still reproducible, test an iOS-standalone-only shell/internal-scroller architecture and verify on Joey's installed PWA.

---

## 6. PWA / Apple app icon asset

**Status:** **OPEN ASSET / BRANDING TASK, NOT A LOGIC BUG.**

The repo currently has no dedicated Gamenfy app icon suitable for manifest + Apple home-screen identity. Existing images are content/Lab/skill assets and must not be reused arbitrarily.

Once Joey approves an icon direction, integrate the required icon sizes / Apple touch metadata and regression-check all local targets.

---

## 7. Park 3.1 native asset gap

**Status:** **OPEN CREATOR TASK.**

Missing native public ten-level sets:
- Budgeting;
- Meditation.

Current fallbacks remain intentional. Do not fabricate replacements. See `img/lab/park31/ASSET-MAP.md`.

---

## 8. Backup restore/import

**Status:** **OPEN PRODUCT + DATA-SAFETY FEATURE; export itself is fixed.**

Backup export is now complete across canonical RPG + Finance + Health user-data scopes while explicitly excluding `rpg_pin_v1` and `hevy_api_key`.

There is currently **no restore/import path**. Do not add a blind importer.

A safe future restore must include at minimum:
- schema/format validation;
- domain/key preview;
- backup-before-restore;
- explicit merge vs overwrite semantics;
- owner/auth validation;
- protection against stale cloud convergence resurrecting overwritten data;
- regression proof before production use.

---

## 9. PIN product/security choice

**Status:** **CURRENT BEHAVIOR IS TRUTHFULLY DOCUMENTED; future choice only.**

`rpg_pin_v1` is a convenience UI lock, not encryption. It is currently in `RPG_SYNC_KEYS`, so the same PIN can synchronize inside Joey's owner-scoped RPG cloud row.

Settings now says this explicitly enough to avoid presenting it as cryptographic protection. Backup export deliberately excludes the PIN.

Future discussion only: keep one synced PIN across devices vs deliberately make PIN device-local. Do not silently change this during unrelated work.

---

## 10. Jarvis habit XP audit consistency

**Status:** **NON-BLOCKING PRODUCT DECISION.**

Jarvis canonical `checkHabit` writes canonical completion/replay but does not manufacture the same +15 habit audit XP event as some other writers.

This does **not** affect:
- visible Daily Mission 0–10 level;
- Character/Total Level (habits excluded);
- global streak (canonical habitlog is independent evidence).

One legacy category-XP statistic can differ by writer. Decide later whether Jarvis should emit optional +15 audit XP or category-XP should exclude habit XP entirely.

---

## 11. Single-owner architecture / future multi-user

**Status:** **CURRENT OWNER DATA HEALTHY; TRUE MULTI-USER REMAINS A DELIBERATE MIGRATION.**

Current `app_state` ownership + RLS is healthy for Joey's one-account Gamenfy.

The table still uses a globally unique key rather than `(user_id,key)`. A genuine second account/test user therefore requires coordinated schema + client/server changes, backup and regression proof. Do not perform a casual index tweak.

Separate cloud workspaces are not active; Settings truthfully keeps that UI disabled.

---

# Regression-locked / resolved technical classes

Do not reopen these without a reproduced regression:

- Daily Mission authoritative `rpg_habitlog_v1` replay and 0–10 no-week-reset logic.
- Main stale `lastChecked` → habitlog resurrection.
- Character dated public Daily Mission bypass / old `rpg_daily_v1` backfill.
- Global streak ghost days and backdated XP activity-date attribution.
- Venture Amsterdam-midnight date attribution.
- Park 3.0 mutation path; source remains frozen.
- Daily Mission reset resurrecting old history.
- Public/private Daily Mission membership drift in client surfaces.
- Habit XP double-count in Character/Total Level.
- Fitbit sleep wake-day mapping.
- JS/PWA own-script stale caching (`no-cache, must-revalidate`; SW push-only).
- Local civil-day key contract across active writers.
- Cross-surface Fitbit reconciler boot/load retry failures.
- Cloud sync ownerless writes / stale realtime rollback class.
- Deprecated health/intraday routes revival.
- Health Trail stale metadata dates, refresh flicker, thin baseline overreaction, stale-source wording, near-7h over-warning and calendar-gap baseline manufacturing (Health Trail v1.28 remains mature/Lab-only).
- Goals/Ventures competing standalone goals cloud source.
- **Overdue Goals auto-disappearing after 3 days** — fixed at `8a3cc696...`; unfinished goals stay active until deliberate completion/archive.
- Manual Body-weight history device-only gap — `po_coach_weights` is in RPG cloud scope; derived Hevy volume remains local cache.
- Water Coach durability — `po_water_v1` already in Health cloud scope.
- Finance canonical sync scope coverage.
- Settings fake push toggle — now uses real `GamenfyPush` subscribe/unsubscribe.
- Push opt-out false success — cloud removal precedes local unsubscribe success.
- Settings fake exact push times — copy now matches server-selected morning/evening windows.
- Settings fake workspace isolation promise — disabled + dead success path removed.
- PIN copy overclaim — explicitly convenience UI lock, not encryption.
- Backup prefix bug / credential leak risk — canonical RPG + Finance + Health data exported; PIN + Hevy API key excluded.
- Goals linked XP wording — retained XP log is described as **recent activity**, while manual percentage remains progress source of truth.

---

## Definition of technical completion

Do not call a new change complete until applicable gates pass:
1. newest relevant GitHub Actions run = `completed/success`;
2. exact/latest functional Vercel production deployment = `READY`;
3. live cloud data checked read-only when behavior depends on real state;
4. device-specific behavior stays open until real iPhone/PWA confirmation;
5. user history is never force-written merely to make verification look green.
