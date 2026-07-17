# Jarvis 2.0 — Design (v9.9, ready to build)

Joey's brief: Jarvis moet zelfvoorzienend zijn. Eigen kennis, geen Claudia-tussenstap
voor data. "Ik heb X gedaan" → hij berekent en geeft XP. "Dit lukt niet" → hij komt
met alternatieven. Het liefst past hij zelf de site aan, en heeft hij "alles van Claudia".

## Eerlijke grenzen eerst
- Jarvis draait op Gemini Flash: snel en gratis, maar geen Claudia. Met de juiste
  tools + context dekt hij **dagelijkse coaching en data-acties volledig**; het
  **bouwen** (nieuwe features, ontwerp, architectuur) blijft Claudia-werk.
- "Zelf de website aanpassen": een LLM die autonoom live code pusht is een
  betrouwbaarheidsrisico dat het principe *werkend boven mooi-maar-kapot* schendt.
  Compromis dat wél werkt: Jarvis krijgt een `propose_change`-tool → schrijft
  verzoeken naar `app_state.jarvis_backlog` → Claudia leest die bij elke sessie
  als eerste in en voert uit. Joey hoeft dus niets meer door te geven.

## Het fundament: de actie-wachtrij (WAAROM dit de enige juiste route is)
sync.js pusht het **hele blob** per appKey met last-write-wins (`collect()` →
upsert). Elke server-side wijziging in `app_state.rpg` wordt dus overschreven
door de eerstvolgende device-push. Jarvis mag NOOIT in `rpg` schrijven.

In plaats daarvan:
1. Jarvis appendt acties naar een **eigen** app_state-rij `jarvis_actions`:
   `{ id, ts, type, payload, consumed:false }` — types: `addXP`, `checkHabit`,
   `claimQuest`, `planAgenda`, `note`.
2. `xp.js` krijgt een kleine consumer (poll bij load + elke 60s): haalt
   onverwerkte acties op, voert ze uit **via de bestaande client-engine**
   (`addXP`, `checkHabitFor`, `setQuestDone`) — dezelfde code-paden als de UI,
   dus streaks/decay/tier-gates kloppen automatisch — en markeert ze
   `consumed:true` terug in de rij (aparte rij = geen blob-conflict).
3. Dubbel-toepassen over devices is uitgesloten doordat de consumed-flag in de
   gedeelde rij staat en het resultaat (rpg-blob) toch al synct.

## Gemini function calling (fase 1)
De edge function declareert tools; Gemini kiest, wij voeren uit, loop tot antwoord:
- `get_state(sections)` — habits/skills/agenda/quests/weight on demand (verkleint
  ook het systeem-prompt).
- `award_xp(skill, amount, reason)` → wachtrij. Regels in de tool-beschrijving:
  quickLog-bedragen als anker (20–60 XP typisch), nooit >200 zonder expliciete
  mijlpaal, skill moet bestaan.
- `check_habit(key, date?)` → wachtrij (vandaag of gisteren).
- `claim_quest(skill, lvl)` → wachtrij, alleen als unlocked (server checkt tegen
  RPG_QUESTS-kopie).
- `plan_agenda(hour, skillKey, date?)` → wachtrij (`rpg_agenda_v1:` is
  prefix-synced; ook via queue afhandelen, zelfde reden).
- `propose_change(title, detail)` → jarvis_backlog voor Claudia.
- `remember(note)` — vervangt de <remember>-tag netjes.

## Eigen kennis (fase 1, zelfde deploy)
- Systeem-prompt krijgt een **GAMENFY-KENNIS**-blok: XP-formule-samenvatting,
  tier gates 10/25/50/75, habit-economie (+15, −1/dag gemist), fysieke decay
  (−1 level/14 dagen), quest-ladder-principes, Joey's trainingssplit (geen
  squat/deadlift), kernprincipe "één actie vandaag".
- Context-builder uitbreiden: habit-scores van vandaag, agenda van vandaag,
  quests binnen bereik van een gate, gewichtstrend (po-coach rij).

## Al gebouwd (v9.10)
- **Nederlandse spraakberichten**: mic in jarvis.html → audio rechtstreeks naar
  Gemini (multimodaal, één call = transcript + antwoord). Fase 1 hoeft spraak
  dus niet meer te bouwen; de tool-loop krijgt dezelfde getranscribeerde intent.

## Status
**ALLE FASEN LIVE.** Fase 1 (v9.11, tools + actie-wachtrij, door Joey in de praktijk
gebruikt incl. spraak), fase 3 (v9.19, Fitbit-context + health-sectie), fase 2
(v9.20, Gemini-geschreven ochtendbrief met verse slaapdata, structured output,
brief loopt door in het chat-geheugen). Het ontwerp is volledig uitgevoerd.

## Fasering
1. **Fase 1 (één sessie):** action-queue consumer in xp.js + edge function v4
   met bovenstaande tools + kennisblok. Daarmee staat 90% van Joey's wens.
2. **Fase 2:** proactief — dagelijkse push (bestaande send-daily-push uitbreiden)
   waarin Jarvis 's ochtends de dag opent met status + één voorstel.
3. **Fase 3:** Fitbit-data in de context zodra fitbit-sync draait (zie
   FITBIT-SETUP.md).

## Definition of done (fase 1)
"Yo Jarvis, ik heb 45 min piano geoefend en het huis gedaan" → antwoord bevat
uitgevoerde acties (+40 XP piano, habit Household ✓) → binnen 60s zichtbaar in
de app zonder refresh-gedoe → "lukt niet"-vragen krijgen alternatieven uit de
quest-ladder (lager gelegen quest of quickLog) i.p.v. algemene peptalk.
