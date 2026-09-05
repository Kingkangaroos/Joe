# Gamenfy — Builder checkpoint 2026-09-05

Owner: Joey Siemons  
Builder: ChatGPT (OpenAI)

This checkpoint records the exact state reached during the autonomous 4→5 Sep builder pass. Use it together with `BUILDER-NOW.md`, `BUGS-ACTIVE.md`, `HEALTH-INSIGHTS.md`, and git history. If an older handoff conflicts with this file on the items below, this checkpoint is newer.

## Verified production baseline

Latest verified non-health + general regression checkpoint before the later Goals-retention patch:
- commit: `5919f9c63f4922dd0145aa7ae0f9d8e75fe07206`
- commit message: `ChatGPT: lock non-health durability and truthful Settings`
- GitHub smoke suite: run **165**, `completed/success`
- exact Vercel production deployment: `dpl_1b1T2f1LahbTNuYoQrZwJEjWQXji`
- deployment state: `READY`, target `production`

The exact production deployment was fetched directly and confirmed to serve the updated Settings copy/behavior. Later commits in this overnight pass must receive their own CI/deployment proof before replacing this checkpoint as the verified functional baseline.

## Non-health durability work now locked

### Goals / Ventures source of truth

- Canonical Goals/Ventures state remains inside the RPG sync domain.
- Active client code no longer writes an old standalone goals cloud row as a competing second source.
- Regression: `tests/goals-ventures-source-smoke.js`.

### Body manual weight history

- `po_coach_weights` is real user-entered history and is now part of the RPG cloud sync scope.
- Derived `hevy_total_volume` remains local/cache because it can be recomputed.
- No historical value was invented or force-written through SQL.
- Regression: `tests/body-weight-sync-smoke.js`.

### Push device subscription truth

Settings now controls the real `GamenfyPush` service-worker/cloud subscription instead of merely requesting browser Notification permission.

- enable route registers the actual device subscription;
- disable route removes the device from the cloud subscription list before local unsubscribe is treated as successful;
- failure cannot falsely present push as disabled;
- the old in-page 21:00 clock reminder is not presented as background push;
- Settings no longer promises exact 08:30/19:30 delivery: the live backend polls broad morning/evening windows and chooses/deduplicates its own daily target.

Read-only cloud audit on 5 Sep:
- `push_subscriptions` is owner-bound;
- 2 registered device subscriptions;
- 0 duplicate endpoints.

Do not log or copy endpoints/tokens into handoffs.

### PIN / private UI boundary

- The PIN is a **convenience/UI lock**, not cryptographic protection.
- `rpg_pin_v1` is currently part of `RPG_SYNC_KEYS`, so the PIN is synchronized inside Joey's owner-scoped RPG cloud row rather than being purely device-local.
- Settings explicitly says it is **not encryption of synced data**.
- Existing PIN change/persistence behavior remains intact.
- The backup exporter explicitly excludes `rpg_pin_v1` even though the normal RPG sync includes it.
- Regression: `tests/pin-privacy-copy-smoke.js`.

Do not describe the PIN as cryptographic storage protection. Whether Joey wants one synced PIN everywhere or a deliberately device-local PIN is a future product/security choice; do not silently change that behavior during unrelated work.

### Backup export

The old export selected only `rpg_*` / `hevy_*`, which both missed real Finance/Health data and risked including the Hevy API credential.

Current export:
- includes the canonical RPG sync scope dynamically;
- includes Finance user data (`subs`, `wishlist`, `vk_paid_v1`, `nw_currency`, `nw:activity`, `nw:history`, `nw:*`);
- includes Health user data (`stack:items`, `stack:version`, `stack:low`, `stack:taken:*`, `po_water_v1`);
- includes manual Body weight through the RPG scope;
- explicitly excludes `rpg_pin_v1` and `hevy_api_key`;
- does not need derived/rebuildable Hevy cache data.

Functional commit underneath current head: `0c85cb37505b528fb0ade749400bb693471ab46e` (`ChatGPT: make backup complete and credential-free`).

Important: there is currently **no safe restore/import path**. Do not add a blind bulk importer. A future restore flow should require at minimum:
1. parse/schema validation;
2. preview of affected domains/keys;
3. backup-before-restore;
4. explicit merge vs overwrite semantics;
5. owner/auth check;
6. regression proof that cloud convergence cannot resurrect pre-restore state.

### Water

Water Coach durability audit passed: `po_water_v1` is already in the Health cloud scope. No change needed.

### Settings workspace truth

Separate cloud workspaces are **not active**. Settings is disabled for this feature and no longer contains an unreachable handler promising that a name will create separate empty data. Current app remains a single owner-scoped workspace.

## PWA / iOS findings

### Existing open device bug

Bottom navigation can drift upward on iOS standalone PWA. Keep this device-dependent until reproduced/verified on Joey's installed app. Do not stack speculative CSS transforms.

### Missing real app icon

Repo/manifest audit found no dedicated Gamenfy app icon suitable for PWA/Apple home-screen identity; available images are content/Lab/skill assets and must not be repurposed arbitrarily.

Treat this as an **asset/branding task**, not a logic bug. Once Joey chooses/approves an icon, Builder can integrate manifest icon sizes + Apple touch metadata and regression-check local targets.

## Existing hard blockers unchanged

### Jarvis Edge Function

Still blocked on a secure Edge Function environment-secret creation path. Deployed membership drift remains: Budgeting missing habit flag, Good Deed missing, Grounding stale habit. Database action guard prevents unsafe stale actions but cannot create missing correct ones.

Never redeploy Jarvis while re-embedding the existing server credential in source.

### send-daily-push Edge Function

Database cron request auth is Vault-backed, but deployed Edge Function source still needs server-only credentials moved to environment secrets and rotated through a coordinated cutover. Current connector still lacks secret-management capability.

### Park 3.1 art

Native 10-level Budgeting and Meditation art remains a Creator task. Do not fabricate it.

## Daily Mission / Fitbit migration state carried forward

Do not force proof with SQL.

Last confirmed audit before this checkpoint still had exactly 12 Fitbit-qualified canonical completions missing (7 Walking, 5 Sleep) with `rpg.updated_at` older than the latest Fitbit sync. After Joey naturally opens a current authenticated RPG surface, re-run the durable read-only reconciliation audit before claiming migration completed.

Walking threshold remains 10,000 steps. Sleep threshold remains exactly 420 minutes / 7h. No weekly reset. Canonical history remains `rpg_habitlog_v1`.

## Builder rule for next session

Tomorrow's sparring should focus on product/visual choices, not re-open the regression-locked infrastructure unless a real symptom appears. Highest-value discussion candidates:
- overdue Goals visibility / whether completed goals need a richer archive flow;
- restore/import UX and safety semantics;
- real Gamenfy PWA/app icon direction;
- whether the convenience PIN should stay synced across Joey's devices or deliberately become device-local;
- iOS installed-PWA nav reproduction if Joey can show it;
- Jarvis XP category-definition choice;
- Health Trail/Home rollout only if Joey explicitly wants to discuss moving Lab work toward Home;
- Park 3.1 missing creator assets / character animation direction.

Do not modify Home/Main visual layout without Joey's explicit approval.
