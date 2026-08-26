# GAMENFY — Master Document (v11.0)

> Single source of truth voor de Gamenfy dashboard. Lees dit eerst, elke sessie.
> Joey noemt de assistent "Claudia". App-UI is Engels. Aesthetic: premium & licht ("Daylight"), niet donker/gamey.
> **Volledige geschiedenis t/m v10.92 staat in `GAMENFY-HISTORY-ARCHIVE.md`** — dit document is bewust kort en beschrijft alleen de huidige staat, geen changelog. Zoek daar alleen als Joey specifiek naar iets ouds vraagt.

---

## Waarom v11 (24 augustus 2026)

Joey: een nieuwe hoofdstuk-markering, geen technische heropening van de oude, losstaande v11-branch (World Hero + Skill Pulse — hij weet zelf niet meer precies wat dat was, dat spoor is gesloten). Reden: hij gaat Higgsfield aanschaffen en zit tegen zijn eigen gebruikslimiet van Claude aan — hij wil niet dat elke sessie eerst door 92 versie-regels moet spitten. Vanaf nu: dit document beschrijft **wat er nu is**, niet hoe het zo geworden is.

---

## 🎯 Joey's 100-Jaar Levensplan — de "waarom" achter Gamenfy

Bron van waarheid voor prioritering (welke skill helpt echt bij zijn doelen), niet iets om te herschrijven. Volledige tekst staat in het archief. Kernpunt voor nu (27 jaar, binnen 1 jaar): €25-50k liquide vermogen zelf verdiend, gezonde relatie, 3+ maanden/jaar locatie-onafhankelijk kunnen leven, trots op dagelijkse keuzes, blijven ontdekken vanuit nieuwsgierigheid i.p.v. angst.

---

## 1. Wat Gamenfy is

Een gegamificeerd persoonlijk Life-OS — skills, levels, gewoontes, quests, ventures, streaks en een check-in-loop maken van het echte leven een RPG. Draait als PWA (installeer via "toevoegen aan beginscherm"). Ontwerpprincipe: *werkend boven mooi-maar-kapot.*

Huidig gebruiksdoel (Joey's eigen woorden, 24-08-2026): voornamelijk zelfmotivatie om meer geld te genereren. Het ooit-een-bedrijf-ervan-maken staat nog open maar is bewust uitgesteld — te gepersonaliseerd om nu al te productiseren, en onduidelijk hoe snel daar revenue uit zou komen. Zie Ventures § hieronder.

---

## 2. Techstack & bestanden

- **Frontend:** platte HTML/CSS/JS, geen build-stap. Elke pagina een losstaand `.html`-bestand.
- **Theme "Daylight":** `--bg #F4F3EF` · `--card #FFFFFF` · `--ink #15140F` · `--muted #6F6C63` · `--ember #D4633E` (accent) · `--gold #C9A227` · `--green #2E8B5F`. Fonts: Schibsted Grotesk (display), Inter (body), SF Mono (cijfers).
- **Opslag:** `localStorage`, gespiegeld naar **Supabase** (`public.app_state`, JSONB) via `sync.js`. `localStorage.setItem` wordt globaal gepatcht — elke matchende schrijfactie triggert automatisch een sync-push, ook binnen hetzelfde tabblad.
- **Repo:** `github.com/Kingkangaroos/Joe` (privé), Vercel auto-deploy op push naar main. Fresh GitHub-token elke sessie van Joey, nooit onthouden.
- **Supabase project:** `ttxjsoahmtennnufgeqx`.

| Bestand | Doel |
|---|---|
| `index.html` | **Main** — agenda, dagquote, missies, focus-skills, core tracker |
| `character.html` | **Body / Skills / Goals / Ventures / Lab**-tabs |
| `finance.html` | Net Worth / Maandlasten / Wishlist / Portfolio / **Debts** |
| `health.html`, `po-water.html` | health & water trackers |
| `settings.html` | focus-skills, PIN, quotes, Engine & nudges |
| `lab.html` | **Park 2.0** met 5 premium skill-companions + het bewaarde v11-plaza met alle 45 skills + link naar de 3 voorbeeldwebsites |
| `park2.css`, `park2.js` | Afgeschermde styling en interactie voor Park 2.0; leest echte levels/scores maar schrijft geen data |
| `sites.html` + `site-klus.html`/`site-pt.html`/`site-rijschool.html` | 3 werkende voorbeeldwebsites voor de Websites-venture, losstaand van de app-infrastructuur (geen `?v=`-tag nodig) |
| `xp.js` | skill-definities, XP/level-rekenkunde, gewoontes, `getSkillLevel` (unified), auto-check habits |
| `ladders.js`, `quests.js`, `ventures.js` | tier-ladders, quest-content, venture-content |
| `checkin.js` | streak-engine + avond-check-in |
| `push.js`, `sw.js` | Web Push client + service worker |
| `jarvis.html` | Jarvis-chat (Gemini-backend) |
| `sync.js` | Supabase cloud-sync |
| `topbar.js` | topbar + bottom-nav |

---

## 3. Level-systeem (v10.89, geünificeerd)

- **Gewone skills:** `level = floor(sqrt(xp/50)) + 1`, max 100.
- **Gewoonte-skills (isHabit:true — sleep, walking, nutrition, teeth, meditation, gratitude, good_deed, household, screen_time, cold_shower):** level = de **0-10 consistentie-score**, niet de XP. Score +1 per check, **1 dag gratie** bij een gemiste dag daarna −1/dag. `window.getSkillLevel(key, xp)` in xp.js is de ene bron van waarheid die dit overal correct teruggeeft — elke plek die een level toont (Lab, Your Skills, skill-detail, Time Sketcher) roept deze aan i.p.v. zelf te kiezen.
- **Privé-skills zonder isHabit** (no_porn, weed_control): gewoon XP-gebaseerd level, geen dag-voor-dag vervalsysteem — bekende, geaccepteerde beperking (een terugval wordt niet zichtbaar totdat er een aparte decay-uitbreiding voor gebouwd wordt).
- **Auto-afvinken** (walking/sleep uit Fitbit-data): checkt zowel vandaag (blijft "open" tot het doel gehaald is, geen dubbele XP) als gisteren (vangnet). `rpg_autohabit_v1` houdt bij wat al geëvalueerd is.

---

## 4. Tabs in het kort

**Main** — streak-pill, Jarvis-knop, dagquote, ochtend/avond-check-in, Weekly Review, Next Move (venture-stappen), agenda met Time Sketcher, Missions met auto-afvink-status, Gratitude, Core Tracker.

**Body** (`character.html`) — hologram-bodyscan, gezondheidskaarten (met een waarschuwing als de data >2 dagen stilstaat), body-skill-kaarten.

**Skills** (`character.html`) — RuneScape-stijl grid, Habit-tegels bovenaan (tonen de score als "Level"), skill-detailpaneel met tier-checklist (overgeslagen voor gewoontes — die hebben geen 1-100-ladder).

**Goals** — losstaand van de oude Quests-structuur (die is dood, zie §5), eigen doelen met voortgang en activiteitenlog uit `xpLog`.

**Ventures** — 3 actief (zie §6), elk met een **werkruimte-notitieveld** (vrije tekst, per venture apart, gesynchroniseerd) en bij Websites Verkopen een onderzoek-samenvatting.

**Lab** (`lab.html`) — bovenaan staat **Park 2.0 (optie D)**, op 26-08-2026 door ChatGPT/OpenAI gebouwd nadat Joey D als favoriete karakterrichting koos. De eerste vijf unieke companions zijn AI Tools, Tennis, Piano, Good Deed en Budgeting. Ze gebruiken Joey's echte level/0-10-score, lopen en pauzeren zelfstandig, hebben skill-specifieke idle-acties, reageren op tikken en tonen vier visuele groeifases (Ontwakend / In training / Gevorderd / Meesterschap). Het gemiddelde niveau bepaalt hoeveel begroeiing de tuin krijgt. De PNG-assets staan in `img/lab/park2/`; herkomst en ontwerpregels staan in de README daar.

Het bestaande v11-plaza met alle 45 cartoon-poppetjes blijft **ongewijzigd onder Park 2.0** staan als vergelijking en functionele fallback: per-categorie silhouet, devil/angel-inversie voor slechte gewoontes, categorie-filter, Het Park/De Arena. Niet verwijderen wanneer Park 2.0 verder wordt ontwikkeld. Link naar de 3 voorbeeldsites blijft eveneens staan.

**Finance** — Net Worth / Maandlasten / Wishlist / Portfolio / Debts.

---

## 5. Bekende dode code (bewust laten staan)

Het oude Quests-tabblad (`renderQuestView`/`renderQuestLadder`/`toggleWeeklyQuest`) is vervangen door Goals (v10.61) maar nooit verwijderd — groter, samenhangend dood blok, geen risico zolang niemand het aanroept. `getConfirmedMs` en `buildOptionalHtml` zijn wél opgeruimd (v10.92-review, bevestigd via git-geschiedenis veilig).

---

## 5b. Terug naar de basis — vergelijking met het originele Notion-plan (mei 2025)

Op Joey's verzoek: zijn oorspronkelijke Gamenfy-visiedocument uit Notion opgezocht en tegen de huidige app gelegd.

**Oorspronkelijke skill-lijst (Notion, mei 2025)**: reading, sporten/kracht, lopen/wandelen, pianospel, koken, trading, puzzelen, dankbaarheid. **Bijna alles is gebouwd** — reading, walking, piano, cooking, puzzling, gratitude bestaan allemaal. Twee originele ideeën zijn nooit opgepakt:
- **"Trading" als losse skill** — er bestaat wel `investing`, maar actief traden (kopen/verkopen) is conceptueel iets anders en heeft geen eigen skill.
- **"Cijfer of today"** — stond twee keer letterlijk genoemd in het originele plan, betekenis nooit verder uitgewerkt. Onduidelijk of dit nog relevant is — navragen bij Joey voor er iets mee gebeurt.

**Wel al gebouwd, maar niet uit dit specifieke document** — een detail dat WEL in het plan stond en nog nergens in de app zit: **een "word web" voor dankbaarheid** — een groeiend woordenweb waar je items uit kan kiezen en dat meegroeit met elke nieuwe toevoeging. Nu is Gratitude een simpel tekstveld. Mogelijke kleine, leuke uitbreiding.

**De lange-termijnvisie ("Toekomstvisie/Ideale Scenario")**: een openbaar platform waar skill-levels echt invloed hebben op verzekeringen, leningen, dating — alles (dit is al bekend en vastgelegd, komt hier bevestigd terug). **Nieuw detail dat niet eerder was vastgelegd**: bij een hoog level (het voorbeeld was level 60) zou je toegang krijgen tot iets exclusiefs in de echte wereld (in het voorbeeld: een speciale sportschool) — een gamified real-world-beloning gekoppeld aan level. Nog nergens gebouwd, puur visie.

---

## 6. Ventures — status per 24-08-2026 (4 ventures)

**Prioritering toegevoegd aan Gamenfy Vormgeving (24-08-2026)**: Joey vroeg om een stappenplan dat écht rekening houdt met zijn 1-jaarsdoel (€25-50k zelf verdiend). Van de 5 vormgevingskeuzes heeft er maar één een directe lijn naar geld: de Websites-hero (raakt outreach → klanten → omzet), die dus als expliciete "eerst dit"-stap bovenaan staat, ook al hoort-ie technisch bij een andere venture. De overige 4 (poppetjes, Park, avatar, skill-foto's) zijn geordend op secundaire waarde — hoe vaak zie/gebruik je het, hoe sterk motiveert het intrinsiek — niet gewoon willekeurig naast elkaar.

**Nieuw: "Gamenfy Vormgeving"** — Joey: "ik mis het visuele aspect... zet gewoon ff alles op 1 plek, anders maak je maar een nieuwe venture." De vormgeving-alternatieven (Lab-poppetjes, Het Park, eigen avatar, skill-foto's) gingen abusievelijk in de Websites-venture terecht — dat klopte niet, want dat is algemene app-vormgeving, geen Websites-business. Nieuwe venture toegevoegd met 2 fases (Richting kiezen / Eerste uitvoering), gelinkt naar het bestaande Lab in plaats van een nieuwe pagina te bouwen — dat zou tegen "alles op 1 plek" ingaan. Inhoud herverdeeld: algemene vormgeving → Gamenfy Vormgeving, alleen website-hero's (specifiek voor die business) → Websites Verkopen.

1. **Grip** — pain-relief squeeze ball, B2B via tattoo-studio's. 5 fases, 17 stappen. Niet actief opgepakt deze periode.
2. **Gamenfy Public** — van persoonlijk dashboard naar iets bruikbaar voor anderen. 3 fases, 7 stappen. **Joey's huidige positie (24-08-2026, letterlijk vastgelegd)**: dit blijft voorlopig een persoonlijk motivatie-instrument, geen bedrijf. Hij weet nog niet hoe hij het zou productiseren gezien hoe gepersonaliseerd het is, en twijfelt of app-store/ads-marketing snel genoeg revenue zou opleveren. Geen actie hierop tenzij Joey het zelf weer oppakt.
3. **Websites Verkopen** — bouw & verkoop simpele sites aan lokale bedrijven. Onderbouwd door het Deep Research-rapport (zie werkruimte in de app zelf voor de samenvatting). 3 voorbeeldsites klaar + 5 auditrondes doorstaan. **Open vraag van Joey (24-08-2026)**: het lezen van het rapport maakte hem juist minder enthousiast — de branches die hij zou willen bereiken hebben mogelijk geen behoefte aan dit soort site. Hij was aan het zoeken naar alternatieven maar heeft nog niet geconcretiseerd welke. **Volgende stap: navragen welke branches/doelgroepen hij specifiek voor ogen heeft**, voor er verder gebouwd wordt op de huidige niche-aanname (klusbedrijven/PT uit het rapport).

---

## 7. Open items

### 🤖 Claude to-do (kan ik zelfstandig oppakken)
*Niets actief in de wachtrij op dit moment.* Alles wat deze sessie is gevraagd is afgerond en live.

### 📥 Als Joey "ga verder"/"go ahead" zegt zonder verdere context
**Correctie 24-08-2026**: Joey wil NIET in Notion werken — dat was alleen bedoeld om eenmalig het originele plan op te halen (zie §5b), niet als doorlopende plek. Hij wil alles op één plek: in de app zelf. De Notion-ideeën-pagina die hier eerder stond is losgekoppeld van dit protocol.
Vaste volgorde nu:
1. **Eerst** de 🧑 Joey to-do-lijst hieronder — check of er intussen antwoord kwam.
2. **Alleen als die leeg is**: een echte functionaliteitsreview tegen de live Supabase-data, niet alleen syntax.

### 🧑 Joey to-do (wacht op jou)
- **Higgsfield-abonnement** — je zei woensdag. Gebruik bij voorkeur het aankooppad via de koppeling hier in de chat, niet de losse higgsfield.ai-website (andere prijzen, onduidelijk of ze dezelfde toegang geven).
- **De `visibilitychange`-fix (v10.90) in de praktijk bevestigen** — check iets af, sluit de app zoals je normaal doet, en vraag me te controleren of het is aangekomen. Nog niet bevestigd te werken op jouw toestel.
- **Websites-venture: welke branches/doelgroepen wil je specifiek bereiken?** — bepaalt of de huidige niche-aanname (klusbedrijven/PT) nog klopt of dat er een ander plan nodig is.
- Apple Health-shortcut officieel afschrijven — grotendeels moot nu Fitbit werkt, jouw eigen taak als je het nog wil opruimen.

---

## 5c. Erkende hiaat — dingen die niet robuust genoeg zijn vastgelegd

Joey (26-08-2026): meldt dat hij eerder iets zei over "vier delen", de homepage, en scrolltechnieken — en het gevoel heeft dat dit soort dingen niet geregistreerd worden, waardoor hij het moet herhalen en het zelf ook vergeet.

**Onderzocht, niet gevonden**: het volledige archief doorzocht op "scroll", "4 delen", "World Hero", "Skill Pulse", "Kargo Studio" — alleen een herhaald, algemeen punt "vormgeving-overhaal + scroll-animaties" (wacht al maanden op zijn referenties) en een losse, contextloze vermelding van de oude v11-branch "World Hero + Skill Pulse" zonder verdere uitwerking. **Dit specifieke idee (4 delen/homepage/scrolltechniek) is dus niet duurzaam vastgelegd** — een reële hiaat, geen ingebeelde.

**Genomen besluit**: vanaf nu schrijft Claudia een nieuw, ook maar losjes genoemd concept DIRECT in dit document (of de relevante venture-werkruimte) op het moment dat het genoemd wordt, in plaats van te wachten op een groter "laten we alles ordenen"-moment. Voorkomt dat iets alleen in een sessie-samenvatting blijft hangen zonder in de echte, doorzoekbare documentatie te belanden.

**Nog te doen**: navragen bij Joey wat het "vier delen/scrolltechniek"-idee precies inhield, en dan meteen vastleggen.

## 5d. Teruggevonden idee — "4 vlakken"-homepage (nooit gebouwd, wel ooit gemockt)

Onderzocht n.a.v. Joey's zorg dat ideeën wegvallen. Bevestigd in het volledige transcript:

**Wat WEL is uitgevoerd** (ter geruststelling — niet alles gaat verloren):
- De "zen garden"/boom-mockup is bewust losgelaten en geëvolueerd tot het huidige Lab-raster — inclusief de per-skill-attributen (kokmuts, tennisbandje) die toen al als "de échte oplossing" werden genoemd.
- "Voorbeeldwebsites in de app, alles op één plek" (uit hetzelfde gesprek) is gebouwd: de 3 voorbeeldsites + het Lab-overzicht.
- De categorie-filter in het Lab (tik "Money" → geld-poppetjes naar voren, rest naar de achtergrond) is precies zo gebouwd als toen omschreven.

**Wat NIET is uitgevoerd — een bevestigde hiaat**: een "4 vlakken"-startscherm. Idee: de hele Main-pagina als vier vaste kwadranten (Lichaam/Geld/Geest/Bouwen) die met haarlijnen in elkaar overlopen — geen losse kaartjes met marge, maar één samenhangend blok, tikken op een kwadrant opent dat domein. Er is ooit een visuele mockup van gemaakt, maar het is nooit als bouwbaar item vastgelegd en dus ook nooit gebouwd. Status: **open idee, wacht op Joey's beslissing of dit alsnog gebouwd moet worden**, eventueel als stap in Gamenfy Vormgeving.

**Nog niet zeker gebouwd**: Joey noemde ook dat de daily missions zichtbaar zouden moeten zijn binnen de categorie-gefilterde Lab-weergave. Navragen of dat nog steeds gewenst is.

## 8. Werkafspraak

- Claudia antwoordt in het Nederlands; de app blijft Engels.
- Bouw in fases, push per fase zodat Joey live kan testen.
- Kritisch blijven, premium én functioneel houden.
- **Nieuw vanaf v11**: elke open-items-lijst maakt expliciet onderscheid tussen wat Claudia zelfstandig kan oppakken en wat op Joey's input wacht — zodat hij zijn eigen actiepunten niet kwijtraakt tussen de technische regels door.
- Per-venture werkruimtes zijn Joey's eigen aantekenveld, in mensentaal, niet iets dat Claudia namens hem invult.

---

## Changelog sinds v11.0-baseline
- **v11.0 Park 2.0 (26-08-2026, ChatGPT/OpenAI)**: Joey koos karakterfamilie D. Vijf unieke, transparante 3D-assets gegenereerd en als levende companions bovenaan het Lab geplaatst. Echte data voedt level/score, schaal, mastery-aura en tuingroei. Toegevoegd: rondlopen, ademen/zweven, unieke AI/tennis/piano/hart/budget-effecten, tikreacties, detailpaneel, pauzeknop, responsive mobiele layout en reduced-motion-ondersteuning. Bewuste begrenzing: nog geen 4 losse afbeeldingen per evolutiefase en nog geen daily missions in de tuin; eerst Joey's reactie op deze live proef.
- **v10.93 (24-08-2026)**: werkruimte-notities kregen een Persoonlijk/Venture-toggle binnen hetzelfde blokje (bewaard apart, terugwaarts compatibel met de net-geschoten platte tekst). Notion-ideeën-inbox aangemaakt ("🧠 Gamenfy — Ideeën & to-do voor Claudia") + het "ga verder"-protocol vastgelegd (Notion-inbox → Joey-to-do-lijst → pas dan een volledige review), ook als los skill-bestand in `.claude-skills/`. Origineel Notion-plan (mei 2025) opgezocht en tegen de huidige app gelegd — zie §5b. **Eigen fout gevangen tijdens bouwen**: een str_replace dupliceerde per ongeluk de WEBSITES_RESEARCH-declaratie (JS zou gecrasht zijn), gevonden bij validatie vóór het live ging. **Tweede fout gevangen**: een escape-teken in een shell-commando at het woord "investing" uit de nieuwe research-sectie op, ook gevonden en gefixt vóór commit.
