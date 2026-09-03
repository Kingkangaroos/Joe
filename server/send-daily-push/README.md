# send-daily-push — deployed Edge Function

Current deployed function is operational and is polled by cron every 10 minutes during broad morning/evening windows. The function itself chooses one Europe/Amsterdam target time per mode/day, deduplicates with `push_jitter_state`, respects push settings, and skips the evening push once the day is already closed.

## Security hardening — OPEN

The currently deployed source still embeds server-only credentials directly in the Edge Function source. **Never copy those credential values into this repository, issues, logs, handoffs or chat summaries.**

Required migration:
1. Create dedicated Supabase Edge Function environment secrets for every server-only credential used by this function.
2. Update the function to read those values through `Deno.env.get(...)` and fail closed when a required value is absent.
3. Rotate the old credential values after the environment-secret deployment is verified.
4. Verify one authenticated cron poll, one morning/evening dedupe path and one real push delivery after rotation.
5. Keep public browser-safe values (for example the VAPID public key) conceptually separate from server-only private credentials.

The current ChatGPT/Supabase connector can deploy Edge Functions but does not expose secret-management operations, so do **not** deploy an env-based rewrite until those environment secrets have been created through a supported secure path (Supabase dashboard/CLI or another authorized secret-management capability).

Do not disable the existing custom request-secret check merely because `verify_jwt` is disabled: this function is intentionally cron-triggered and must retain its own server-side authentication boundary.
