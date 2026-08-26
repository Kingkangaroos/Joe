# Gamenfy security status and safe remediation plan

Last reviewed: 2026-08-26 by ChatGPT/OpenAI.

## Completed immediate hardening

On 2026-08-26, the unused `DELETE`, `TRUNCATE`, `REFERENCES` and `TRIGGER` table privileges were revoked from the `anon` and `authenticated` roles. The existing `SELECT`, `INSERT` and `UPDATE` privileges and policies were deliberately preserved so the current sync path keeps working. Verification confirmed all 15 state rows remained present and only the three required privileges remain for those roles.

This is a limited reduction in exposure, not the final fix: anonymous reads and writes still need to be replaced by authenticated, owner-scoped access.

## Current risk

Gamenfy grew from a personal prototype into a cloud-connected app while retaining anonymous, single-user sync assumptions. The repository is publicly readable and the central `public.app_state` table currently permits broad anonymous reads and writes. Some deployed Edge Functions do not require a Supabase JWT, and credentials have historically been placed directly in source.

Treat every secret that has ever appeared in repository or deployed-function source as exposed. Do not copy actual secret values into issues, commits or documentation.

## Non-breaking rule

Do not simply remove the anonymous policies or rotate every credential in isolation. The current browser sync depends on anonymous access; doing so would break normal saves, Fitbit/Google Health, Jarvis or push notifications.

The safe order is:

1. Back up `public.app_state` and record the current production health checks.
2. Choose the intended access model with Joey.
3. Add and test the replacement authentication path on a preview branch.
4. Associate state with an authenticated owner and add owner-scoped RLS policies using `auth.uid()`.
5. Move server-only credentials to managed Edge Function/Vercel secrets.
6. Update and test every Edge Function's authentication or narrowly scoped request verification.
7. Verify save, reload, second-device sync, offline recovery, Fitbit/Google Health, Jarvis and push notifications.
8. Only after those tests pass, remove anonymous read/write access.
9. Rotate exposed credentials and revoke old tokens.
10. Run Supabase security/performance advisors and repeat the end-to-end checks.

## Recommended target for the personal app

Unless Joey chooses otherwise, use one normal Supabase Auth account and owner-scoped rows. A magic link avoids maintaining a password, while a password login may be more convenient for an installed PWA. Public example websites should remain separate from authenticated personal Gamenfy data.

## Claude/ChatGPT access

Application authentication and AI development access are separate concerns. Tightening database access must not remove Claude/Claudia's GitHub or project access. AI tools should receive development access through their existing account/app integrations, never through credentials committed to this repository.

## Immediate restrictions

- Do not add new hardcoded credentials.
- Do not paste existing secrets into chats, commits or issues.
- Do not make the repository's public visibility the only protection for personal data.
- Do not change production RLS or rotate credentials without a tested replacement route and rollback plan.
