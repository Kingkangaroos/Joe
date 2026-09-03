# Jarvis — deployed Edge Function

The deployed Jarvis function is owner-authenticated with the signed-in Supabase JWT and uses the service role only server-side for Gamenfy state access.

## Daily Mission membership drift — OPEN DEPLOY BLOCKER

The currently deployed Jarvis skill map predates the canonical Daily Mission roster. It must not be treated as the source of truth for habit membership.

Canonical public Daily Missions Jarvis must recognize as checkable:
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

Not checkable as public Daily Missions:
- `grounding` — disabled;
- `no_porn` / `weed_control` — private/PIN-backed, never exposed through Jarvis's public `check_habit` tool;
- Tennis, Reading and Finger Whistling — normal skills, not public dailies.

Current deployed drift observed during the 2026-09-04 audit:
- Budgeting is not marked as a habit;
- Good Deed is missing from the deployed skill map;
- Grounding is still marked as a habit.

Required next safe Jarvis deployment must derive or mirror the canonical active/non-private `RPG_DEFAULT_SKILLS` habit membership above, and its `check_habit` validation must reject disabled/private entries.

Do not redeploy merely to fix this map while the credential-hardening item below is unresolved: the current source also contains a server-only provider credential, and copying/re-embedding it would perpetuate the security problem.

## Security hardening — OPEN

The currently deployed Jarvis source still embeds an AI-provider credential directly in the Edge Function source. **Never copy that credential value into this repository, issues, logs, handoffs or chat summaries.**

Required migration:
1. Create a dedicated Supabase Edge Function environment secret for the AI-provider credential.
2. Update Jarvis to read it through `Deno.env.get(...)` and fail closed when absent.
3. At the same deployment, correct the Daily Mission membership contract above.
4. Rotate the old provider credential after the env-secret version is deployed and verified.
5. Verify owner-JWT rejection for unauthenticated/non-owner requests.
6. Verify one normal text turn, one tool-call turn, canonical Budgeting/Good Deed habit actions, rejection of Grounding/private habits, and (if still used) one voice turn.

The current ChatGPT/Supabase connector can deploy Edge Functions but does not expose secret-management operations. Do **not** replace the deployed credential reference with a new env name until the secret has first been created through a supported secure path (Supabase dashboard/CLI or another authorized secret-management capability).

Do not weaken `verify_jwt=true` or the function's explicit owner check as part of this migration.
