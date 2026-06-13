# GAMENFY — Master Document (v4.5)

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
| `quests.js` | quest ladders per skill (NEW in v4.4) |
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

## 8. Done this session (v4.1 → v4.5)

- **v4.1** fixed dead character tabs, the add/sync-wipe bug, habit levels 0–10, subscriptions out of donut, PWA opens on Main
- **v4.2** Main agenda + daily quote + tap-to-plan
- **v4.3** Body tab with anatomical figure, Body Level, mood face
- **v4.4** RuneScape Skills grid + Total Level + quest system
- **v4.5** complete quest coverage (28 skills, 131 quests)
- **v4.6** expanded quest ladders — denser levels 1-100 (261 quests)

---

## 9. Roadmap / open items

- [ ] Simplify the gym page (Joey found it too complex); keep Hevy → Apple Health bridge
- [ ] Three-times-daily Apple Health sync setup
- [ ] Optional drag-to-move in the agenda (currently tap-to-plan)
- [ ] Realistic skill illustrations / celebration clips via Higgsfield (needs credits)
- [ ] Decide if Finance should also appear as a sub-tab under Body (currently its own tab — left separate on purpose)
- [ ] Quest ladders for private discipline skills (intentionally omitted for now)
- [ ] Weekly/monthly agenda views (currently day view only)

---

## 10. Working agreement

- Claudia replies in Dutch; app stays English.
- Build in phases, push per phase so Joey can test live.
- Be critical, keep it premium and functional ("liever werkend dan mooi-maar-kapot").
- GitHub: `github.com/Kingkangaroos/Joe`. A fine-grained token (Contents: read/write) lets Claudia push directly from chat; re-paste it each new session.
