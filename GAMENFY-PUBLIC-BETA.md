# Gamenfy Public Beta — durable handoff

Last updated: 2026-09-07  
Builder: ChatGPT (OpenAI)

## Status

**SHIPPED — friend beta ready.**

Stable share URL:

- `https://joe-silk.vercel.app/public`

Private Joey app remains at:

- `https://joe-silk.vercel.app/`

The two surfaces are intentionally separate. Public Beta accounts cannot open Joey's private Gamenfy data.

## Friend flow

1. Open `/public`.
2. Choose **Account maken**.
3. Enter name, e-mail and password.
4. Confirm e-mail once if Supabase Auth requests it.
5. Return to `/public` and sign in.
6. Daily Mission state is created automatically for that account.

No manual allowlisting by Joey is required for Public Beta accounts.

## Current Public Beta scope

Included:

- account creation + login;
- per-user cloud persistence;
- 11 public Daily Missions;
- persistent mission levels 0–10;
- approved companion level art 1–10;
- Daily Score (`checked today / 11`);
- average companion level, total checks and best level;
- profile name;
- iPhone Add to Home Screen instructions;
- in-app beta feedback form.

Deliberately excluded:

- Fitbit;
- Jarvis;
- Finance;
- Joey's private/PIN quests;
- Joey's existing private RPG state;
- private integration credentials/tokens.

## Daily Mission contract

Public 11:

1. Budgeting
2. Sleep
3. Nutrition
4. 10K Steps / Walking
5. Brush Teeth 2×
6. Household
7. Meditation
8. Gratitude
9. Good Deed
10. Screen Time
11. Cold Shower

Level behavior:

- completed day: +1, max 10;
- missed completed calendar day: -1, min 0;
- today is never penalized before the day ends;
- no weekly reset.

Public Beta is manual-first. Fitbit-backed auto-completion stays private until a true multi-user integration design exists.

## Data isolation

Supabase tables:

- `public.gamenfy_public_state` — Public Beta state, keyed by authenticated `user_id` + state key;
- `public.gamenfy_public_feedback` — beta feedback, owned by authenticated `user_id`;
- `public.gamenfy_private_access` — allowlist for the private Joey app.

All three have RLS. Public state and feedback policies bind reads/writes to `auth.uid() = user_id`. The private app checks the private allowlist before revealing private Gamenfy.

Public code must never query `public.app_state`.

## Hosting contract

Vercel serves the repository root (`outputDirectory: "."`).

Stable rewrites:

- `/public` → `/gamenfy-public.html`
- `/public/` → `/gamenfy-public.html`

Do not recreate a root `public/` deployment directory for this beta: Vercel previously treated that directory as output and temporarily displaced the private root. Root HTML + explicit rewrite is the locked shape.

## Verified production checkpoint

Public feedback/isolation checkpoint:

- GitHub commit: `e99667ad99644f52780be70cc16a4e2ad8ede0d7`
- Vercel production deployment: `dpl_4CuT9cx5MvryXBimrvQweDvRBwqg` — READY
- GitHub Actions smoke run `34132348795` — SUCCESS
- stable `/public` — HTTP 200
- stable private `/` — HTTP 200 (verified before feedback-only commits; later commits do not touch private root)
- `/gamenfy-public-feedback.js?v=1` — HTTP 200

Regression file: `tests/gamenfy-public-smoke.js`.

## First-user experiment

Do not build a broad public launch yet. The next useful evidence is one real friend using it without Joey coaching her.

Recommended sequence:

1. Friend completes signup herself.
2. Let her use the app for ~10 minutes without help.
3. Let her keep it for 2–3 real days.
4. She sends friction/missing-feature notes through **Profiel → Beta-feedback**.
5. Only then choose the next private → Public feature.

This replaces the old waitlist-first thinking. One real user's recurring behavior is more valuable right now than ten shallow signups.

## Next Builder checks

- After first signup, confirm one new `gamenfy_public_state` owner exists without reading private user data into the public app.
- After first feedback submission, verify `gamenfy_public_feedback` received it and RLS remains owner-bound.
- Use actual feedback to choose onboarding/history/custom missions versus a larger feature transfer.
- Keep Joey's Home/Main visual layout untouched unless he explicitly approves a rollout.
