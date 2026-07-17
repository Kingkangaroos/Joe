# GAMENFY — Master Document (v9.21)

> Single source of truth for the Gamenfy dashboard. Read this first in any new session.
> Joey calls the assistant "Claudia". App UI is in English. Aesthetic: premium & light ("Daylight"), not dark/gamey.

---

## 1. What Gamenfy is

A gamified personal Life OS — version 0.1 of a future product. Skills, levels, habits, quests, ventures, streaks and a check-in loop turn real life into an RPG. Runs as a PWA (add-to-homescreen, iOS 16.4+ for push) and opens on **Main**. Design principle: *liever werkend dan mooi-maar-kapot.* The engagement engine (morning/evening push, streak, check-ins, focus timer) exists because the day-one problem was "ik maak lijstjes maar begin niet".

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
| `gym.html` | RETIRED (v9.5) — instant redirect to index.html so old bookmarks and the installed PWA icon (added from this page) land on Main. Weight logging lives on the Body tab; po_coach_* localStorage data untouched, its cloud sync moved to character.html |
| `health.html`, `po-water.html` | health & water trackers |
| `settings.html` | focus skills, active skills, PIN, quotes + **Engine & nudges** (push/card prefs, focus minutes → `rpg_prefs_v1`) |
| `xp.js` | skill definitions, XP/level math, habits, addXP/removeXP |
| `quests.js` | quest ladders per skill (v4.4) |
| `ventures.js` | Ventures: business quest ladders (v7.0) |
| `checkin.js` | Streak engine + evening check-in storage (v7.1) |
| `push.js` | Web Push client: SW registration + subscription → Supabase (v7.2) |
| `sw.js` | Service worker: shows push notifications, tap opens app (v7.2) |
| `jarvis.html` | Jarvis chat page (v8.3, backed by the `jarvis` edge function) |
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
- **Tier-lock (v7.4):** effective level is capped at gates **10/25/50/75** until that gate's quest (highest quest ≤ gate) is claimed — `tierLockInfo()` in xp.js, applied everywhere levels show. XP always keeps accruing.
- **Level-up toasts (v8.0):** any addXP that crosses a level shows "Skill → Level N".
- **Habits:** separate **0–10 score** (NOT XP). +1 per day done, max 10; drops only after a missed day, so 10 days of slacking returns to 0. No punishing streaks.
- **Body Level:** average level of the body skills (Gym, Strength, Calisthenics, Core, Mobility, Endurance, Recovery, Tennis). Shown on the Body tab.
- **Total Level:** average level of all non-habit skills (0-100 scale, like Body Level). Shown on the Skills tab.

---

## 5. The tabs in detail

### Main (`index.html`)
1. Greeting + **streak flame pill** (ember when today is secured, pulses when at risk after 17:00) + round **Jarvis button** → jarvis.html
2. Daily rotating quote (deterministic per day) · Day Score arc
3. **Time-aware check-in card:** <12:00 Morning Brief ("Own the day", Lock it in) · 12–17 hidden · ≥17:00 Evening check-in (recap + up to 3 open actions completable inline + **Close the day** → streak secured). Streak: any XP / mission / venture step / closed day counts; never breaks mid-day.
4. **Weekly Review card** (Sunday reviews the ending week; Mon–Wed catch-up for last week): XP, active days, venture steps, energy-by-domain bars, top skills, one rule-based insight.
5. **Next Move card:** exactly one next step per active venture + **custom moves** (+ Add, `rpg_custom_moves_v1`), each with a **Start** button → full-screen **focus timer** (persists across refresh via `rpg_focus_session_v1`; Done completes the step and awards XP).
6. **Agenda** — 6:00–23:00 day view, ‹ › nav, tap-to-plan tray (marking a block done awards XP). **Time Sketcher (v9.0):** tapping an *empty* hour with nothing armed opens a sheet — skills grouped by domain (Focus skills pinned, Daily missions last, live tier-locked levels); picking one shows the exact right practice from the ladder (open tier gate first, else lowest unclaimed unlocked quest, else next unlock + top quick-log action; habits show their why) and places a normal agenda block carrying the quest title as inline hint.
7. **Missions** in Daily-tab quest-card style (v9.0: two-column mq-* grid with icon/check/level/XP + truncated why) with **Yesterday toggle** (fills a forgotten day: `checkHabitFor`, +15 XP, streak day stamped) · **Gratitude box** (v9.0: same storage as the Daily tab — `rpg_gratitude_v1` + `gratitudeXpGiven` in `rpg_daily_v1:date`; first word/day = +10 XP) · Focus Skills · Core Tracker (whistling, dancing)
8. One-time push setup card until notifications are enabled

### Body (`character.html` → Body)
- **Hologram body scan** (v7.6, pure SVG): translucent cyan figure with glow, pulsing measurement rings, sweeping scanline, projection cone. Muscle groups brighten/grow with their (tier-locked) skill level + Hevy volume: chest/shoulders → Strength, arms/forearms → Calisthenics, abs/obliques → Core, legs → Gym. Four tappable callout pills (STRENGTH/CORE/LEGS/ARMS with live LV) deep-link to skills.
- **Health section** (v7.3, Apple Health-style): metric cards Steps · Active Energy · Training Volume (live from Hevy) · Weight · **Sleep** · **Resting HR** (last two show "Waiting for Fitbit Air" until data flows). Tap → 30-day chart + avg/best/days-logged; stale-sync warning built in.
- Body Level + mood face · day nav · body-skill cards · body composition row · Hevy last-workout widget

### Skills (`character.html` → Skills)
- **Skills view:** RuneScape-style icon grid grouped by domain, each cell = level/100 + progress bar. Total Level banner on top + maxed counter. Private skills behind PIN.
- **Quests view:** pick a skill → level-gated quest ladder. Quests unlock at their level; claiming grants XP. 28 skills, 261 quests (see `quests.js`).
- **Skill detail panel:** fully Daylight since v9.0 (whole legacy dark sheet family converted: sd-panel, quick-log, day detail, gratitude detail, milestone confirm; PIN modal intentionally stays dark). Contains a **tier checklist**: next gate + every remaining unclaimed quest below it, unlocked ones claimable inline (`sdClaimQuest`), locked ones show their unlock level.
- **Ventures view (v7.0):** business ideas as quest ladders (see section 8a).

### Finance (`finance.html`)
- Net Worth (bank/stocks/crypto/other), Maandlasten (subscriptions, mark paid), Wishlist (% of net worth).
- Subscriptions are **excluded from the allocation donut** (Joey's request).

---

## 6. Domains & colours

`money 💰 #F5C842 · body 💪 #6BE3A4 · mind 🧠 #7DD3FC · business 📈 #C4B5FD · lifestyle ✨ #FB923C · knowledge 📚 #818CF8`
(`discipline` → mind, `creative` → knowledge.)

---

## 7. Health data pipeline & server side (accuraat per v9.21)

- **Primaire bron: Fitbit Air → Google Health API v4** via edge function `fitbit-sync` (v6). OAuth-tokens in `app_state.google_health_tokens` (auto-refresh, `needs_reauth`-vlag bij verlopen test-app-consent → dan is `?auth=1` één tik). Daily pull (cron `fitbit-sync-pull`, 6:05/13:05/21:05 UTC) → `app_state.health_fitbit`: per datum `{steps, activeMinutes, sleepMinutes, restingHR, weightKg}`, **60 dagen accumulerend**, null-safe merge per veld. Gekalibreerde v4-kennis: dailyRollUp body `{range:{start,end}, windowSizeDays}`, response `rollupDataPoints[].civilStartTime`, steps=`countSum`, AZM=`sumIn*HeartZone` (totaal = fatBurn + 2×cardio + 2×peak), **sleep en RHR ondersteunen GEEN dailyRollUp** → list-endpoint; slaap = som niet-AWAKE stages op lokale wekdatum, RHR genest in `dailyRestingHeartRate.{date,beatsPerMinute}`. Weight komt niet van de Air (geen weegschaal) → handmatige weight-kaart op Body (v9.5, `po_coach_weights`).
- **Body-tab:** `hmFetchAll` merget `health_fitbit` óver de legacy `apple_health:yyyy-MM-dd`-rijen (dood sinds 2026-06-09; Shortcut-fix bij Joey optioneel geworden). Metric-details in Google Health-stijl (v9.18).
- **Edge functions live:** `jarvis` v6 (Gemini function calling + actie-wachtrij + spraak + Fitbit-context, x-jarvis-pin auth), `send-daily-push` v7 (ochtendbrief door Gemini met structured output, avond statisch; prefs-aware; VAPID alleen hier), `fitbit-sync` v6, `import-media` v2 (secret-protected → skills-bucket), `health-sync` v2 = **TOMBSTONE** (410; oude REPLACE_ME-skelet vervangen door fitbit-sync — mag via dashboard weg).
- **Crons:** `gamenfy-morning-push` 06:30 UTC (25 min ná de fitbit-pull → verse slaapdata in de brief), `gamenfy-daily-push` 17:30 UTC, `fitbit-sync-pull` 6:05/13:05/21:05 UTC.
- **Debug-patroon:** rijen `push_debug` en `health_fitbit.debug` vangen ruwe API-fouten voor snelle iteratie via pg_net + SQL.
- **Supabase REST vanaf clients:** publishable key als `apikey` + `Authorization: Bearer`, `Prefer: resolution=merge-duplicates` voor upserts.

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

## Security-notities (Supabase advisors, 2026-07-15)
Vier WARN-bevindingen, allemaal bewuste trade-offs van de huidige architectuur
(één gebruiker, publishable key in publieke repo):
1. `app_state` RLS: anon INSERT/UPDATE altijd-true — **by design**: de hele
   device-sync schrijft met de publishable key. Consequentie: iedereen met de
   key (die in de repo staat) kan de app-state lezen/schrijven. Echte fix =
   Supabase Auth invoeren (groter project, geparkeerd).
2. Bucket `progress-photos` is publiek listbaar — voortgangsfoto's zijn dus
   opvraagbaar voor wie de bucket-URL kent. Overwegen: listing-policy weghalen
   (URL's blijven werken) — kleine fix, kan in een volgende sessie.
3. `pg_net` in public schema — hygiëne, laag risico.

## 8. Version history

- **v9.21 — waarheidsronde in het masterdoc + wees-functie opgeruimd.** §7 (health/server) beschreef nog het oude `health-sync`-skelet als "incoming source" en verouderde functie-versies — volledig herschreven naar de v9.20-werkelijkheid (fitbit-sync pipeline incl. alle gekalibreerde v4-schema-kennis, actuele functieversies, crons, debug-patroon). De wees-functie `health-sync` (REPLACE_ME-skelet) is overschreven met een 410-tombstone die naar fitbit-sync verwijst (MCP kan functies niet verwijderen; definitief weghalen kan via het dashboard). Server-mirrors in de repo geactualiseerd. Sessie-ritueel: backlog leeg, wachtrij leeg, Vercel-deploy geverifieerd.

- **v9.20 — JARVIS 2.0 COMPLEET: fase 2, de ochtendbrief, is live.** send-daily-push v7: in morning-mode schrijft **Gemini** de push — input = streak, verse Fitbit-slaap/stappen/RHR (fitbit-sync cron draait 25 min eerder, dus de slaapdata is altijd vers), open venture-stap en Jarvis' eigen notities over Joey; output via **structured output** (responseMimeType application/json + responseSchema — nodig omdat vrije-vorm JSON twee keer faalde: eerst vrat thinking het tokenbudget op ondanks thinkingBudget:0-poging, daarna raakte het model verward door een prompt-regel over aanhalingstekens; schema-dwang loste beide definitief op, gevonden via de push_debug-vangstrij). Fallback = het oude statische bericht (author-veld in de response toont welke won). De brief wordt óók als assistant-bericht in jarvis_memory gezet zodat het gesprek in de Jarvis-tab naadloos doorloopt vanaf de ochtendgroet, en de push opent op jarvis.html. Live getest: *"Tijd voor actie, Joey! ⚡ — Met 6u slaap is focus goud waard. Zet vandaag de timer op 30 minuten en definieer de eerste product-stap van je venture."* — echte slaapdata + Grip stap 1. Settings-toggle morning_push wordt gerespecteerd; cron ongewijzigd (6:30 UTC). **Alle drie de Jarvis 2.0-fasen uit het ontwerp zijn hiermee af.**

- **v9.19 — Jarvis fase 3 (Fitbit-context) + security-fix.** (1) Session-start ritueel gedaan: jarvis_backlog leeg, 0 openstaande acties → de −90 no_porn-correctie is op Joey's toestel toegepast. (2) **Jarvis edge function v6**: `health_fitbit` wordt bij elk bericht meegeladen — de live status toont nu "Fitbit vandaag: X stappen, slaap Yu, RHR Z, N zone-min · gisteren: …", `get_state` kent de nieuwe sectie **health** (laatste 7 dagen) en het systeem-prompt bevat een coaching-instructie voor gezondheidsdata (weinig slaap → rustiger dag; weinig stappen → wandeling koppelen aan de 10k-habit; dalende RHR → conditiewinst benoemen). Daarmee zijn alle drie de Jarvis 2.0-fasen uit het ontwerp afgerond behalve fase 2 (ochtend-push) — die staat nog open. (3) **progress-photos bucket op private** gezet: de foto-UI verdween met de gym-pagina (alleen de sync-key resteert, niets toont of uploadt nog), dus publieke toegang was puur risico zonder functie. Foto's blijven bewaard; een toekomstige Body-tab feature gebruikt signed URLs.

- **v9.18 — Google Health-stijl metric details (Daylight-skin).** Joey wilde de presentatie van de Google Health app gekloond: de Body-tab metric-sheet is herbouwd naar dat layout-patroon — periode-pills **W/M/3M** (7/30/90 dagen, live herrenderen), groot **bereik-getal** ("5.762–6.283" / "5h 39m – …") met context-subtitel (high · avg · goal), en een **vloeiende lijngrafiek** (Catmull-Rom → bezier SVG, gaten in data breken de lijn netjes i.p.v. naar nul te duiken, losse dagen worden punten) met **gestippelde referentielijnen** à la Google Health: groen voor het doel (10k stappen / 8h slaap) en grijs voor het periodegemiddelde, labels rechts op de as. Slaap formatteert als "7h 20m". Alles in Daylight (bone-white) conform Joey's vaste stijlregel — structuur gekloond, huid van onszelf. hmSmoothPath unit-getest.

- **v9.17 — FITBIT AIR DATA STROOMT LIVE. 🎉** De volledige Google Health-keten werkt end-to-end, gekalibreerd op Joey's echte data via een snelle debug-loop (fout in de rij → docs → herdeploy, 6 functie-iteraties): (1) OAuth vereiste test-user-registratie (`joeysiemons@hotmail.com`) en het aanzetten van de Health API in het Cloud-project; (2) dailyRollUp-schema bleek `range:{start,end}` met CivilDateTime, response `rollupDataPoints[].civilStartTime` + union values; (3) steps = `countSum` ✓; (4) AZM = `sumInFatBurn/Cardio/PeakHeartZone` → fatBurn + 2×(cardio+peak); (5) **sleep ondersteunt geen dailyRollUp** → list-endpoint + eigen stages-sommatie (niet-AWAKE), dag = lokale wektijd via utcOffset; (6) **RHR idem** → list, dag genest in `dailyRestingHeartRate.date`, waarde `beatsPerMinute`. Eerste echte waarden: 6.283 stappen vandaag / 5.762 gisteren, RHR 66/82, slaap 339 min, AZM 12/14. Weight blijft handmatig (Air heeft geen weegschaal) — de Body-tab weight-kaart (v9.5) is daarvoor. Function v6 (code-v7) **accumuleert nu 60 dagen historie** met null-safe merge per veld; **pg_cron job 3** pullt om 6:05/13:05/21:05 UTC. Body-tab `hmFetchAll` merget de health_fitbit-rij over de (sinds 9 juni dode) Apple Health-data heen — kaarten en grafieken vullen zich vanzelf. Testing-mode kanttekening blijft: bij token-verloop zet de functie needs_reauth en is ?auth=1 één tik.

- **v9.16 — GOOGLE HEALTH SYNC DEPLOYED.** dev.fitbit.com bleek dicht voor nieuwe registraties; Joey registreerde in de Google Cloud Console (project `gamenfy`, OAuth web client, Testing-mode met zichzelf als test user, redirect = de fitbit-sync URL mét ?cb=1 zoals geregistreerd). Edge function `fitbit-sync` v1 live: Google OAuth 2.0 (access_type=offline, prompt=consent), tokens in `app_state.google_health_tokens` met auto-refresh en needs_reauth-detectie (Testing-mode tokens kunnen verlopen), daily pull van steps / active-zone-minutes / sleep / daily-resting-heart-rate / weight via `POST health.googleapis.com/v4/users/me/dataTypes/{type}/dataPoints:dailyRollUp` voor gisteren+vandaag → `app_state.health_fitbit`. Veldextractie is tolerant (deepFind over kandidaat-veldnamen) en API-fouten landen in `.debug` — na Joey's eerste autorisatie kan Claudia via pg_net de pull draaien en de exacte v4-responsevorm kalibreren. **Volgende stap: Joey opent de ?auth=1-link en tikt Toestaan.** Daarna: Body-tab koppelen aan health_fitbit + dagelijkse cron.

- **v9.15 — decay bug fixed + fresh-start reset.** (1) **Confirmed design**: missing a day drops the habit score by exactly −1 (max 10) — but `applyHabitDecay` had a compounding bug: every run subtracted the TOTAL missed-day count from the already-decayed score, so opening the app daily during a 3-day gap took a score of 5 to 0 instead of 2 (quadratic decay). Fixed with a `decayedThrough` anchor that remembers what's already been written off; unit-tested day-by-day vs skip-ahead — identical outcomes (5→4→3→2), and a re-check after the gap gives +1 from the decayed value with streak reset to 1. (2) **Reset & start fresh** in the mission detail sheet (habits AND private quests): double-tap-to-confirm link → writes a per-key marker in `rpg_habit_reset_v1` (new synced key on index/character/settings) so streak/total/missed count from today, zeroes the habit engine's score/streak/lastChecked/decay anchor — **XP stays untouched, earned is earned** — and reopens the sheet at day-1. Stats-filter unit-tested (10-day history + reset yesterday → total 2, missed 0).

- **v9.14 — mission detail sheets + no_porn diagnosis + housekeeping.** (1) **Tapping a mission card now opens a detail sheet first** (the check-circle stays a one-tap quick toggle): header with icon/label + habit score (or skill LV for private), three stat tiles (🔥 current streak · ✓ total days ever, from rpg_habitlog_v1 or a 365-day rpg_daily_v1 walk for private · missed days since first log), the FULL why, and the benefits timeline as a checklist where earned stages are green-checked "DAY n · YOURS" and future ones show their unlock day — then a big Check button (routes through the normal toggle, so confetti still fires) and an undo link when already checked. Stats logic unit-tested (gap-streak, private walk-back). (2) **no_porn "level 2" diagnosed from live data**: today's check/uncheck cycles were perfectly symmetric; the 90 XP came from two stale June-1 "+45 Geen porno" entries from an old flow. A −90 correction action is queued (and the consumer clamp was widened to allow negative Jarvis corrections, −500..500). (3) Dancing removed from the Core Tracker (actively picked up → lives with regular skills). (4) FITBIT-SETUP verified against May-2026 reality: Fitbit app → Google Health app; dev.fitbit.com API unchanged. (5) PARKED — "purpose-driven focus skills": goal-first design session where Joey defines 2-3 concrete goals and focus skills + quest priorities derive from them.

- **v9.13 — half-hour agenda + custom tasks.** Agenda `time` may now be fractional (14.5 = 14:30): rows still render per hour but match on `Math.floor(time)` with a time-sort, blocks with a half get a small :30 chip, and toggle/remove use the identical floored+sorted filter so indices stay consistent (unit-tested incl. removing the right duplicate-:30 block). The Time Sketcher header gained a :00/:30 segmented toggle applying to every placement. NEW custom tasks: an input at the top of the sketch sheet — type a name + Add places an unlinked 📝 task (completing it = +10 XP Planning, "Task: <name>"); type a name and then TAP A SKILL to link it (block takes the skill's icon/type and awards its normal agenda XP). Jarvis' plan_agenda keeps whole hours.

- **v9.12 — science layer + celebration + Jarvis in the nav.** (1) **Benefits timelines** on all 12 habits + both private skills in xp.js: `benefits:[{d,t}]` stages with real research anchors (Zeidan 2010 attention, Hölzel 2011 amygdala, Emmons & McCullough gratitude/sleep, Buijze 2016 cold-shower sick days, Auer 2016 verbal memory, Voon/Kühn cue-reactivity; small-study claims hedged). (2) **Private whys rewritten** scientifically — the "why not do it and what it costs you" Joey asked for; `quickLog:null` preserved exactly (a fabricated quickLog was caught by diffing against HEAD and reverted). (3) **Celebration overlay**: checking a habit today (incl. private daily quests, whose streak is computed by walking rpg_daily_v1 backwards) pops confetti (34 CSS particles, Daylight palette) + "X days in a row!" + "Already yours: <current benefit>" + "Keep going → day Y: <next benefit>"; all-stages-done shows a crown line; tap or 4.2s dismisses. Yesterday-toggles keep the plain toast. (4) Mission cards show 🔥Nd at streak >1; unlocked private cards now show their why. (5) **Jarvis got a real place in the nav**: the bottombar Settings slot is now 🤖 Jarvis; Settings moved to a gear in the topbar.

- **v9.11 — JARVIS 2.0 FASE 1 LIVE.** Jarvis kan nu zelf handelen. Edge function v5: Gemini function calling met zes tools (award_xp / check_habit / claim_quest / plan_agenda / get_state / propose_change), een gegenereerde kennis-kaart uit xp.js+quests.js (45 skills incl. quickLog-XP-ankers, 33 quest-ladders met XP per level) voor server-side validatie, GAMENFY-kennisblok in het prompt, tool-loop max 5 rondes, spraak (v9.10) werkt door alles heen. Acties gaan naar `app_state.jarvis_actions`; xp.js kreeg een **consumer** (poll bij load + 60s) die ze uitvoert via de eigen engine — addXP/checkHabitFor/setQuestDone — met consumed-first-marking, een gesynct applied-ledger (`rpg_jarvis_applied_v1`, aan syncedKeys toegevoegd op index/character/settings) en een canApply-guard zodat pagina's zonder quests.js quest-claims laten staan voor index/character. Consumer end-to-end gesimuleerd: XP + habit + quest correct, ongeldige skill veilig geskipt, idempotent, één cloud-write. propose_change vult `jarvis_backlog` — **Claudia leest die rij voortaan aan het begin van elke sessie**. Verbeter-ideeën gaan dus via Jarvis vanzelf naar de bouwer.

- **v9.10 — Dutch voice messages for Jarvis.** Mic button in jarvis.html: tap → record (MediaRecorder, audio/mp4 on iOS with webm fallback, 60s cap, pulsing stop button), tap again → base64 audio POSTs to the jarvis function. Edge function v4 accepts {message} OR {audio:{data,mime}} and feeds the audio straight to Gemini as inlineData — transcription + coaching answer in ONE multimodal call, no separate STT service, same free key. The reply carries a <heard>-wrapped Dutch transcript which the client swaps into the user bubble (🎙️ "…") and which becomes the textual history entry, so memory stays clean text. Typing unchanged. This also pre-solves voice for Jarvis 2.0: the future function-calling loop receives the same transcribed intent.

- **v9.9 — two build-ready designs, no code shipped to the app.** (1) `JARVIS-2.0-DESIGN.md`: full architecture for a self-sufficient Jarvis — Gemini function calling (award_xp / check_habit / claim_quest / plan_agenda / get_state / remember / propose_change), an **action queue** in a dedicated `app_state.jarvis_actions` row consumed client-side through the existing engine (mandatory because sync.js pushes whole blobs last-write-wins — server writes into `rpg` would be wiped), a GAMENFY knowledge block in the system prompt, honest limits (site-editing becomes a `jarvis_backlog` for Claudia, not autonomous pushes), 3 phases with a concrete definition-of-done. NEXT DEDICATED SESSION = phase 1. (2) `FITBIT-SETUP.md` + `server/fitbit-sync/index.ts`: complete OAuth+daily-pull scaffold (authorize/callback/pull modes, token refresh, steps/sleep/RHR/weight → app_state.health_fitbit). Blocks on exactly two strings from Joey: Fitbit Client ID + Secret from dev.fitbit.com (10-min registration, doable before the device arrives).

- **v9.8 — Jarvis LIVE on Gemini.** Joey delivered his Google AI Studio key; the jarvis edge function was redeployed (v3) swapping Anthropic → Gemini `gemini-flash-latest` while keeping everything else byte-compatible: x-jarvis-pin auth, persistent history + <remember> long-term notes in app_state, live streak/venture/top-skill context, same {message}→{reply} interface so jarvis.html needed zero changes. First deploy attempt flipped verify_jwt to true (MCP default) which would have 401'd the PIN-based client — caught and redeployed with verify_jwt:false per the original design. Also fixed a malformed week-filter date comparison from v8.3 in the port. Key lives server-side only.

- **v9.7 — Coloring 🖍️ + Drawing ✏️** (creative domain) with full unlock ladders. Coloring: relaxation-first (why cites mandala-coloring anxiety studies), 10 quests from First Page to Zen Master (50 pages), gates covered at 8/20/42/70. Drawing: classic observation-first progression (lines → shapes → still life at the LV10 gate → perspective → hands → portrait → own style → commission-ready), 11 quests, gates at 10/24/46/74. Both have quickLogs and milestone arcs; invariant audit re-run over the now 349 quests: 0 findings; tier-lock mechanic verified end-to-end (lvl-15 capped at 10 until Still Life claimed).

- **v9.6 — Household daily mission** (🧹, lifestyle domain, +15 XP on the Daily tab). Same full pattern as teeth (v9.1): xp.js habit def with an evidence-based why (visual clutter → attention load/cortisol/procrastination), character's ALL_DAILY_QUESTS + one-time append to stored active selections, settings toggle list kept in lockstep. Auto-appears in Main missions, evening check-in, streak, AND the Time Sketcher's Daily-missions group — which was the trigger: Joey wanted to plan "huis opruimen" into an agenda hour and had no matching option.

- **v9.5 — Joey's feedback round 2 (diagnosed against live Supabase data).** Real-data check first: whistling/dancing are healthy in the cloud (`active:true`, lifestyle) and the wishlist code path is correct — the reported symptoms trace to the installed PWA icon opening the retired gym page + iOS serving stale pages. Fixes: (1) **gym.html retired** → instant redirect stub to index.html (fixes "app opens on gym" permanently, removes the page as requested; po_coach data untouched). (2) **Weight moved to the Body tab**: compact card (latest kg + 7-day delta), tap → Daylight sheet with comma-tolerant input, same `po_coach_weights` format ({dateKey, weight}), same-day entries replaced; **po-coach cloud sync now initialised from character.html** (sync.js is per-call safe, verified). (3) **Mission texts visible again**: mq-labels were muted-grey → now ink/700, why-text darker + truncation 82→110 chars, done-state gets strikethrough + dim (motivation readable at decision time). (4) **Settings caught up**: daily-quest toggles gained Grounding + Brush Teeth (list had drifted from character's), `rpg_gratitude_v1` added to settings' syncedKeys. (5) Wishlist placeholder now shows a comma example. Site-wide static check re-run: green.

- **v9.4 — Joey's fix round + full-site static audit.** (1) **Weight main screen on gym.html hidden** on request ("geen toegevoegde waarde") — one CSS rule, data/sync/JS untouched, trivially reversible. (2) **THE wishlist bug:** euro inputs were `type="number"` + `parseFloat` — on Dutch iOS a comma decimal blanks the field → NaN → silent no-op. New shared `euroNum()` parser (comma/dot decimals, thousands, € signs; 9 unit cases green) + six amount inputs converted to `type="text" inputmode="decimal"`: wishlist, all four net-worth quick-adds (incl. +/- delta edits), and maandlasten. (3) **Maandlasten form completed:** the JS supported weekly/yearly (`monthlyEquivalent`) and looked up a `#subPeriod` select that didn't exist — the select is now in the form and wired into `item.period`. (4) **Site-wide static audit** (all 8 pages: syntax, every inline `onclick` handler resolves, every `getElementById` target exists in DOM or dynamic HTML): 7 findings triaged → all false positives (guarded dynamic elements) except the fixed `#subPeriod`; `#subFromCat` (pay-from-account for subs) is half-built scaffolding, guarded no-op — PARKED as a future maandlasten feature rather than rushed in.

- **v9.3 — scientific skills audit (roadmap item, Joey-approved).** Automated invariant scan across all 31 ladders / 328 quests (duplicate levels, gate coverage, XP monotonicity, tierLockInfo safety) + manual review of measurable ladders against established standards. Findings & fixes in `SKILLS-AUDIT.md`: 7 XP dips corrected (same-level, raise-only — done-keys untouched) and an 11-quest **endurance ladder** added (running benchmarks, sub-30 5K as the LV10 gate) for what was a physical-decay skill with zero content. Strength/calisthenics confirmed grounded in accepted progression standards and free of squat/deadlift by design. Private discipline skills left ladder-less per backlog.

- **v9.2 — timezone fix.** The habit/XP engine determined "today" in UTC (`toISOString`) while every page uses local dates. In NL (UTC+2) that meant: between 00:00–02:00 the engine stamped habit checks, xpLog entries and decay on *yesterday* — after-midnight check-ins wrote to the wrong daily key, "XP today" missed night entries, streak chains could break, and the settings reminder dedup misfired. Now one rule everywhere: **calendar day = local day.** Fixed in xp.js (`todayStr`, checkHabit's yesterday), character.html (`todayKey`→`ymdLocal`, day-shift, week window, heatmap keys, milestone stamps) and settings.html (reminder key). Verified with a frozen-clock test at 00:30 Amsterdam: lastChecked and xpLog land on the local day and a yesterday-streak chains to 4 instead of breaking. Historical UTC-stamped dates differ by at most one day — no migration needed.

- **v9.1** (1) **Brush Teeth 2× habit** added (`teeth`, body domain, 🦷): auto-appears in Main missions, evening check-in and streak; also added to the Daily tab (`ALL_DAILY_QUESTS` +10 XP) with the v7.8-style one-time append to stored active-quest selections. (2) **BUGFIX — Daily-tab checks never counted for habit levels:** the quest-card toggle only awarded XP and never called `checkHabitFor` or wrote `rpg_habitlog_v1`, so habit scores stayed at 0 and Main didn't show the check. Fixed: habit-mapped quests now credit score + log on check (deduped via the log) and decrement on uncheck (lastChecked only cleared when it matches that date). (3) **One-time backfill** (`rpg_daily_habit_backfill_v1`): walks the last 14 days of `rpg_daily_v1:*`, credits every done habit-quest that never reached the engine, oldest→newest so streaks chain; toast reports repairs. Unit-tested: 2-day scenario → score 2/streak 2, idempotent, no decay next day, non-habit quests (gym, no_porn) correctly skipped. (4) **Private daily quests on Main:** No Porn (+45) and Weed Control (+40) now render as PIN-locked cards after the habit cards (🔒/"PIN required"); unlock via the dark vault PIN sheet (sessionStorage `rpg_private_unlocked`, shared with character.html) shows real labels with skill LV, toggles write the same `rpg_daily_v1:<date>` storage as the Daily tab, Yesterday-toggle supported, and they count in the Day Score arc.

- **v9.0 (session 2)** Weekly review now shows the week's gratitude words (from `rpg_gratitude_v1`, lastDate within the review window, top 10 by count) between Top skills and the insight, plus a new insight for quiet-XP-but-grateful weeks. gym.html simplified for real: the legacy manual coach fully excised — advanced `<details>` block, day pill, settings button, all three modals (exercise/rotation/settings), ~900 lines of coach JS and all orphaned CSS (pruned by class-presence check, brace-balance verified). 3,579 → 1,815 lines. KEPT: weight log + sparkline + delta, composition estimate (reads historical `po_coach_v1` logs; degrades gracefully to weight-trend-only as coach data ages), progress photos incl. camera/compare/Supabase Storage, and the full pc-sync layer with `PC_SYNCED_KEYS` untouched — so no device ever deletes another's coach history. Units stay as stored (kg); the settings modal that edited them is gone.
- **v9.0** The v9 build list shipped in one session. (1) **Time Sketcher**: empty agenda hour → skill picker → practice suggestion straight from the quest ladder with tier-gate priority, placed as a normal block with quest-title hint; suggestion engine unit-tested against real xp.js+quests.js in all six states. (2) **Skill panel Daylight redesign**: entire dark sheet family (sd-panel, ql-*, day detail, gratitude detail, ms-confirm) native light; v8.10 contrast-override block deleted; inline dark leftovers fixed (white-on-white XP, invisible Not-yet button, dark textarea, weak green tags). (3) **Tier checklist** inside the skill panel with inline claims. (4) **Main missions in Daily-card style** (mq-* grid incl. why at decision time) + **gratitude box on Main** sharing the Daily tab's storage. Sync fix found in review: `rpg_gratitude_v1` was never in syncedKeys — added on index + character.

- **v4.1** fixed dead character tabs, the add/sync-wipe bug, habit levels 0–10, subscriptions out of donut, PWA opens on Main
- **v4.2** Main agenda + daily quote + tap-to-plan
- **v4.3** Body tab with anatomical figure, Body Level, mood face
- **v4.4** RuneScape Skills grid + Total Level + quest system
- **v4.5** complete quest coverage (28 skills, 131 quests)
- **v4.6** expanded quest ladders — denser levels 1-100 (261 quests)
- **v5.x–v6.4** Daylight visual pass, skill photo tiles with local fallback (`img/skills/`), Hevy strength analysis (Epley 1RMs on Joey's actual lifts), agenda + home reorder (quote → Day Score → Agenda → To-Do), money skills reworked (distinct identities), piano/calisthenics/reading/whistling ladders rebuilt from tier writeups, Puzzling skill added
- **v7.0** Ventures layer: Grip + Gamenfy Public quest ladders, Next Move home card, master doc update
- **v7.8** "Why" layer: every habit in xp.js DEFAULT_SKILLS now has a `why` field — an honest, evidence-based one-liner (no invented stats; grounding explicitly framed as early/small-study evidence, cold shower cites the Dutch ~29% fewer-sick-days trial, meditation the 8-week amygdala-reactivity findings). Shown in: Daily-tab quest cards (small line under XP), the skill detail sheet (card above the XP bar when `why` exists), and the evening check-in's open-mission rows (truncated ~90 chars — motivation at decision time). Grounding also added to ALL_DAILY_QUESTS + DEFAULT_ACTIVE_QUESTS with a one-time migration that appends it to stored rpg_active_quests_v1 selections.
- **v7.7** (a) Grounding added as daily body habit (`grounding` in DEFAULT_SKILLS, isHabit) — appears automatically in Today's Missions, the evening check-in and counts toward the streak; this is Joey's built-in reminder. (b) Body scan levels now tier-lock consistent (getBodySkillLevel applies tierLockInfo). (c) Money tiles 6/28: saving, investing, budgeting — curated Unsplash photos (Unsplash License, free commercial use), imported via import-media into the skills bucket at 800x1000 crop. Second pipeline documented: no credits needed, but less style-consistent than the Higgsfield series; swap candidates when credits return. net_worth added in v7.9 (Anthony Aird, gold coin stacks, Unsplash License) — Money category tiles complete (4/4). IMPORTANT for future batches: check the license on every Unsplash pick — plus.unsplash.com / "Unsplash+ License" photos are PAID and may NOT be used; only "Free to use under the Unsplash License". Also read the caption: tags lie (a "gold coins" hit turned out to be chocolate coins).
- **v7.6** Body figure → hologram body scan (pure SVG, no libraries). Anatomical figure restyled as a translucent scan hologram: cyan glow (feGaussianBlur filter), deep-blue→bright-cyan muscle fill by skill level (data-driven bulk via Hevy volume preserved), faceless head, projection cone + glowing base ellipse, three pulsing dashed scan rings (chest/waist/thighs), sweeping scanline animation, and four tappable measurement callouts anchored to the rings (STRENGTH / CORE / LEGS / ARMS with live LV values) that open the mapped skill. prefers-reduced-motion respected. Inspired by Joey's reference set (holographic X-ray / 3D body scan / RPG stat sheet).
- **v7.5** Visual phase started: skill photo pipeline live. Series style (use this exact template for every next tile): "Premium editorial still-life photograph, [SUBJECT SCENE], soft warm morning daylight through a window, bone-white and warm neutral color palette, minimalist composition, shallow depth of field, photorealistic, high detail, no people, no readable text" — model nano_banana_pro, 4:5, 1k, 2 credits/tile. Pipeline: generate on Higgsfield → edge function `import-media` (secret-protected) copies the result into the public Supabase Storage bucket `skills` → stable URL `.../storage/v1/object/public/skills/<key>.png` → entry in SKILL_PHOTO_URL (character.html). Done: strength, coding, sales. Remaining: all other skills — continue in batches as credits allow.
- **v7.4** Tier-lock, system-wide. New in `xp.js` (additive — level formula untouched): `TIER_GATES=[10,25,50,75]` + `tierLockInfo(skill, rawLevel)` → effective level capped at the first gate whose gate quest (highest quest at or below the gate level) is unclaimed. XP always keeps accruing; only the shown/used level is capped. Skills without a quest ladder are never capped. Applied in: RS skills grid (lock icon on capped tiles), skill detail (ink-bordered "Tier locked" banner naming the exact quest), quest ladder (uses effective level for unlocks, TIER GATE badges + banner), home Focus grid and Core tracker. `quests.js` now also loads on index. Fixed pre-existing gap: `rpg_quests_done_v1` was never in syncedKeys — quest completions now sync across devices.
- **v7.3** Health section on the Body tab (Apple Health-style): 2x2 metric cards — Steps, Active Energy (from `apple_health:*` rows incl. the trailing-space/string quirks), Training Volume (live from Hevy, kg per workout day), Weight — each with today's value, 7-day average and a 14-day bar chart in the metric's colour. Tap → bottom sheet with a 30-day chart, daily avg / best day / days-logged stats, and a stale-data warning when the Health sync Shortcut has stopped. Note: web apps cannot read HealthKit directly — data always arrives via the iOS sync Shortcut (broken since 2026-06-09 at build time; Joey to fix).
- **v7.2** Automatic evening push (no Shortcuts): Supabase Edge Function `send-daily-push` + pg_cron `gamenfy-daily-push` at 17:30 UTC (≈19:30 NL summer). Function reads `app_state` key `rpg`, skips the push when the day is already closed, personalises with streak + next venture step, prunes dead subscriptions. Devices register via a one-time "Turn on" card on Main (requires the PWA opened from the home screen, iOS 16.4+); subscriptions live in `app_state` key `push_subscriptions`. VAPID keys + cron secret live only in the deployed function, not in this public repo.
- **v7.1** Engagement layer: day streak (flame pill in the greeting, `rpg_streak_v1`, a day counts on any XP / mission / venture step / closed check-in; at-risk pulse after 17:00, never punitive mid-day) + Jarvis evening check-in (bottom sheet from 17:00: XP/missions/streak recap, up to 3 open actions completable inline, "Close the day" secures the streak; `rpg_checkin_v1`). Daily notification runs as an iOS Shortcut automation (out of app scope).

---

## 9. Roadmap / open items

**v9 build list — status (v9.0):**
1. [x] Time Sketcher (agenda × skills × quests × XP)
2. [x] Main missions in Daily-card style + gratitude box on Main
3. [x] Tier checklist inside skill detail (inline claims)
4. [x] Skill-panel Daylight redesign
5. [ ] Verify with Joey: maandlasten add-flow fixed in v8.8/v8.10 · new agenda/missions look approved on device

**Next builds (in order):**
1. [x] **Jarvis daily check-in + streak + automatic push** — shipped in v7.1/v7.2. Joey only taps "Turn on" once in the home-screen app.
2. [x] **Tier-lock system** — shipped in v7.4 (gates at 10/25/50/75, gate quest required, XP never lost).
3. [~] **Skill photos** — in progress (v7.5): 3/28 done (strength, coding, sales), pipeline + style template locked in the v7.5 changelog entry. Blocked on Higgsfield credits (0 left, free plan) — continue in batches.

**~~Next dedicated session — scientific skills audit~~ ✅ DONE in v9.3 — see `SKILLS-AUDIT.md` (0 open issues; 7 XP dips fixed, endurance ladder added). Original scope:** review all 28 skills against: (a) level pacing (levels 1-100 should map to realistic time-投入: ~1 level/week early, slowing later; tier gates at 10/25/50/75 must be provable real-world milestones), (b) quest ladders grounded in established progression science (strength: double-progression & 1RM standards; calisthenics: skill progressions; piano: graded repertoire (ABRSM-like); reading: volume+retention; meditation: duration+consistency findings; money: percentage-based benchmarks), (c) habit XP/decay rates consistent (currently +15/check, -1 level per 14 idle days for physical skills). Deliverable: one build doc updating quests.js + xp.js milestones with sources noted per ladder.

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


## AI-inzet per taak (credits-strategie, 2026-07-12)

**SIMPEL — goedkoop model (Haiku-klasse):** geïsoleerd, exact omschreven, kopieerbaar patroon.
- ~~Net-worth grafiek-code echt verwijderen~~ ✅ gedaan in v9.0 (HTML+JS+CSS weg; `logNetWorthSnapshot` datalogging bewust behouden voor een toekomstige chart)
- ~~Dode `.mission-row`/`.missions-card` CSS verwijderen~~ ✅ gedaan in v9.0
- Copy/tekst-aanpassingen (why-teksten, labels, knopteksten)
- CSS-tweaks op aanwijzing (kleuren, marges, groottes)
- SKILL_PHOTO_URL entries toevoegen zodra foto-URLs bestaan
- Extra quests/venture-stappen toevoegen aan bestaande ladders (patroon kopiëren)

**GEMIDDELD — middenklasse (Sonnet):** één pagina, bestaand patroon volgen, geen datamodel-wijziging.
- v9 taak 2: Main missions in Daily-kaartstijl + gratitude box op Main
- v9 taak 3: tier-checklist in het skill-detail
- v9 taak 4: skill-detail paneel naar Daylight
- Jarvis-functie ombouwen naar Gemini-endpoint (zodra key er is)
- Fitbit health-sync afronden (zodra Google-credentials er zijn)

**COMPLEX — beste model:** meerdere systemen raken elkaar, ontwerpbeslissingen, migraties.
- v9 taak 1: Time Sketcher (agenda × skills × quests × XP)
- Higgsfield fotobatch (stijlconsistentie + esthetisch oordeel)
- Fase 5: Gamenfy Public / multi-user fundament
- Alles dat localStorage-keys, sync of xp.js raakt

**Regels voor goedkope modellen:** altijd eerst dit document laten lezen · exact bestand + doel meegeven · NOOIT xp.js, sync.js of syncedKeys laten aanraken · na elke taak browsercheck vóór commit · bij twijfel: stoppen en escaleren naar een beter model.
