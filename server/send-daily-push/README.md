# send-daily-push — deployed Edge Function

Current deployed function is operational and is polled by cron every 10 minutes during broad morning/evening windows. The function itself chooses one Europe/Amsterdam target time per mode/day, deduplicates with `push_jitter_state`, respects push settings, and skips the evening push once the day is already closed.

## Database cron authentication — HARDENED

The morning/evening `pg_cron` commands previously embedded their request-authentication secret literally in `cron.job.command`.

That database-side exposure was removed live on 2026-09-04 without copying the secret value into GitHub or chat:
- Postgres extracted the existing shared value server-side;
- it was stored encrypted in Supabase Vault as `gamenfy_push_cron_secret`;
- both existing cron jobs were rewritten with `cron.alter_job` to resolve the value from `vault.decrypted_secrets` at execution time;
- verification found two Vault-backed jobs and zero literal push secrets remaining in their command text;
- the next natural morning cron execution after the migration succeeded.

Durable desired-state SQL: `server/database/push-cron-vault.sql`. That file deliberately does **not** create the secret and contains no secret value; it fails closed when the named Vault entry is missing.

`pg_net` is an active dependency of these push polls (and the Fitbit hourly scheduler), so do not move/drop/recreate that extension merely to silence the schema advisor without a tested scheduler migration.

## Edge Function credential hardening — STILL OPEN

The currently deployed Edge Function source still embeds server-only credentials directly in its source. **Never copy those credential values into this repository, issues, logs, handoffs or chat summaries.**

The database cron migration above reduces exposure but is not credential rotation: the Edge Function must continue accepting the current request secret until its own secure environment-secret version is deployed.

Required remaining migration:
1. Create dedicated Supabase Edge Function environment secrets for every server-only credential used by this function.
2. Update the function to read those values through `Deno.env.get(...)` and fail closed when a required value is absent.
3. Deploy and verify normal authenticated cron behavior and push delivery.
4. Rotate the old credential values after the environment-secret deployment is proven working.
5. Update the Vault value used by `pg_cron` to the rotated request secret as part of that coordinated cutover.
6. Keep public browser-safe values (for example the VAPID public key) conceptually separate from server-only private credentials.

The current ChatGPT/Supabase connector can deploy Edge Functions but does not expose secret-management operations, so do **not** deploy an env-based rewrite until those environment secrets have been created through a supported secure path (Supabase dashboard/CLI or another authorized secret-management capability).

Do not disable the existing custom request-secret check merely because `verify_jwt` is disabled: this function is intentionally cron-triggered and must retain its own server-side authentication boundary.
