# Gamenfy Public Beta

Isolated public beta surface for friends/testers.

- Entry: `/public/`
- Auth: Supabase Auth (same auth tenant as private Gamenfy)
- State: `public.gamenfy_public_state`, keyed by `(user_id, key)`
- Private app protection: `public.gamenfy_private_access` allowlist checked by private `auth.js`
- No `sync.js`, Fitbit, Jarvis, Finance, private quests, or private `app_state` access is loaded here.
- Daily Mission level rule mirrors Gamenfy: completed day +1, missed finished day -1, no weekly reset, today is not a miss until it ends.

Performed by ChatGPT/OpenAI, September 2026.
