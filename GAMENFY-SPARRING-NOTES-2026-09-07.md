# Gamenfy sparring notes — 2026-09-07

Durable notes from Joey's current sparring session.

## Personal app feedback
- Daily Score Joey/King character is approved and liked; **make the character slightly larger** without redesigning the card.
- Joey feels the WHY-chain work is not visible enough in the real app. Do not call WHY complete just because infrastructure exists; prove it on-device and surface actual links.
- Personal Gamenfy remains the priority product. Keep personal behavior/data stable; avoid broad genericization just to serve hypothetical Public users.

## Public Beta boundary
- Public is a low-effort validation experiment for friends right now, not a second full roadmap.
- Do not generalize Joey's Daily Missions/skills until repeated external usage proves there is demand.
- Public should stay deliberately stable while Joey's private app continues changing. Private changes must not automatically become Public product changes unless explicitly promoted.
- Prefer versioned Public releases/snapshots over continuous parity with Personal.

## Private access bug observed
- Joey opened the personal app and saw the message: `Dit account hoort bij Gamenfy Public.`
- Current database audit shows the existing private account is still present in `gamenfy_private_access`; the account has **not** been intentionally converted to Public.
- Treat the current gate wording/behavior as a bug or session/access-check problem, not as a product decision.
- Recovery and isolation should preserve the existing private account/data and avoid touching the personal product unnecessarily.

## Public onboarding expectation
- Friend flow target: share link -> create account -> confirm email only if Supabase Auth requires it -> enter Public -> session persists on the same browser/device until sign-out/session invalidation.
- Do not promise zero verification until the live Supabase Auth confirmation toggle has been explicitly verified.
