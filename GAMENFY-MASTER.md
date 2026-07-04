# GAMENFY — Master Document (v7.3)

> Single source of truth for the Gamenfy dashboard. Read this first in any new session.
> Joey calls the assistant "Claudia". App UI is in English. Aesthetic: premium & light ("Daylight"), not dark/gamey.

---

## 1. What Gamenfy is

A gamified personal Life OS — version 0.1 of a future product. Joey uses it daily and gives UX feedback that drives iteration. Skills, levels, habits and quests turn real life into an RPG. The dashboard runs as a PWA (add-to-homescreen) and opens on **Main**.

---

## 2. Tech stack

- **Frontend:** plain HTML/CSS/JS, no build step. Each page is a standalone `.html` file.
- **Theme:** "Daylight" — light palette via CSS variables. Core tokens:
  - `--bg #F4F3EF` · `--card #FFFFFF` · `--ink #15140F` · `--muted #6F6C63`
  - `--ember #D4633E` (accent) · `--gold #C9A227` · `--green #2E8B5F`
  - Fonts: Schibsted Grotesk (display), Inter (body), SF Mono (numbers)
- **Persistence:** `localStorage` keys, mirrored to **Supabase** (`public.app_state`, JSONB, key = primary key) via `sync.js`.
- **Sync rule (important):** on initial page load sync **merges** (never deletes local-only keys); only realtime events from other devices may delete. This fixed the "I can't add anything" bug.
- **Navigation:** `topbar.js` injects the bottom tab bar on every page except finance (which has its own internal tabs + a Back button).

### Files
| File | Purpose |
|------|---------|
| `index.html` | **Main** — agenda, daily quote, missions, focus skills, core tracker |
| `character.html` | **Body / Daily / Quests / Skills / History** tabs |
| `finance.html` | Net Worth / Maandlasten / Wishlist |
| `gym.html` | Hevy-linked workout view (to be simplified) |
| `health.html`, `po-water.html` | health & water trackers |
| `settings.html` | focus skills, active skills, PIN, quotes |
| `xp.js` | skill definitions, XP/level math, habits, addXP/removeXP |
| `quests.js` | quest ladders per skill (v4.4) |
| `ventures.js` | Ventures: business quest ladders (v7.0) |
| `checkin.js` | Streak engine + evening check-in storage (v7.1) |
| `push.js` | Web Push client: SW registration + subscription → Supabase (v7.2) |
| `sw.js` | Service worker: shows push notifications, tap opens app (v7.2) |
| `sync.js` | Supabase cloud sync |
| `topbar.js` | top bar + bottom nav |
| `manifest.json` | PWA — start_url = index.html |

---

## 3. Bottom navigation (5 tabs)

`Main 🏠 · Body 💪 · Skills ⚔️ · Finance 💰 · Settings ⚙️`

(Body & Skills both live in `character.html`; Skills opens via `character.html#skills`.)

---

## 4. Level system

- **Skill level:** `level = floor(sqrt(xp/50)) + 1`, capped at **100**. XP comes from quick-log actions per skill.
- **Habits:** separate **0–10 score** (NOT XP). +1 per day done, max 10; drops only after a missed day, so 10 days of slacking returns to 0. No punishing streaks.
- **Body Level:** average level of the body skills (Gym, Strength, Calisthenics, Core, Mobility, Endurance, Recovery, Tennis). Shown on the Body tab.
- **Total Level:** average level of all non-habit skills (0-100 scale, like Body Level). Shown on the Skills tab.

---

## 5. The tabs in detail

### Main (`index.html`)
1. Character strip (name + total level)
2. Greeting + **daily rotating motivational quote** (deterministic per day)
3. **Agenda** — 6:00–23:00 day view, gold day-bar, ‹ › navigation (−7…+30 days), auto-scrolls to current hour today
4. **Plan tray** — tap a mission/focus-skill chip → pick a time (or tap a slot) → it drops into the agenda. Marking a block done awards XP. (Tap-to-plan, not drag — reliable on mobile. Drag is a possible future upgrade.)
5. Today's Missions · Focus Skills · Core Tracker (whistling, dancing)

### Body (`character.html` → Body)
- Anatomical muscular male figure (SVG). Muscle groups brighten/grow with their skill:
  - chest + shoulders → **Strength**
  - arms + forearms → **Calisthenics**
  - abs + obliques → **Core** (visible sixpack appears at Core lvl 25+, sharper higher up)
  - legs + calves → **Gym**
- Overall **Body Level** + **mood face** (smiles when all body habits done today)
- Day nav to backlog a forgotten day
- 7 tappable body-skill cards → open the real skill detail panel
- Body composition row (weight / body fat / muscle) from Apple Health
- Hevy "last workout" widget

### Skills (`character.html` → Skills)
- **Skills view:** RuneScape-style icon grid grouped by domain, each cell = level/100 + progress bar. Total Level banner on top + maxed counter. Private skills behind PIN.
- **Quests view:** pick a skill → level-gated quest ladder. Quests unlock at their level; claiming grants XP. 28 skills, 261 quests (see `quests.js`).
- **Ventures view (v7.0):** business ideas as quest ladders (see section 8a).

### Finance (`finance.html`)
- Net Worth (bank/stocks/crypto/other), Maandlasten (subscriptions, mark paid), Wishlist (% of net worth).
- Subscriptions are **excluded from the allocation donut** (Joey's request).

---

## 6. Domains & colours

`money 💰 #F5C842 · body 💪 #6BE3A4 · mind 🧠 #7DD3FC · business 📈 #C4B5FD · lifestyle ✨ #FB923C · knowledge 📚 #818CF8`
(`discipline` → mind, `creative` → knowledge.)

---

## 7. Apple Health → Supabase sync

- iOS Shortcut POSTs to Supabase. Keys: `apple_health:yyyy-MM-dd`, daily data `rpg_daily_v1:yyyy-MM-dd`.
- Project URL `https://ttxjsoahmtennnufgeqx.supabase.co`, publishable key used for both `apikey` and `Authorization: Bearer`, header `Prefer: resolution=merge-duplicates` for upsert.
- Three daily syncs planned.
- Shortcuts pitfall: "no internet connection" usually = Rich Text URL formatting; use a dedicated URL action and reference it as a variable.

---

## 8a. Ventures (v7.0) — business quest ladders

Business ideas as structured ladders: **phases → steps doable in a single evening** (first step of any venture ≤ 30 min). Steps award XP to existing skills (sales, marketing, coding, ai_tools) through `window.addXP` — `xp.js` untouched.

- **Data:** `ventures.js`, localStorage `rpg_ventures_v1` (synced, seeded only if absent). Step: `{id, title, detail, minutes, xp:{skill:amount}, boss, done, doneAt}`.
- **UI:** third view in the Skills toolbar (Skills / Quests / Ventures), reuses the quest-ladder styling. Boss steps get a heavier ink border. Deep-link: `character.html#ventures`.
- **Home:** "Next Move" card (after Day Score) shows exactly **one** next step per active venture with a minutes badge; tap opens the ventures view. Hidden when nothing is open.

**Active ventures:**
1. **Grip** — pain-relief squeeze ball, B2B via tattoo studios. 5 phases, 17 steps. Boss: *First euro* (a studio buys or sells the first ball). Purpose: learn the full business cycle (validate → source → brand → sell → systemize) on a small budget.
2. **Gamenfy Public** — from personal dashboard to something others can use. 3 phases, 7 steps. Boss: *Scope locked* (MVP scope written as a build doc).

**Parked business ideas** (do not build; keep for later ladders):
- Candy mix pot with mix mechanism (hardware product)
- Invisible-units strategy game (hobby / coding project)
- Cleaning company (backup learning business)

---

## 8. Version history

- **v4.1** fixed dead character tabs, the add/sync-wipe bug, habit levels 0–10, subscriptions out of donut, PWA opens on Main
- **v4.2** Main agenda + daily quote + tap-to-plan
- **v4.3** Body tab with anatomical figure, Body Level, mood face
- **v4.4** RuneScape Skills grid + Total Level + quest system
- **v4.5** complete quest coverage (28 skills, 131 quests)
- **v4.6** expanded quest ladders — denser levels 1-100 (261 quests)
- **v5.x–v6.4** Daylight visual pass, skill photo tiles with local fallback (`img/skills/`), Hevy strength analysis (Epley 1RMs on Joey's actual lifts), agenda + home reorder (quote → Day Score → Agenda → To-Do), money skills reworked (distinct identities), piano/calisthenics/reading/whistling ladders rebuilt from tier writeups, Puzzling skill added
- **v7.0** Ventures layer: Grip + Gamenfy Public quest ladders, Next Move home card, master doc update
- **v7.3** Health section on the Body tab (Apple Health-style): 2x2 metric cards — Steps, Active Energy (from `apple_health:*` rows incl. the trailing-space/string quirks), Training Volume (live from Hevy, kg per workout day), Weight — each with today's value, 7-day average and a 14-day bar chart in the metric's colour. Tap → bottom sheet with a 30-day chart, daily avg / best day / days-logged stats, and a stale-data warning when the Health sync Shortcut has stopped. Note: web apps cannot read HealthKit directly — data always arrives via the iOS sync Shortcut (broken since 2026-06-09 at build time; Joey to fix).
- **v7.2** Automatic evening push (no Shortcuts): Supabase Edge Function `send-daily-push` + pg_cron `gamenfy-daily-push` at 17:30 UTC (≈19:30 NL summer). Function reads `app_state` key `rpg`, skips the push when the day is already closed, personalises with streak + next venture step, prunes dead subscriptions. Devices register via a one-time "Turn on" card on Main (requires the PWA opened from the home screen, iOS 16.4+); subscriptions live in `app_state` key `push_subscriptions`. VAPID keys + cron secret live only in the deployed function, not in this public repo.
- **v7.1** Engagement layer: day streak (flame pill in the greeting, `rpg_streak_v1`, a day counts on any XP / mission / venture step / closed check-in; at-risk pulse after 17:00, never punitive mid-day) + Jarvis evening check-in (bottom sheet from 17:00: XP/missions/streak recap, up to 3 open actions completable inline, "Close the day" secures the streak; `rpg_checkin_v1`). Daily notification runs as an iOS Shortcut automation (out of app scope).

---

## 9. Roadmap / open items

**Next builds (in order):**
1. [x] **Jarvis daily check-in + streak + automatic push** — shipped in v7.1/v7.2. Joey only taps "Turn on" once in the home-screen app.
2. [ ] **Tier-lock system** (system-wide: milestone completion gates tier advancement) — next build
3. [ ] **Skill photos** — replace placeholder tiles (pure visual session, no features)

**Backlog:**
- [ ] Three-times-daily Apple Health sync setup
- [ ] Optional drag-to-move in the agenda (currently tap-to-plan)
- [ ] Realistic skill illustrations / celebration clips via Higgsfield (needs credits)
- [ ] Quest ladders for private discipline skills (intentionally omitted for now)
- [ ] Weekly/monthly agenda views (currently day view only)

---

## 10. Working agreement

- Claudia replies in Dutch; app stays English.
- Build in phases, push per phase so Joey can test live.
- Be critical, keep it premium and functional ("liever werkend dan mooi-maar-kapot").
- GitHub: `github.com/Kingkangaroos/Joe`. A fine-grained token (Contents: read/write) lets Claudia push directly from chat; re-paste it each new session.
