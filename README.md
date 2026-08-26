# Gamenfy

Gamenfy is Joey's personal, gamified Life OS: a PWA for skills, habits, missions, goals, ventures, health, finance, streaks and daily check-ins.

## Current architecture

- Plain HTML, CSS and JavaScript; no framework or build step.
- Browser state in `localStorage`, mirrored to Supabase through `sync.js`.
- Supabase Edge Functions power Jarvis, health imports and push notifications.
- Vercel deploys `main` automatically to production.
- The app UI is English; project documentation and collaboration notes are primarily Dutch.

The current functional and product source of truth is [`GAMENFY-MASTER.md`](GAMENFY-MASTER.md). Historical decisions through v10.92 are preserved in [`GAMENFY-HISTORY-ARCHIVE.md`](GAMENFY-HISTORY-ARCHIVE.md).

## Important files

| File | Purpose |
|---|---|
| `index.html` | Main dashboard: missions, agenda, check-ins and next moves |
| `character.html` | Body, Skills, Goals and Ventures |
| `lab.html` | Living skill-character Lab and example-sites entry point |
| `finance.html` | Net worth, expenses, wishlist, portfolio and debts |
| `health.html`, `po-water.html` | Health and water tracking |
| `settings.html` | Focus skills, preferences and notification settings |
| `xp.js` | Skills, XP, levels and habit consistency |
| `sync.js` | Local/cloud state synchronization |
| `ventures.js` | Venture definitions and progress |
| `checkin.js` | Streaks and check-in flow |
| `push.js`, `sw.js` | Web Push client and service worker |

## Security status

The app began as a private single-user prototype and its current anonymous cloud-sync model is not suitable for public exposure. Do not add new personal data or integrations until the remediation plan in [`SECURITY.md`](SECURITY.md) is completed. Never commit new secrets or credentials.

## AI collaboration

Claude/Claudia and ChatGPT/OpenAI may both work on this repository. Follow [`AI-COLLABORATION.md`](AI-COLLABORATION.md) so changes remain attributable without restricting either assistant's access.
