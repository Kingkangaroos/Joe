# Gamenfy Edge Function Security Cutover

Status: **source audit complete; secret-backed redeploy is blocked only by missing connected secret-management capability.**

Audited live on 2026-09-06 through the connected Supabase project. Never copy current credential values into Git, chat summaries, issues or deployment notes.

## Live function inventory

### `jarvis` — migration required

Current security boundary that must remain:
- `verify_jwt=true`;
- explicit signed-in owner validation;
- service role only server-side;
- database action guard remains defense in depth.

Current source problems:
- one AI-provider credential is embedded directly in deployed source;
- public Daily Mission membership is stale and must be corrected in the same safe redeploy.

Target secret contract:
- `GAMENFY_AI_PROVIDER_KEY` — server-only Edge Function environment secret.

Target code behavior:
```ts
const AI_PROVIDER_KEY = Deno.env.get('GAMENFY_AI_PROVIDER_KEY') || '';
if (!AI_PROVIDER_KEY) throw new Error('config_missing:GAMENFY_AI_PROVIDER_KEY');
```

Never log the value or return it in error payloads.

### `send-daily-push` — migration required

Current source contains three credential classes that must not remain source literals:
- AI-provider credential;
- push-request authentication secret;
- VAPID private key.

The VAPID public key is public/browser-safe and does not need secret treatment.

Target secret contract:
- `GAMENFY_AI_PROVIDER_KEY` — same coordinated provider credential used by Jarvis;
- `GAMENFY_PUSH_REQUEST_SECRET` — server-only request-auth value;
- `GAMENFY_VAPID_PRIVATE_KEY` — server-only Web Push signing private key.

The function must fail closed if any required secret is missing. Do not weaken its custom request-secret boundary merely because `verify_jwt=false`; cron calls intentionally use server-to-server authentication.

The database cron side is already hardened: its request secret is read from Supabase Vault, not stored literally in cron command text. During rotation, the Vault value and Edge Function environment secret must change as one coordinated cutover.

### `fitbit-sync` — secrets already environment-backed; owner fallback hardening remains

Google client ID/secret and Supabase service role are already read via `Deno.env.get(...)`. OAuth/cron bearer material is not embedded as plaintext source credentials.

One non-secret privacy/architecture hardening remains: deployed source contains a hard-coded owner identifier fallback. Future redeploy should remove that fallback and require owner resolution from authoritative database state; never add the identifier to Git or env documentation.

### `health-sync`, `fitbit-intraday`, `import-media`

These legacy routes are intentionally inert and return HTTP 410. No secret migration is needed unless they are deliberately revived in the future.

## Required cutover order

1. **Create environment secrets first** through Supabase Dashboard/CLI or another authorized secret-management capability. Current ChatGPT Supabase connector cannot create/list Edge Function secrets.
2. Deploy **Jarvis** reading `GAMENFY_AI_PROVIDER_KEY` from env, correcting canonical public Daily Mission membership in the same version.
3. Verify Jarvis fail-closed config behavior in a non-secret-safe way, owner auth rejection, normal text turn, tool-call turn, Budgeting/Good Deed acceptance and Grounding/private rejection.
4. Deploy **send-daily-push** reading all required server-only values from env.
5. Verify one authenticated cron invocation path and a natural push delivery without logging credentials/subscription endpoints.
6. Rotate the old AI-provider credential only after **both** Jarvis and push are using the new env-backed value.
7. Rotate the push request secret and update the existing Supabase Vault value used by pg_cron in the same coordinated cutover.
8. Rotate VAPID private material only with an explicit Web Push subscription migration plan. Changing the VAPID key pair can invalidate existing subscriptions, so do not rotate it casually merely to remove it from source.
9. Re-audit deployed function source after rotation and confirm no server-only credential literals remain.

## Canonical Jarvis public Daily Missions

The safe Jarvis redeploy must recognize exactly these public Daily Missions as checkable:
- `budgeting`
- `sleep`
- `nutrition`
- `walking`
- `teeth`
- `household`
- `meditation`
- `gratitude`
- `good_deed`
- `screen_time`
- `cold_shower`

It must reject:
- `grounding` — disabled;
- `no_porn`, `weed_control` — private/PIN-backed;
- ordinary skills such as Tennis, Reading and Finger Whistling as Daily Mission checks.

## Repository rules

The repository may contain:
- env variable **names**;
- deployment/checklist documentation;
- code that calls `Deno.env.get(...)`;
- public keys explicitly documented as public.

The repository must never contain:
- active AI-provider credential values;
- VAPID private keys;
- push trigger secret values;
- OAuth client secrets;
- service-role keys;
- owner UUID literals copied from deployed state;
- push subscription endpoints/tokens.

## Platform advisor note

Security advisor audit on 2026-09-06 also reported leaked-password protection disabled in Supabase Auth. The connected tool can audit this setting but cannot modify Auth configuration. Enable it separately when an authorized Auth-settings path is available.

Other advisor findings are intentional for the current architecture:
- `public.integration_tokens`: RLS enabled with no client policies; service-role Edge Functions are the intended access path;
- private backup table: RLS with no policies / no primary key is acceptable archival state;
- `pg_net` remains in `public` because active cron/push/Fitbit scheduling depends on it; do not move it as a lint-only cleanup.
