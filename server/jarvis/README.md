# Jarvis — deployed Edge Function

The deployed Jarvis function is owner-authenticated with the signed-in Supabase JWT and uses the service role only server-side for Gamenfy state access.

## Security hardening — OPEN

The currently deployed Jarvis source still embeds an AI-provider credential directly in the Edge Function source. **Never copy that credential value into this repository, issues, logs, handoffs or chat summaries.**

Required migration:
1. Create a dedicated Supabase Edge Function environment secret for the AI-provider credential.
2. Update Jarvis to read it through `Deno.env.get(...)` and fail closed when absent.
3. Rotate the old provider credential after the env-secret version is deployed and verified.
4. Verify owner-JWT rejection for unauthenticated/non-owner requests after deployment.
5. Verify one normal text turn, one tool-call turn and (if still used) one voice turn after rotation.

The current ChatGPT/Supabase connector can deploy Edge Functions but does not expose secret-management operations. Do **not** replace the deployed credential reference with a new env name until the secret has first been created through a supported secure path (Supabase dashboard/CLI or another authorized secret-management capability).

Do not weaken `verify_jwt=true` or the function's explicit owner check as part of this migration.
