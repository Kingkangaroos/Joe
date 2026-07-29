# GAMENFY — Master Document (v10.16)

> Single source of truth for the Gamenfy dashboard. Read this first in any new session.
> Joey calls the assistant "Claudia". App UI is in English. Aesthetic: premium & light ("Daylight"), not dark/gamey.

---

## 0. KERN VAN WAARHEID — geverifieerd uit de code (v9.26 · 2026-07-19)

> Deze sectie is **afgeleid uit de repo-code van deze sessie**, niet uit eerdere samenvattingen.
> Bij tegenspraak wint §0. De secties eronder (1–8a) zijn beschrijvend en kunnen driften;
> de changelog (§8) is append-only geschiedenis. Herbouw §0 door de code opnieuw te lezen, niet door dit over te schrijven.
>
> **Bronmarkering per claim:** ✓ = geverifieerd uit repo-code deze sessie · ⚠ = alleen in changelog / server-side, **niet** verifieerbaar vanuit de repo · ✎ = vereist live Supabase om te bevestigen.

**App & stack**
- ✓ App heet **Gamenfy** (manifest.json). Vanilla HTML/CSS/JS, geen build-stap.
- ⚠ Deploy via Vercel op push naar `main` (mechanisme zelf niet uit code te lezen; consistent met alle sessies).
- ✓ **Cache-busting (v9.27)**: alle interne scripts worden geladen als `src="xp.js?v=9.27"` (28 tags over 8 pagina's). **RELEASE-RITUEEL: bump `?v=` op álle script-includes naar het nieuwe versienummer bij elke release** — anders serveren browsers/CDN oude JS en verschijnen nieuwe features niet op Joey's apparaten (dit was de oorzaak van "ik zie mijn nieuwe dingen niet"; data synct los want dat is Supabase, niet code).
- ✓ **Realtime cross-device sync staat AAN** (sinds v9.27): `app_state` is toegevoegd aan de `supabase_realtime`-publicatie (migratie `enable_realtime_app_state` toegepast + geverifieerd). sync.js' postgres_changes-subscriptie ontvangt nu live updates; iPad-invoer verschijnt direct op een open telefoon, zonder herstart. De v9.23-safety-net (heal bij 4+ ontbrekende keys) beschermt tegen partial-write-wipes.
- ✓ Supabase project **ttxjsoahmtennnufgeqx**, publishable key **sb_publishable_5lYXJme36ggS2dWTJbMSCA_Ir9Uogab**, tabel `public.app_state(key text, data jsonb, updated_at)`.
- ✓ De client roept **maar één** edge function direct aan: `functions/v1/jarvis`. Alle andere zijn server-side (cron/secret).

**Bestanden (regels · rol, ✓ uit code)**
- `index.html` (3038) — Main-tab. · `character.html` (3998) — Body + Skills + veel engine-consumers + Body-health-reader (`health_fitbit`). · `finance.html` (2596). · `health.html` (1055) — supplement-stack + water-iframe. · `po-water.html` (1136). · `settings.html` (767). · `jarvis.html` (202) — coach-tab. · `routes.html` (255) — ANWB side quest.
- Shared JS: `xp.js` (1130) — **engine + single source of truth voor level-formule + DEFAULT_SKILLS + RPG-sync-scope**. · `sync.js` (155) — cloud-sync helper. · `topbar.js` (365) — nav. · `checkin.js` (110). · `ventures.js` (133). · `quests.js` (490). · `push.js` (100). · `sw.js` (30) — service worker.
- ✓ `gym.html` (17) = **redirect-stub, gepensioneerd**. · ✓ `BUILD_DASHBOARD.md` = **legacy artefact** in de repo, hoort niet bij de app — negeren.

**Skills & habits (✓ uit DEFAULT_SKILLS in xp.js)**
- ✓ **46 skills** gedefinieerd in code (DEFAULT_SKILLS, incl. `good_deed`, v9.26). ✓ **Live `rpg_character_v1.skills` bevat 74 skills** (bevestigd via Supabase deze sessie) — dus **28 verouderde/orphaned skills** leven nog in de character-blob maar zijn uit de code verwijderd. De code is defensief (`DEFAULT_SKILLS[k]||{}`), dus dit breekt niks; opschonen van de blob vereist een aparte, voorzichtige migratie. "46" = wat de app kent; "74" = historische blob.
- ✓ **11 daily habits** (`isHabit:true`): `sleep, nutrition, walking, grounding, teeth, household, meditation, gratitude, good_deed, screen_time, cold_shower`.
- ✓ De **daily-missions-lijst** (active quests) is een aparte descriptor-set in `character.html`/`settings.html` en bevat óók niet-habit-skills (o.a. `reading`, `planning`, `no_porn`). "Daily mission" ≠ per se `isHabit`.

**Sync-architectuur — één canonieke scope per appKey (✓ uit code; dit is de v9.23/9.24-fix)**
- ✓ `rpg` → `window.RPG_SYNC_KEYS` (20 keys) + `RPG_SYNC_PREFIXES` (`rpg_daily_v1:`, `rpg_agenda_v1:`, `rpg_todo_v1:`). **Identiek** gebruikt door index.html, character.html, settings.html én xp.js.
- ✓ `health` → `['stack:items','stack:version','stack:low','po_water_v1']` + prefix `stack:taken:`. Gebruikt door **zowel health.html als po-water.html** (v9.24-fix, met uitleg-comment in po-water.html).
- ✓ `finance` → `['subs','wishlist','nw_currency','nw:activity','nw:history']` + prefix `nw:`.
- ✓ `po-coach` → `['po_coach_v1','po_coach_workout_done','po_coach_weights','po_coach_photos']` (in character.html).
- Regel: pagina's dragen **nooit** een eigen smallere lijst; scope-drift = de wipe-bug.

**Health-pipeline (gemengd)**
- ✓ Client leest de `health_fitbit`-rij als **één rij met per-datum keys** `{steps, activeMinutes, sleepMinutes, restingHR, weightKg}` (bevestigd uit character.html's reader). Body merget dit óver het dode `apple_health:*`-kanaal.
- ✓ v9.26: index.html's stappen-XP leest nu Fitbit-first (apple_health = fallback).
- ⚠ `jarvis` edge function "v6 incl. health + Fitbit-context": de repo heeft alleen een **1-regel header-stub** (`server/jarvis/index.ts`); volledige bron leeft server-side. Niet her-geverifieerd tegen de live functie.
- ⚠ `send-daily-push` (Gemini-ochtendbrief v7): **geen index.ts-mirror** in de repo (alleen README) — volledig server-side, niet te checken van hieruit.
- ✓/⚠ `fitbit-sync`: volledige `index.ts` staat wél in de repo (leesbaar); deploy/cron-status is server-side.
- ✎ Crons (`gamenfy-morning-push` 06:30, `gamenfy-daily-push` 17:30, `fitbit-sync-pull` 6:05/13:05/21:05 UTC): pg_cron, alleen via live Supabase te bevestigen.

**Correcties gevonden deze sessie (de drift die dit document opschoont)**
1. ✓ "Fitbit voedt Jarvis/brief nog niet" (v10-audit) → **onjuist**; gedaan sinds v9.19/v9.20. Gecorrigeerd in §v10.
2. ✓ "15 van 74 skills" → **bevestigd**: 74 = live character-blob, 46 = in code gedefinieerd. De 28 extra zijn legacy skills die nog in de blob zitten. Geen bug, wel opruimbaar.
3. ✓ index.html las stappen van het dode apple_health-kanaal → gefixt v9.26.
4. `CLAUDE-CONTEXT.md` (project-knowledge, niet in repo) + `BUILD_DASHBOARD.md` beschrijven een **oudere dark-theme generatie** ("King Joey's Dashboard", index appKey `goals`, `#0a0a0b`) — **niet** het huidige Daylight-Gamenfy. Stale — niet als bron gebruiken.

**Code-gezondheid — audit deze sessie (✓ = nagetrokken)**
- ✓ Alle `onclick`/`onchange`-handlers over de 8 pagina's zijn gedefinieerd — geen stille crash-knoppen.
- ✓ Datum-sleutels zijn consistent: index.html/xp.js `todayStr()` en character.html `ymdLocal()`/`todayKey()` gebruiken allemaal de **lokale kalenderdag** (v9.2-fix tegen UTC-na-middernacht). Geen cross-tab datum-mismatch.
- ✓ Quest-ladders zijn correct bedraad (`window.RPG_QUESTS` → skill-detailsheet). `tierLockInfo` lockt skills **zonder** ladder nooit (dus ladderloze habits lopen vrij door; een ladder aan een habit hangen = tier-gates toevoegen = gedragswijziging).
- ✓ **Levelformule-duplicatie in character.html is INTENTIONEEL, niet opruimen.** character.html laadt xp.js met `defer`, maar het inline-script (regel 1356) draait al tijdens het parsen — dus vóór de deferred xp.js. Daardoor bestaat `window.xpToLevel` nog niet als dat inline-script start, en heeft character.html zijn eigen lokale `xpToLevel`/`xpForLevel` nodig (byte-identiek aan xp.js gehouden). **Niet verwijderen** — dat zou de level-weergave kunnen breken. (Eerdere sessie-notitie noemde dit een cleanup-item; dat was fout, hierbij gecorrigeerd.) De andere "gedupliceerde" helpers per pagina zijn om dezelfde reden bewust lokaal.

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


## v10-plan — data-gedreven (vastgelegd 2026-07-18) — ⚠️ VERVANGEN door de v10-roadmap in §9 (2026-07-21); hieronder alleen als historie

Onderbouwing uit Joey's echte data: XP-events per week: wk23:22 → wk24:10 → wk25-26:0 → wk29:7 (herstel valt exact samen met de start van de Jarvis-ochtendbrief → de coach-loop is de bewezen hefboom). Slechts 15 van 74 skills ooit aangeraakt; het actieve cluster is body + discipline + mindfulness. Fitbit levert dagelijks slaap/RHR/stappen/AZM. *(Correctie v9.26: de audit stelde dat Fitbit Jarvis en de brief nog niet voedde — dat klopte niet; v9.19 wire'de health_fitbit in Jarvis get_state en v9.20 in de ochtendbrief-prompt. Alleen index.html las stappen nog van het dode apple_health-kanaal; dat is in v9.26 gefixt.)*

**A. Coach-loop versterken (hoogste prioriteit)**
1. ✅ **AF (al in v9.19/v9.20, niet v10)** — Fitbit → Jarvis + ochtendbrief: health_fitbit zit in get_state én de brief-prompt.
2. ✅ **AF (v9.26)** — index.html stappen-widget: Fitbit-first, apple_health als fallback. Stappen-XP loopt weer.
3. Adaptieve brief: na 2+ dagen zonder XP schakelt de brief naar één micro-doel i.p.v. een vol programma (anti-cliff, zie wk25-26).

**B. Focus boven breedte (15/74-inzicht)**
4. Season-concept: 3 focus-skills per maand, bovenaan de grid, rest gedimd; hergebruik rpg_focus_skills_v1.
5. Boss quest per season (uitgesteld sinds het v3.0-besluit "boss quests later"): één grote maanddoelquest.

**C. Oude parkeerlijst, nu relevant**
6. Check-in verrijking / word cloud (v3.0-parkeerlijst, klein).
7. Drag-to-move agenda (backlog 2026-07-12).
8. Week-strip → volledige weekweergave.

**D. Onderhoud**
9. Supabase Auth (vervangt het geaccepteerde anon-write-risico).
10. Apple Health-shortcut officieel pensioneren: Fitbit vervangt steps/energy; dode leespaden opruimen. (Herroept het juni-besluit "parkeren tot Apple Watch" — de Fitbit Air lost dit op.)

## 8. Version history

- **v10.16 — Fitbit hersteld + Grounding verwijderd + grote quest/daily-audit gestart.** **Fitbit:** Joey her-koppelde Google Health (token was verlopen sinds 23/7 → verklaart de doodse Body-tab). `fitbit-intraday`-probe draait nu: beschikbaar = HRV, SpO2, respiratory-rate, distance, active-minutes, ruwe steps (`p.steps.interval.civilStartTime` + `.count`) + 2000 HR-punten; NIET beschikbaar = skin-temperature (400). Volgende Fitbit-stap: v2 (juiste parsing + vitals + uur-cron + Jarvis readiness). **Grounding:** gedeactiveerd (`active:false`) + milestone verwijderd. `?v=` naar 10.16.

### 🗺️ Grote quest/unlock/daily-audit (2026-07-29) — model ter bevestiging
Joey's punten: (1) quests weer koppelen aan unlock paths (tier-gate-milestones per tier); (2) claimen direct vanuit de unlock path; (3) kritisch ALLE skills: logische progressie, moeilijkheid ↔ level, duidelijke tiers; (4) claim-systeem; (5) haalbaarheid; (6) veel meer uitleg per quest = een **informatieboom** (wat betekent 't / waarom / wat doe ik concreet / voorbeelden / hoe naar next). Voorbeelden van fouten: Puzzle lvl-10-quest (300 stukjes) geclaimd maar level 3, terwijl unlock path ~lvl5/100 stukjes zegt (inconsistent); Whistling kan al on-command maar level 7, lvl-15-milestone onlogisch; Coloring “Level 8 - Shade Curious” = onduidelijk. **Daily missions = Duolingo-model:** check = credit voor die dag (+1/level), gemiste dag = decay terug, uncheck = level omlaag; nu bleef 'ie na check→uncheck op level 2 (klopt niet). Grounding valt buiten de audit.

**Claudia's voorgestelde model (Joey bevestigt vóór de grote build):**
- **Één getierde ladder per skill** = quests + unlock-path samengevoegd. Elke tier: {level, titel, wat, waarom, hoe (concrete stappen), voorbeelden, XP} → **claimbaar vanaf de unlock path** als je 'm haalt; tier-gates houden de volgorde.
- **Informatieboom:** tik een tier → dieper (betekenis → waarom → hoe → voorbeelden → next). Wetenschappelijk onderbouwd.
- **Daily missions:** level = streak-krediet, puur afgeleid uit de dag-log (check/uncheck/miss altijd correct); vervangt de score+reconcile+decay-knoop die de bug gaf.
- **Kernvraag aan Joey:** duwt het claimen van een tier je **level omhoog** (tier ÍS het level, RuneScape-stijl), of blijft level XP-gedreven en zijn tiers losse checkpoints? (Dit lost de Puzzle-tegenstrijdigheid op.)
- **Fasering:** (1) daily-mission Duolingo-fix; (2) unified ladder-datamodel + skill-detail-UI (gekoppeld, claimbaar, uitklapbaar) met 3-4 skills als template; (3) alle ~45 skills kritisch herzien + diepe uitleg; (4) Fitbit v2 + Jarvis-readiness (parallel).
- **v10.15 — Per-skill reset-knop + core gereset.** Elke skill-detail heeft nu onderaan een **"Reset this skill"**-knop (met bevestiging) die XP→0, geclaimde quests (`skill:level`) en bevestigde milestones (`skill_x`) van díe skill wist — Joey hoeft resets niet meer aan Claudia te vragen. Core is via de cloud teruggezet naar level 1 (Joey had 'm op level 11 gezet als test voor de gespierde body-visualisatie). `?v=` naar 10.15. Gevalideerd. **Volgende:** aparte `fitbit-intraday`-functie (breed: uur steps+HR + HRV/SpO2/breathing/skin-temp/distance → Jarvis readiness), Body-tab Google-Health-style grafieken, #2 wishlist, #3 agenda.

- **v10.14 — Prioriteit #1: gratitude-woorden-bug gefixt.** `renderGratitude` toonde alleen woorden met `lastDate === vandaag`; een stale sync-pull van het aggregaat `rpg_gratitude_v1` (cloud t/m 15 juli) overschreef Joey's lokale toevoegingen van vandaag → `lastDate` sprong terug → woorden verdwenen. Fix: woorden van vandaag worden nu als lijst opgeslagen in `rpg_daily_v1:DATE.gratitudeWords` en de weergave rendert daaruit (met fallback naar het oude aggregaat). De dag-key heeft nog geen oude cloud-versie voor vandaag, dus overleeft de pull. Aggregaat blijft voor weekstats. `?v=` naar 10.14. Gevalideerd. **Volgende:** #2 wishlist, #3 agenda.

- **v10.13 — Echte foto's batch 3 (+5 skills → 16 totaal).** Toegevoegd: **dating** (17746292 diner-date), **planning** (33136468 weekplanner-bureau), **puzzling** (30708396 puzzelstukjes), **household** (3177257 schoonmaakspullen), **cold_shower** (688559 blauwe waterval, CC0). Samen met de 14 bestaande tegels hebben nu 30 van de 46 skills een echt beeld. Miss deze ronde: content/marketing (alleen betaalde sites). Resterend op gradient: abstracte/gevoelige skills (meditation, gratitude, core, grounding, recovery, stretching, good_deed, whistling) + retry-baar (marketing, ai_tools, content, languages, teeth). `?v=` naar 10.13. Gevalideerd.

- **v10.12 — Echte foto's batch 2 (+7 skills → 11 totaal).** Via de Pexels-route toegevoegd: **learning** (6550408 boeken op bureau), **focus** (37831090 student in zonlicht), **journaling** (5797899 open notitieboek+mok), **social** (9287491 lachende vrienden), **superiority** (30769221 bergtop bij zonsopgang), **coloring** (532231 kleurpotloden flatlay), **dancing** (6453620 dansende vrouw studio). Truc bevestigd: brede concrete onderwerp-zoekopdrachten leveren meerdere losse Pexels-foto's tegelijk; abstracte termen (meditation, plank) geven vooral betaalde sites die NIET gebruikt worden. Gevoelige skills (no_porn/weed_control/screen_time) houden bewust hun neutrale gradient-tegel. Resterende ~21 skills: deels nog te doen, deels blijven ze een nette gradient (gemengd resultaat is prima). `?v=` naar 10.12. Gevalideerd.

- **v10.11 — Echte foto's via de gratis Pexels-route (eerste batch: 4 skills).** Higgsfield is definitief van tafel (Joey's keuze). Werkende gratis route gevonden: web-search naar concrete onderwerpen ("… pexels free stock photo") geeft losse Pexels-fotopagina's met ID; de gratis-te-hotlinken CDN-URL is `images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg` (Pexels License: vrij te gebruiken, geen naamsvermelding). Eerste batch gewired in `SKILL_PHOTO_URL` (overschrijft de gradient-tegels): **calisthenics** (10506371), **nutrition** (8230033), **sleep** (9615241), **walking** (1242471). Leerpunt: concrete onderwerpen werken (nutrition/sleep/walking gaven direct losse foto's); abstracte termen (meditation) geven vooral betaalde sites (Getty/iStock/Dreamstime) die NIET gebruikt worden. Rest volgt in batches. `?v=` naar 10.11. Gevalideerd.

- **v10.10 — Zelf-gegenereerde skill-tegels voor de 32 skills zonder afbeelding (geen credits nodig).** Higgsfield staat op 0 credits (free plan) en is het enige AI-beeldmodel dat Claude kan aanroepen — dus geen fotorealisme mogelijk. In plaats van weer "nee": met Python/PIL **32 cohesieve Daylight-tegels** gegenereerd (zacht diagonaal kleurverloop in de domeinkleur + subtiel geblurd motief + lichte vignette, per skill licht gevarieerd via een hash-seed), opgeslagen als `img/skills/<key>.jpg`. `skillPhotoUrl` wees daar al naar als fallback, dus ze worden **automatisch opgepikt zonder codewijziging** — waar de detail-banner eerst leeg was, staat nu een tegel; in de grid een cohesieve gekleurde tegel. Kwaliteit visueel gecontroleerd (3 samples) vóór commit. Geen foto's, maar echte zelf-gemaakte beelden die niks kosten en niet kunnen breken (opaque JPG's, geen externe afhankelijkheid). Zodra er ooit Higgsfield-credits zijn, kunnen echte foto's dit via `SKILL_PHOTO_URL` overschrijven.

- **v10.9 — Fix: naam-botsing `renderWeekStrip` (mijn missions-strip vs de bestaande agenda-strip).** De health-check-reflex ving het: er bestond al een `renderWeekStrip()` voor de agenda (`#agendaWeekStrip`). Mijn v10.7/v10.8 missions-week-strip gebruikte dezelfde naam → door JS-hoisting won de latere (agenda-)definitie, dus mijn strip werd nooit gevuld (leeg op Main). Mijn functie hernoemd naar `renderMissionsWeek()` + de aanroep in `renderMissions` bijgewerkt; de agenda-strip blijft ongemoeid. Nu werken beide. Les: bij nieuwe top-level functienamen eerst grep'en op bestaande definities. `?v=` naar 10.9. Gevalideerd (1 def per naam).

- **v10.8 — Week-strip toont nu voltooiings-fractie (pie-vulling) i.p.v. binaire stip.** Elke dag-stip in de week-strip vult nu naar rato van hoeveel van je actieve daily missions je die dag deed (conic-gradient pie in ember; `dayCompletion` = afgevinkte habit-missions / totaal actieve habits, uit `rpg_habitlog_v1`). Dagen met alleen niet-habit-activiteit (bijv. workout-challenge) tonen een lichte ember-stip via `dayHasActivity`-fallback. Zo zie je in één oogopslag niet alleen óf maar hóe compleet elke dag was — echte consistentie-tracking. Read-only, additief. `?v=` naar 10.8. Gevalideerd (één definitie per functie).

- **v10.7 — Week-strip op Main (7-daagse tracking) — lost Joey's "ik kan het nooit goed tracken" op.** Boven de missions-lijst nu een compacte strip van de laatste 7 dagen: per dag een letter + stip die oplicht (ember) als je die dag activiteit had (uit `rpg_streak_v1.days` of `rpg_habitlog_v1`). De huidige bekeken dag is gemarkeerd; **tik een dag → springt erheen** (benut de multi-day nav van v10.4, zodat je direct kunt bijvullen). Read-only + additief (kan niks breken), rendert mee in `renderMissions`. `?v=` naar 10.7. Gevalideerd.

- **v10.6 — Gezondheids-/regressiecheck van de hele v9.26→v10.5-reeks (schoon) + workout-challenge-streak.** Na ~15 snelle releases die op elkaar inhaken een volledige audit gedaan: alle gedeelde JS + 8 pagina's parsen schoon, alle onclick/onchange-handlers gedefinieerd, geen dubbele functiedefinities, workout-skills (calisthenics/core) bestaan, multi-day datum-offset-logica klopt (0→vandaag … −13→2 weken), challenge-rotatie sluitend, ventures-migratie + `sell_websites` aanwezig, vercel.json valide. **Geen regressies.** Toegevoegd: een **streak-badge (🔥 Xd)** op de workout-challenge-kaart (telt opeenvolgende voltooide dagen uit `rpg_daily_v1:*`, met grace voor vandaag). `?v=` naar 10.6. Gevalideerd. **Nog open (jouw beslissing):** budgeting-skill-reset ("reset skills"), plaatsing Path to Superiority.

- **v10.5 — Dagelijkse workout-challenge + venture "Websites Verkopen".** (1) **Workout-challenge** op Main: een roterende bodyweight-challenge (Push/Pull/Core — geen squats/deadlifts, past bij Joey's profiel): push-ups, plank, pull-ups, hollow rock, pike push-ups, dips, hanging leg raises, hollow hold. Deterministisch per dag (day-of-year rotatie), afvinken geeft XP naar calisthenics/core, staat per dag in `rpg_daily_v1:DATE.workout_challenge` (gesynct via de bestaande prefix). Zelfstandige card met inline-styling. (2) **Nieuwe venture "Websites Verkopen"** in ventures.js: websites bouwen & verkopen aan lokale bedrijven (4 fasen: set up shop → first client → deliver & systemize → scale/stop, met een "First euro" boss-step), XP naar coding/ai_tools/sales/marketing. Plus een **migratie in `load()`** die nieuwe SEED-ventures additief bij bestaande gebruikers bijzet (Joey heeft al `rpg_ventures_v1`, dus seed-only zou 'm niet toevoegen). De "Life of making money"-projectchats waren onbereikbaar (chat-zoek is project-scoped), dus de venture is uit algemene kennis opgebouwd en bijschaafbaar. `?v=` naar 10.5. Gevalideerd. **Nog open:** budgeting-skill-reset (wacht op Joey's expliciete "reset skills"), plaatsing Path to Superiority.

- **v10.4 — Multi-day back-fill voor daily missions + aparte Quests-subview verborgen.** (1) De Main-dag-navigatie was binair (today/yesterday); nu een **dag-offset tot 14 dagen terug** (`missionsDayOffset`, helpers `viewedDateStr`/`viewedDateLabel`). De ‹ / › pijltjes schuiven per dag; op elke bekeken dag kun je missions **check/uncheck** (backfill via `checkHabitFor`, XP ±15, streak-mark). Alle 11 `missionsDay`-verwijzingen omgezet naar de offset (renderMissions, toggleMission, togglePrivateQuest, mission-detail). Zo kan Joey ook vorige week nog invullen → beter te tracken vanaf het begin. (2) De **📜 Quests-subview** in de Skills-toolbar is verborgen (`display:none`) — quests staan nu per skill in de skill-detail (v9.31/v10.3), dus de aparte view was overbodig/onoverzichtelijk. `?v=` naar 10.4. Gevalideerd. **Nog te doen (deze sessie aangevraagd):** budgeting-level-audit (level 20 uit assessment, 0 quests geclaimd — resetvoorstel ligt bij Joey), workout-challenge-per-dag, venture "websites verkopen", plaatsing Path to Superiority.

- **v10.3 — DE ROOT-CAUSE waarom fixes Joey niet bereikten: HTML werd gecachet. + daily-mission-audit + quests-in-skill.** **Kernprobleem gevonden:** cache-busting (`?v=`) zat alleen op de externe scripts, niet op de HTML-documenten zelf. Als `index.html`/`character.html` door de browser/CDN gecachet zijn, laadt Joey oude inline-code én oude `?v=`-verwijzingen → **geen enkele fix bereikt hem** (verklaart "ik vraag het al vaker maar er gebeurt niets", de habit-checks die niet optelden, de quests-in-skill die hij niet zag). Bevestigd in live data: gratitude-checks van 24/25 juli stonden nergens terwijl de rij vandaag wél geschreven was → zijn toestel draaide oude code. **Fix:** `vercel.json` met `Cache-Control: no-cache, must-revalidate` op alle HTML → HTML wordt voortaan altijd vers opgehaald (en verwijst dan naar de actuele `?v=`-scripts). **Eenmalig** moet Joey nog één harde refresh / PWA opnieuw toevoegen om de nieuwe headers op te pikken; daarna stromen alle updates vanzelf. **Daily-mission-audit:** het model klopt al in code — check = +1 (max 10), gemiste dag = −1, cap 10, nooit nul bij checken; v10.1 voegde heal-from-log toe. Het "2 dagen gedaan maar Lv 0"-gevoel kwam puur doordat de checks niet persisteerden (oude code + clobber), niet door verkeerde telling. **Quests-in-skill:** v9.31 zette de volledige quest-ladder al ín de skill-detail (sectie hernoemd "Quest path" → "Quests"); tik een skill → je ziet en claimt z'n quests. De aparte "📜 Quests"-subview in de Skills-tab blijft als optionele bladeraar. `?v=` naar 10.3. Gevalideerd.

- **v10.2 — Routes-kaart was ONZICHTBAAR (stond in de verborgen legacy-tab) — verplaatst naar de echte Body-tab.** Joey zag de ANWB-routes-randomizer nergens. Oorzaak: de kaart (v9.25) stond in `#tab-character` — de legacy sub-screen met `display:none` ("kept for compatibility"), niet in het zichtbare `#tab-body`. Daardoor was 'ie sinds v9.25 nooit te zien, ongeacht cache. Nu verplaatst naar de zichtbare Body-tab onder een nieuwe "Walking"-kop, na Body Skills. `#rtBadge` (X/100) werkt mee (zelfde id, JS ongewijzigd). `?v=` naar 10.2. Gevalideerd (kaart zit nu aantoonbaar in tab-body, vóór tab-character opent).

- **v10.1 — Daily-mission-audit: sync-clobber die habit-checks opat, GEREPAREERD.** Joey meldde dat gratitude na een dag weer op Lv 0 stond en gisteren unchecked leek. **Audit (live data):** de per-dag-log (`rpg_habitlog_v1`) had gratitude-checks op 12+15 juli, maar de habit zelf stond op `lastChecked: 6 juni, score 0` — de twee bronnen waren uit elkaar gelopen, en recente checks stonden in geen van beide. **Root-cause in sync.js:** `localStorage.setItem` is gepatcht om bij elke matched write te pushen (250ms debounce), óók tijdens het laden — vóór de cloud-pull binnen is. xp.js schrijft bij het openen (decay/seeding) → dat pusht de VEROUDERDE lokale staat en overschrijft de verse cloud vóór de pull klaar is (`lastSyncedJson` is dan nog null → push gaat gegarandeerd door). **Fix:** een `ready`-flag — `pushNow`/`flushOnUnload` pushen niets vóór de initiële pull is voltooid (in alle init-takken op `true` gezet; bij pull-fout wel latere user-pushes, maar de verouderde on-load-writes worden gedropt). Raakt de delete-guard niet, dus geen regressie. **Plus** een heal-forward reconcile in xp.js: `getHabits` herstelt `lastChecked`/`streak`/`score` uit de authoritatieve dag-log (verlaagt nooit), zodat bestaande divergentie zichzelf heelt. **Routes-randomizer:** die bestond al (Body-tab, kaart "🥾 ANWB Routes" tussen Weight en Skills → routes.html met 🎲 "Roll my next route"); hint aangepast naar "🎲 Roll a random route to walk →" zodat 'ie herkenbaar is. Workout-challenge-per-dag: geen eerdere spec gevonden — apart uitgevraagd. `?v=` naar 10.1. Alles gevalideerd (sync.js + xp.js + 8 pagina's parsen schoon).

- **v10.0 — Nieuwe fase: v9-lijn geconsolideerd, v10-roadmap vastgesteld.** Milestone-bump. De hele v9.26 → v9.34-reeks is afgerond (quest-claim/tier-gate-fix, realtime sync, cache-busting, why's/milestones/benefits, iconen, Fitbit-coach, stappen- & gewichtsfix, Apple Health geretireerd). §9 bevat nu een schone **v10-roadmap** met 6 tracks (Fitbit-intelligentie, seasons & progressie, agenda, visuele polish, data/infra, productvisie), elke taak getagd 🟢 zelfstandig / 🟡 feedback / 🔵 Supabase-tap / 💳 credits, plus een expliciete lijst beslissingen die Joey's input vereisen. De oude data-gedreven v10-plan-sectie is als vervangen gemarkeerd (blijft als historie). `?v=` naar 10.0 (release-ritueel).

- **v9.34 — Body composition-gewicht uit Fitbit (Apple Health-restant geretireerd).** `renderBodyComposition` op de Body-tab las gewicht/vet/spier alleen uit het dode `apple_health`-kanaal (localStorage, stil sinds 2026-06-09) → toonde "—" terwijl Fitbit het gewicht (`weightKg`) wél heeft. Nu async: leest de meest recente `weightKg` uit de cloud-`health_fitbit`-rij (apple_health blijft legacy-fallback). Vet/spier blijven eerlijk "—" (Fitbit Air heeft geen vetsensor). Zelfde klasse fix als de stappen-widget (v9.26). Hiermee is het roadmap-item "Apple Health-sync-pad retireren" praktisch rond: de enige andere apple_health-fetch (Body-health-merge) geeft Fitbit al voorrang. `?v=` naar 9.34. Gevalideerd.

- **v9.33 — Fitbit Coach: data-gedreven advies op Main (front-end, stap 1 van Joey's hourly-wens).** Nieuwe coach-kaart op Main die vandaags `health_fitbit` leest en één contextuele Engelse tip geeft, tijd-afhankelijk: 's ochtends **recovery** (uit slaap + RHR: <6u → hou training licht; ≥7u → goed hersteld, mooie dag voor zwaar), 's middags **stappen-inhaal** (<3k → 25-min wandeling richting 8k; on-track melding), 's avonds **ring sluiten** (nog X tot 8k). Hergebruikt de bestaande Fitbit-fetch in `loadStepsXP` (geen dubbele call), inline-styling (geen nieuwe CSS), verbergt zichzelf zonder data — kan niks breken. Dit levert Joey's "advies o.b.v. data" nu al op de dagelijkse aggregaten. **Hourly-laag = nog te doen, vereist Joey's Supabase-taps** (zie roadmap). `?v=` naar 9.33. Gevalideerd.

- **v9.32 — Topical skill-iconen i.p.v. generieke sterretjes (gratis visuele polish).** Fotoscontext: Higgsfield-workspace zit op 0 credits (free plan) en Joey wilde geen betaalde/trial-route — en een gratis platte gradient-tegel zou de al-cohesieve icoon-laag (domein-radialgradient + custom line-icoon) juist *downgraden*, dus die is bewust niet gebouwd. Wél gedaan: 7 skills die terugvielen op een generiek line-art-sterretje kregen een passend **bestaand** line-icoon (nutrition→chef, walking→run, grounding→lotus, gratitude→heart, good_deed→handshake, coloring→pen, drawing→pen) — geen nieuwe SVG-paden verzonnen, alleen bewezen iconen hergebruikt (nul risico). De 5 zonder goede match (sleep, teeth, household, screen_time, cold_shower) blijven een sterretje: een verkeerd icoon is slechter dan een neutraal. Echte foto-tegels blijven de enige upgrade die credits vereist. `?v=` naar 9.32. Gevalideerd.

- **v9.31 — Quest-claim + tier-gates gerepareerd (Joey's calisthenics-fout) + volledige ladder per skill.** **De bug:** claimen was gated op `level >= q.lvl` — je kon een quest pas claimen als je level al hoog genoeg was, terwijl de quest-XP juist is wat je naar dat level brengt. Gevolg: een beginner kon zelfs de eerste calisthenics-quest ("Newbie Base", lvl 3) niet claimen. **De fix (jouw ontwerp):** nieuwe canonieke `window.questClaimable(skill,lvl)` in xp.js — *quests zijn achievements: done = claimbaar, alleen geblokkeerd door een niet-geclaimde tier-gate-quest op een lager level* (nooit door je huidige XP-level). Toegepast in béide render-plekken (de Quests-view `renderQuestLadder` én de skill-detail-checklist). Locked-rijen tonen nu "🔒 Clear the LV X gate first" i.p.v. het misleidende "Reach level X". **Skill-detail toont nu de vólledige ladder** (alle quests van de skill met done/claim/gate-status + "X/Y claimed") i.p.v. alleen tot de eerstvolgende gate — zodat je per skill al z'n quests ziet als je erop klikt. **Audit over alle 33 ladders:** allemaal gezond (gesorteerd, unieke levels, 1-100, oplopende XP, gates dekbaar); habits hebben terecht geen ladder/gates. Logica unit-getest op calisthenics-scenario's (gates 8→22→40→64 in volgorde clearbaar). `?v=` naar 9.31. Gevalideerd.

- **v9.30 — Elke daily mission opent nu compleet (why + benefits) — Joey's quest-visie afgemaakt.** Uit twee recente chats (12 + 19 juli): Joey wil dat elke today's mission z'n eigen scherm heeft met streak-stats (dagen volgehouden / slip-ups), een "why this matters", en een benefits-opsomming — een motivatieboost per tik. **Bevinding: die mission-detail (`openMissionDetail`, index.html) was al volledig gebouwd** (🔥 streak / ✓ total / missed + "Why this matters" + "What consistency earns you" met YOURS-markering). Hij zag het niet door (a) stale cache (v9.27-fix) en (b) lege why-tekst (v9.28-fix). Deze release vult het laatste gat: `reading`, `gym` (workout) en `sales` (outreach) misten nog een benefits-tijdlijn, waardoor die missions leeg openden bij "What consistency earns you" — nu day-based aangevuld (additief, display-only, guarded). Quests-pagina-visie (12 juli) is al gerealiseerd door de Daylight-redesign: quests zitten ín de skills met "▶ Your next step · unlocks Lvl X" + tier-checklist, leesbaar, met domein-chips op de Skills-view (de losse verwarrende Quests-tab was juist verwijderd). `?v=` naar 9.30. Gevalideerd.

- **v9.29 — Level-milestones voor alle 46 skills + audit-correctie.** 20 skills (14 habits + marketing/social/dating/planning/learning/content) hadden nog geen `milestones` in hun detail-sheet. Toegevoegd via één additief guarded blok in xp.js (`MILESTONE_FILL` — zet alleen milestones wáár die ontbreken, nooit overschrijven). Milestones zijn **display-only** beschrijvende level-doelen (geen quests/tier-locks), on-brand geschreven (realistisch, motiverend). Nu heeft élke skill zowel `why` als `milestones`. **Belangrijke audit-correctie:** de levelformule-duplicatie in character.html is NIET cosmetisch/opruimbaar zoals een eerdere notitie zei — character.html laadt xp.js met `defer` terwijl het inline-script al tijdens parsen draait (vóór xp.js), dus de lokale `xpToLevel`/`xpForLevel` zijn *nodig*. §0 gecorrigeerd; niet verwijderen. `?v=` naar 9.29. Statisch gevalideerd (20/20 keys, geen overwrites, alle pagina's schoon).

- **v9.28 — Skill-detailsheets verrijkt: motiverende `why` voor alle 46 skills.** 31 skills hadden nog geen `why`-tekst in hun detail-sheet (vooral de niet-habit skills: money, body, work, creatief, sociaal). Toegevoegd via één schoon, additief blok in xp.js (`SKILL_WHY`-map + guarded loop die alleen `why` zet wáár die ontbreekt — nooit overschrijft, nooit gedrag raakt: levels/quests/tier-locks blijven identiek). Teksten zijn hedged en on-brand (motiverende betekenis + wetenschappelijk waar dat kan, "linked to"/"in studies" i.p.v. harde claims). Nu heeft élke skill een why. Bewust géén `benefits`-timelines aan niet-habit skills gehangen: die fysiologische dag-1/7/30-boog past bij dagelijkse gewoonten, niet bij practice-skills — dat zou geforceerd/onjuist zijn. `?v=` gebumpt naar 9.28 per het release-ritueel. Statisch gevalideerd (syntax + 31/31 keys exact match, geen typo's, geen overwrites).

- **v9.27 — Cache-busting zodat nieuwe features Joey's apparaten écht bereiken + sync-diagnose.** Kernprobleem gevonden: gedeelde JS werd geladen zonder cache-busting (`<script src="xp.js">`), dus browsers/CDN serveerden oude code — Joey's data kwam wél terug (Supabase, los van codeversie) maar nieuwe features (Good Deed etc.) bleven weg. Fix: `?v=9.27` toegevoegd aan alle 28 interne script-tags over 8 pagina's (externe CDN ongemoeid). Release-ritueel vastgelegd in §0: bump `?v=` bij elke release. **Sync-diagnose (live Supabase):** (a) maandlasten/agenda stonden correct in de cloud — het probleem was puur dat de telefoon niet pullde; (b) **root-cause = realtime stond uit** (`supabase_realtime` leeg, `app_state` niet in de publicatie), dus geen live cross-device updates; **fix toegepast in deze sessie** (migratie `enable_realtime_app_state`, geverifieerd) — live sync staat nu AAN, geen herstart meer nodig; (c) bevestigd dat de live character 74 skills heeft vs 46 in code (28 legacy). **Bewust NIET gedaan:** een merge-op-push in sync.js — zonder per-veld tijdstempels/realtime zou dat legitieme verwijderingen terugtoveren (mooi-maar-kapot). De realtime-migratie is de juiste fix. Good Deed + stappen-fix (v9.26) verschijnen nu vanzelf zodra Joey's apparaat de geversioneerde JS laadt.

- **v9.26 — Good Deed daily mission + stappen-widget gerepareerd + waarheidsronde.** (1) Nieuwe daily habit **Good Deed 🤲** (parentSkill mind, naast Gratitude): één bewuste goede daad per dag, +1 punt / −1 per gemiste dag, science-based why + benefits-timeline (helper's high dag 1 → Lyubomirsky kindness-trials dag 7 → sterkere sociale band + lagere stressreactie dag 30). Toegevoegd in DEFAULT_SKILLS (xp.js), mission-descriptors in character.html + settings.html, in DEFAULT_ACTIVE_QUESTS, met one-time migratie (`good_deed` idem household) zodat hij bij Joey's bestaande selectie verschijnt. Detail-sheet, streak-stats, decay en confetti werken automatisch mee (habit-agnostisch, identiek aan Household sinds v9.6). (2) **Stappen-XP gerepareerd**: index.html's `loadStepsXP` (was `loadAppleHealth`) leest nu **Fitbit-first** uit de `health_fitbit`-rij (today.steps), met apple_health als fallback — het apple-kanaal lag dood sinds 2026-06-09, dus stappen-endurance-XP stond 5+ weken stil. Formule (10k steps→50 XP, XP-guard per dag) ongewijzigd. (3) **Waarheidsronde**: de v10-audit beweerde dat Fitbit Jarvis/brief nog niet voedde — onjuist, dat was al v9.19/v9.20; v10-item 1 gecorrigeerd naar AF, item 2 nu AF. (4) **Nieuwe §0 "Kern van Waarheid"** bovenaan het masterdoc: volledig uit de repo-code van deze sessie afgeleid (niet uit oude samenvattingen), met bronmarkering per claim (✓ geverifieerd / ⚠ server-side / ✎ live-Supabase-nodig) en een correctielijst — bedoeld om de changelog-drift die dit soort misinformatie veroorzaakt te stoppen. Bij tegenspraak wint §0. Syntax + aanwezigheid van alle edits gevalideerd.

- **v9.25 — ANWB Routes side quest 🥾** (gebouwd parallel aan v9.23-24 van de zustersessie; netjes gerebased op haar sync-refactor — rpg_routes_v1 zit in de nieuwe canonieke RPG_SYNC_KEYS, één plek i.p.v. drie). Nieuwe `routes.html`: alle 100 routes uit Joey's ANWB-gids getranscribeerd (nr/naam/provincie/km, per provincie met tellers), voortgangs-hero (X/100 + km + balk), **🎲 randomizer** die alleen uit ongelopen routes rolt met re-roll en persistente "next up"-markering, tik-om-af-te-vinken met datum. XP → **Endurance: 20 + 3×km**, mijlpalen 10/25/50/75 (+100/250/500/750), **+2000 bij boek uit**; ont-vinken neemt XP terug. Toegang via Body-tab-kaart met live X/100-badge. Logica unit-getest (roll-bereik, XP, milestone, 50-rolls-exclusie, uncheck). Km's komen van een boekfoto — afwijking = één regel in ROUTES.

- **v9.24 — Tweede sync-scope-wipe gedicht + data-cleanup (audit deel 2).** po-water.html synchroniseerde appKey 'health' met alléén `po_water_v1` terwijl health.html de volle scope had — zelfde bug-klasse als v9.23: elke water-log overschreef de hele health-cloudrij, waardoor waterhistorie en `stack:taken:*` uit de cloud verdwenen (supplementen-items overleefden als laatste writer). Fix: po-water gebruikt nu exact dezelfde keylijst+prefixes als health.html; de v9.23 delete-guard beschermt lokale data al. Device-data heelt de cloud automatisch bij het eerstvolgende bezoek (hasLocalOnly-push). Verder: 4 junk-rijen van het kapotte Apple Health-shortcut verwijderd (`apple_health:test` ×2, lege datums ×2). Gewichtslogs bleken veilig (po_coach_weights onder de single-instance po-coach scope). Les vastgelegd: **elke appKey heeft precies één canonieke sync-scope; pagina's mogen nooit een eigen smallere lijst voeren.**

- **v9.23 — KRITIEKE SYNC-WIPE GEVONDEN EN GEDICHT (audit-sessie).** Diagnose: xp.js had sinds v3.2 een fallback `initCloudSync({appKey:'rpg', syncedKeys:[character,habits]})`. Op pagina's zonder eigen rpg-config (health.html, po-water.html — beide laden xp.js) was dat de ENIGE rpg-instantie; xp.js schrijft bij elke load decay/habit-state → die smalle instantie pushte de **hele cloud-rij als 2-keys blob**, en de realtime-echo met allowDelete verwijderde de overige ~17 keys (streak, daily, quests_done, ventures, gratitude, agenda, checkin, prefs, habitlog, ledger) lokaal op elk open device. Op index/character draaiden bovendien TWEE instanties (smal + breed) die elkaar raceten. Bewijs: cloud-rij bevatte exact de 2 fallback-keys. Fix in drie lagen: (1) `window.RPG_SYNC_KEYS`/`RPG_SYNC_PREFIXES` in xp.js als single source of truth voor de sync-scope (incl. eerder gemiste `rpg_last_reminder` en `rpg_todo_v1:`-prefix — de drie pagina-configs verwijzen er nu naar, drift onmogelijk); (2) registry in sync.js: één live instantie per appKey (first wins), lege-scope inits zijn no-ops die het slot niet claimen; (3) delete-guard: een realtime-blob die 4+ lokale keys mist is per definitie een strip, niet een echte delete → niet wissen maar heal-push (single-key deletes blijven werken). 8 unit-tests met gemockte Supabase: registry, no-op, heal-push met volledige staat, strip-echo wist niets, legitieme delete werkt. Data-schade beperkt: xpLog (80 entries) + 74 skills + habit-engine overleefden; streak/habitlog server-side gereconstrueerd uit de xpLog (checkin.js leidt actieve dagen toch al uit xpLog af). Daarnaast: 7 skill-fototegels via de gratis Unsplash-route toegevoegd (tennis, gym, endurance, reading, piano, cooking, drawing) — licentie per foto geverifieerd, gehotlinkt via de officiële images.unsplash.com CDN met crop-parameters; 19 tegels resteren voor de premium Higgsfield-batch zodra er credits zijn (saldo was 0, free plan).

- **v9.22 — week-strip + Jarvis E2E-bewijs.** (1) Laatste open roadmap-item gebouwd: een **week-strip** boven de Main-agenda — 7 dag-chips (gisteren t/m +5) met weekdag, datum, en max 4 gekleurde dots per gepland blok (groen=mission, ember=skill, ink=custom; gedimd als gedaan, "+" bij meer). Vandaag krijgt een ember-ring, de geselecteerde dag inverteert naar ink. Tik = spring direct naar die dag (zet agendaOffset), strip herrendert mee met elke agenda-wijziging. Je week in één oogopslag, plannen zonder pijltjes-klikken. (2) **Jarvis 2.0 fase 1 nu ook E2E-bewezen in productie**: via pg_net een leesvraag gesteld ("welke habits staan vandaag open?") — Jarvis riep zelfstandig get_state aan en antwoordde met de werkelijk openstaande habits (cold_shower, walking) uit de live data. De tool-loop werkt buiten simulatie. Sitecheck: 8 bevindingen, allemaal eerder getriagede vals-positieven (guarded dynamische overlays) + de geparkeerde subFromCat.

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

## 9. Roadmap — v10 (vastgesteld 2026-07-21, vervangt de oude v10-plan-sectie)

### ✅ Besluiten van Joey + bijgewerkte to-do (2026-07-28, discussie-sessie — nog NIET gebouwd)

**Afgerond / van de lijst af:**
- Gemini API-key → werkt gewoon (Jarvis draait). Resolved.
- Apple Health shortcut → **volledig skippen**, Fitbit heeft het vervangen. Overal verwijderen.
- Push-beleid-vraag → hij krijgt al notificaties; prima zo. Geen open vraag meer.
- Skills-reset (gedaan), Higgsfield/credits (van tafel), meeste skill-foto's (gratis Pexels-route loopt).
- Habit-ladders → blijven zoals ze zijn (behalve meditation, zie hieronder).

**Bevestigde to-do (later bouwen, eerst bespreken):**
1. **Meditation-ladder uitbreiden** — meer quests + unlock-path (rest van de habits blijft ongewijzigd).
2. **Agenda week-weergave** = gewenst; maand-weergave = nice-to-have. Drag-to-move = NIET nodig.
3. **Agenda tijd-granulariteit fixen** — klikken om te plannen moet flexibele duur toestaan (30 min, 1,5 uur, enz.); het huidige halfuur-systeem is te rigide (kan geen half uurtje of anderhalf uur vullen). Echte usability-fix.
4. **Core skills-sectie onder Body** — op de plek van "new skill / finger whistling": een **horizontaal scrollbare rij van ALLE skills waaraan XP is toegevoegd, nieuwste eerst**, naar rechts scrollen voor oudere (mag oneindig). Vervangt de huidige focus-skills-weergave.
5. **Quest "hoe-behaal-ik-dit"-roadmaps** — per tier-gate/quest concrete stap-voor-stap-uitleg wat te doen/leren (bijv. "learn math" → echte stappen; piano → eerst linkerhand, enz.). Grote content-feature, vooral voor knowledge maar ook skill-specifiek. Joey mist dit het meest bij Path to Superiority (plek maakt niet uit, het PAD ontbreekt).
6. **Fitbit hourly / slimmere Jarvis** — intraday-data zodat Jarvis meer snapt (zoals de Google Health-briefing die hij nu trial't). Vereist Supabase → Claudia neemt Joey **stap voor stap** mee.
7. **"Websites Verkopen"-venture** — vragen/quests toevoegen; hero-foto's t.z.t.
8. **Vormgeving-overhaul + scroll-animaties** — wacht op Joey's referenties (via NAAM van sites/apps, niet uploads).
9. **Wishlist-fix** — bedrag-veld is onduidelijk/onleesbaar; labels + add-flow verhelderen.
10. **"Access my levels"** — kritisch auditen (nog niet gedaan).
11. **Laatste skill-foto's** — marketing/ai_tools/content/languages/teeth afmaken.

**Nog te beslissen door Joey:**
- **Seasons:** wil hij het concept (maandelijkse focus + boss quest), 21→21 of kalendermaand? Of skippen.
- **Prioriteit:** welke grote track eerst — later te bespreken.

### 🔁 Verfijningen (2026-07-28, deel 2)
- **Seasons: JA, wil hij.** Flow: hij geeft Jarvis (of Claudia) z'n 3 focus-skills + tijdsbudget/dag + duur (bijv. dansen/piano/tekenen, 2u/dag, 1 maand) → Jarvis stelt een **realistische master/boss-quest** op (bijv. stretchen → "halve split deze maand", later "volledige split"). Realistisch + haalbaar.
- **Core-skills-rij → op MAIN (home), NIET Body.** Vervangt de huidige "focus skills"-sectie op Main. Nieuwste-XP-eerst, naar rechts scrollen, oneindig. Integreert de seasons-focus.
- **Main-layout opschonen:** BEHOUDEN = Next move, Today's minutes, Gratitude. WEG = het "tap to schedule / plan je tijd"-blok helemaal. "Free time" = twijfel → mogelijk vervangen door een **reminder als hij op een uurtje klikt** i.p.v. verwijderen.
- **Quest-roadmaps (#5): moeten op wetenschappelijk bewijs gebaseerd zijn.**
- **🚨 BUG (prioriteit): gratitude-woorden verdwijnen.** Cloud heeft t/m 2026-07-15; vandaag ingevulde woorden persisteren niet. Save-pad van rpg_gratitude_v1 onderzoeken (reset was NIET de oorzaak).

### 🔁 Verfijningen (2026-07-28, deel 3)
- **Free time-blok: BEHOUDEN** als lichte motivatie-reminder (de "leisure time / benut je uur"-vibe vindt hij leuk). Maar: bij tikken op een uur wil hij (a) zien wat er te doen is én (b) **zelf een taak kunnen toevoegen die blijft staan** (persisteert).
- **Jarvis motiverender + personaliseerbaar.** Huidige berichten voelen generiek ("define the product") en altijd op dezelfde tijden → niet motiverend. Wil meer "get your ass to work"-energie, en zelf kunnen aangeven wat Jarvis tegen hem zegt. Claudia stelt hem calibratie-vragen om de juiste toon/triggers te leren.
- **Agenda (bijgewerkt):** halfuur-granulariteit is prima, MAAR: (a) twee losse halfuur-blokken in één uur moeten allebei makkelijk tikbaar zijn zonder per ongeluk het kruisje te raken (meer ruimte per halfuur); (b) **drag-to-move WEL gewenst** — niet om te plannen, maar om een bestaand blok makkelijk naar een ander/volgend uur te slepen als het in het verkeerde uur staat.
- **Seasons: ook een handmatig tik-systeem** naast Jarvis — hij wil autonomie om skills + doel zelf te zetten (vertrouwt Jarvis niet blind). Jarvis-suggestie voor de master-quest = optioneel, niet verplicht.

### 🔁 Verfijningen (2026-07-28, deel 4) — Jarvis-toon + prioriteiten

**Jarvis motivatie-spec (Joey's woorden):**
- Toon = **tough love + hype**. Accountability-over-geld ("you're losing money") landt NU nog niet (“als het me nog niet boeit kan het me niet motiveren”) — later wel.
- Zinnen die landen: "get your ass to work", "you can do so much more with your life", "you have free time, so spend it well", "you wanna be the king, you gotta work", "if it was easy, everybody would do it", "are you proud of yourself?", "time is ticking".
- Irriteert: kale taak-instructies zoals "define the product". Beter: taak in aspiratie wikkelen → "you wanna get rich? you better define the product."
- **Bot over data = ja**, maar begripvol: als hij fietste/sportte maar geen 10k stappen haalde is dat prima — niet zeuren over een arbitrair getal; wel duwen bij echte luiheid (“ik heb die daily missions niet voor niets opgesteld”).
- Joey wil **zelf zinnen/toon kunnen instellen** (settings). Niet altijd op dezelfde tijden.
- **Free time → integreren in de agenda** (bij het kiezen/plannen van een uur), niet als los Main-blok dat hij toch negeert. Claudia bedenkt een creatieve manier.

**Voorgestelde prioriteitsvolgorde (Claudia's plan — Joey bevestigt/herschikt, daarna "go"):**
1. 🐛 **Gratitude-bug** — save-pad `rpg_gratitude_v1` fixen (persistentie/display). Klein, hoge irritatie.
2. 🐛 **Wishlist bedrag-veld** — label/leesbaarheid van de add-flow. Klein.
3. 🔧 **Agenda-usability** — twee 30-min blokken per uur allebei tikbaar (geen kruisje-ongeluk) + drag-to-move van bestaand blok. Middel.
4. 🏠 **Core-skills-rij op Main** (nieuwste-XP-eerst, horizontaal scrollen) i.p.v. focus-skills. Middel.
5. 🧹 **Main opschonen** — tap-to-schedule weg; free-time in de agenda-flow; next move/today's minutes/gratitude blijven.
6. 🗣️ **Jarvis-toon overhaul** — tough-love+hype prompts + Joey's eigen zinnen instelbaar (edge function = Joey's Supabase-tap; settings-UI kan front-end).
7. 🌟 **Seasons** — handmatige tik-picker (3 skills + tijdsbudget + duur) + optionele Jarvis master-quest.
8. 📚 **Quest hoe-behaal-roadmaps** (wetenschappelijk onderbouwd) — groot; start met piano + knowledge/superiority.
9. 📶 **Fitbit hourly + slimmere Jarvis** — intraday; Joey's Supabase-taps, Claudia leidt stap-voor-stap.
10. 🧰 **Websites Verkopen-venture** vragen/quests + hero-foto's; laatste skill-foto's; **Access my levels**-audit.
11. 🎨 **Vormgeving-overhaul + scroll-animaties** — wacht op Joey's referenties (via naam van sites).

### ✅ Bevestigd + laatste verfijningen (2026-07-28, GO)
- Prioriteitsvolgorde 1–11 akkoord. Joey: **"nu gaan uitvoeren"**, top-down.
- **#3 Agenda:** halfuur-blokken éN de optie om een **heel uur** te plannen moeten allebei blijven.
- **#7 Seasons:** **1 focus-skill** (3 is te veel), **Claudia bedenkt de master-quest zelf** (NIET aan Jarvis geven). Voorbeeld: skill = dansen, aanname beginner → realistische maand-quest; daarnaast gewoon de daily missions.
- **#8 Roadmaps:** kritisch naar **ALLE** skills kijken (vooral piano + knowledge, maar per skill echt doordenken). Moet **specifiek + meetbaar**: idealiter echte oefen-sommen / een mini-"examen" per level (“als je deze sommen kan, zit je op dit level”). LearnMath-voorbeeld (van ChatGPT): rekenen → breuken → procenten → algebra — maar mét concrete sommen, niet alleen de onderwerpen. Joey snapt dat 1 som ≠ hele stof; wil meetbare checkpoints.
- **#9 Fitbit:** Joey wil de stappen NU om parallel uit te voeren.

### 🔁 Verfijningen (2026-07-28, deel 6) — Fitbit-data breed + Body-tab + reset-knop
- **Fitbit-sync: veel meer Google Health-data ophalen** dan nu (nu: steps/AZM/sleep/RHR/weight). Joey wil ook: **HRV, resting HR, blood oxygen (SpO2), breathing rate, skin-temp-variatie, distance, current HR**, en week/maand-trends. → Jarvis moet dit gebruiken voor een **readiness-achtige, kritische blik op zijn "body system"** (Google Health berekent readiness uit HRV + recente slaap + resting HR).
- **Veilige aanpak:** dit als **aparte edge function** (`fitbit-intraday`, eigen rij `health_fitbit_intraday`) bouwen, zodat de werkende `fitbit-sync` (dagelijkse pijplijn) NIET kan breken. Uur-buckets steps+HR + de extra vitals daar.
- **Body-tab motiveert niet meer:** overweegt te veel op gym/kracht (Hevy gebruikt hij voorlopig NIET — klaar met zware sportschool). Zijn echte activiteit (veel **cardio + tennis + endurance**) wordt niet getoond → daardoor kijkt hij er nauwelijks naar. **Body moet cardio/tennis/endurance reflecteren.**
- **Body-grafieken à la Google Health:** steps (en andere metrics) met **dag/week/maand-toggle**, **uur-detail** bij tik, **scrubben met je vinger** om waarden te zien, en een **pijltje terug** naar vorige dag/week/maand. Nu: steps alleen per week, kan niet naar vorige week; maand-view zit vast in huidige maand, kan niet verder terug. Frustreert → kijkt er weinig naar.
- **Per-skill reset-knop:** op ELKE skill, zodat Joey niet elke keer hoeft te vragen. (Claudia bouwt dit nu, met bevestiging.)
- **Core nu resetten:** Joey zette core op level 11 als test (om de gespierde body-visualisatie te zien) → mag terug naar 0.
- **Body-visualisatie wordt gespierder bij hoger level** (vindt hij grappig); foto's daarover later.
- Joey pakt calisthenics/endurance/**core** weer op — meer core-gefocust.


> De v9-lijn (v9.26 → v9.34) is afgerond en geconsolideerd: quest-claim/tier-gate-fix, realtime cross-device sync, cache-busting, why's + milestones + benefits voor alle skills, topical iconen, Fitbit-coach, stappen- én gewichtsfix (Apple Health geretireerd). v10 opent een nieuwe fase. Legenda per taak: 🟢 = Claudia kan dit zelfstandig bouwen · 🟡 = vereist Joey's ontwerp/beslissing · 🔵 = vereist Joey's Supabase-approval (edge function/cron/migratie) · 💳 = vereist Higgsfield-credits.

### Track A — Fitbit-intelligentie & de coach-loop  *(hoogste dagelijkse waarde)*
- A1. 🔵 **Intraday/hourly pull** — fitbit-sync edge function omzetten naar uur-buckets (steps + HR) in `health_fitbit_intraday`; cron 3×/dag → elk uur; intraday-scope van de Google/Fitbit-app verifiëren.
- A2. 🟢 **Beweeg-/inhaalnudges in-app** — voortbouwen op de v9.33 coach-kaart zodra uurdata bestaat (dag-versie is al live).
- A3. 🔵 **Adaptieve ochtendbrief** — na 2+ dagen zonder XP schakelt Jarvis' brief van toon/urgentie; RHR- en slaaptrend-advies verweven (send-daily-push).
- A4. 🟡 **Push-beleid** — welke nudges wil je als push vs alleen in-app? (voorkomt notificatiemoeheid)

### Track B — Seasons & progressiediepte
- B1. 🟡 **Season-concept** — 3 focus-skills/maand via bestaande `rpg_focus_skills_v1`: hoe start een season, handmatig of automatisch kiezen, wat levert 'm op?
- B2. 🟡 **Boss quest per season** — één grote maanddoelquest; wat definieert 'm en wat is de beloning?
- B3. 🟡 **Ladders voor gewoonten** — habits een quest-ladder geven zet tier-gates op je dagelijkse skills (gedragswijziging): wil je dat wel/niet?

### Track C — Agenda & planning
- C1. 🟡 **Week/maand-weergave** (nu dag-only) — layout-ontwerp.
- C2. 🟡 **Drag-to-move agendablokken** — interactie-ontwerp + mobiel drag-risico.

### Track D — Visuele & content-polish
- D1. 💳 **Skill-fototegels** (Higgsfield) — ~32 tegels, Daylight-stijl vastgelegd; wacht op credits.
- D2. 🟡 **Core skill tracker UI** onder Body (finger fluiten, dansen) — skills+ladders bestaan al; de Body-sectie zelf is ontwerp.
- D3. 🟢 **Doorlopende icoon/content-polish** waar veilig.

### Track E — Data-integriteit & infra
- E1. 🟢 **Per-veld tijdstempel-merge in sync.js** — extra vangnet nu realtime aan staat; voorzichtig, front-end, met tests.
- E2. 🔵 **Legacy-skill-opschoning** — 28 verouderde skills uit de character-blob (destructieve migratie; jouw OK + tap).
- E3. 🔵🟡 **Supabase Auth** — groter project, geparkeerd; jouw beslissing + setup.

### Track F — Productvisie (langere horizon)
- F1. 🟡 **Publieke platform-richting** — skill-levels die echte uitkomsten beïnvloeden (leningen/verzekering/sociaal). Strategisch; jouw koers.

### ⛳ Waar Claudia nu Joey's feedback voor nodig heeft (beantwoord in één keer → deblokkeert meerdere tracks)
1. **Seasons (B1/B2):** start een season automatisch op de 1e van de maand of kies jij 'm? En wat is de beloning voor een afgeronde season / boss quest?
2. **Habit-ladders (B3):** wil je tier-gates op je dagelijkse gewoonten (ja/nee)?
3. **Agenda (C1/C2):** eerst week-weergave of eerst drag-to-move? En dag→week: swipe of knop?
4. **Core tracker (D2):** hoe wil je de Body-sectie voor fluiten/dansen zien — een aparte "Core skills"-rij, of gewoon tussen de andere skills?
5. **Push-beleid (A4):** mag ik nudges als push sturen, of hou je die liever alleen in de app?
6. **Prioriteit:** welke track pak ik ná v10.0 als eerste — A (Fitbit-hourly), B (seasons), of C (agenda)?

Track A1/A3, E2, E3 wachten sowieso op je Supabase-taps; D1 op Higgsfield-credits. E1 en A2/D3 kan ik zelfstandig oppakken zodra je zegt: go.

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
