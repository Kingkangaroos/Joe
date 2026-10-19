# Accountancy — Jaarrekeningen maken

Toegevoegd op 19 oktober 2026, door ChatGPT (OpenAI), op verzoek van Joey.

## In Gamenfy

Skills → Business → Accountancy → Jaarrekeningen maken · leerpad & oefencases.
Rechtstreeks: `accountancy.html`.

Eerste subdoel: zelfstandig een Nederlandse jaarrekening maken en onderbouwen. Het werkboek meet dit met zeven opeenvolgende fases, bewijsnotities en review. Een app-level volgt bestaande activiteit-XP; het werkboek houdt inhoudelijke bekwaamheid afzonderlijk bij. Niets is vooraf als beheerst aangemerkt. Er wordt geen beroepskwalificatie toegekend.

| Fase | Inhoud | Bewijs |
| --- | --- | --- |
| 1 | Startscan en opdracht afbakenen | Opdrachtkaart, stelselkeuze en startscan |
| 2 | Proefbalans en dossier | Sluitende mapping, dossierindex, ontbrekende stukken |
| 3 | Aansluitingen | Bank, debiteuren, crediteuren, btw en loon onderbouwen |
| 4 | Jaarafsluiting | Memoriaal, gecorrigeerde proefbalans, vermogensvergelijking |
| 5 | Waardering en fiscaliteit | Waarderingsmemo en commercieel-fiscale aansluiting |
| 6 | Eerste jaarrekening | Balans, resultaat, grondslagen, toelichtingen, vergelijkende cijfers en publicatiecheck |
| 7 | Herhaalbaar zelfstandig werken | Drie volledige oefendossiers, minimaal één externe review, alle kritieke punten opgelost |
| 8 | Engels | Reporting pack onder expliciet Dutch GAAP, woordenlijst, presentatie |
| 9 | IFRS for SMEs | Officiële derde-editie-oefeningen, stelselvergelijkingen, kasstroom en overgangsmemo |
| 10 | Full IFRS en internationale groep | Valuta, eliminaties, complete consolidatiecase en specialistische review |

## Oefenen

De app bevat drie originele fictieve cijfercases met zelf invulbare antwoorden, numerieke controle, journaalpostuitwerkingen en een foutlog:

1. Studio Almere, eenmanszaak: vijf afsluitcorrecties. Resultaat €13.200; activa €40.000; eigen vermogen €27.200; schulden €12.800. Geen inkomstenbelasting en vereenvoudigde btw-behandeling, expliciet aangegeven.
2. Flevo Handel BV: voorraad, nagekomen factuur en permanent fiscaal verschil. Gegeven fictief belastingtarief 20%, geen actueel Nederlands tarief. Commerciële winst €25.000, fiscale winst €26.000, belasting €5.200, nettoresultaat €19.800. Activa €147.000 = eigen vermogen €89.800 + schulden €57.200. De case noemt ontbrekende rapportagegegevens; het concept is daardoor niet een volledige wettelijke jaarrekening.
3. Internationale groep: externe USD-vordering en interne goederenlevering tussen twee EUR-functionele entiteiten. Valutawinst €500; groepsomzet €105.000; kostprijs €60.000; voorraad €25.000. Acquisitie, NCI, belastingen en omrekening van een buitenlandse bedrijfsactiviteit vallen buiten de mini-case. Een volledige groepscase is een latere praktijkopdracht.

De aanvullende oefenplekken staan in de app: spreadsheet, aparte kantoor-oefenadministratie, Exact-trainingen en officiële IFRS-modules. Echte klantgegevens blijven binnen de goedgekeurde kantooromgeving; het app-werkboek bevat alleen fictieve cijfers of anonieme leerpunten.

## Ritme

Voorstel: eerste ronde twaalf weken, drie sessies van dertig minuten per week. Dit is een startplanning, geen gegarandeerde tijd tot vakbekwaamheid. Herhalen en review bepalen het tempo. Sessies en minuten zijn aanpasbaar.

## Onderzoek en primaire bronnen

Bronlinks en toegangsinformatie staan ook per fase in de app. De route is een eigen didactische opbouw, geen officieel geaccrediteerde opleiding.

- KVK, grootteklasse en deponeren: https://www.kvk.nl/deponeren/in-welke-bedrijfsklasse-valt-je-bedrijf/
- Raad voor de Jaarverslaggeving, kleine bundel: https://www.rjnet.nl/richtlijnen/kleine-bundel/
- NBA, risicogericht samenstellen: https://www.nba.nl/tools-en-ondersteuning/publicaties/2015/risicogerichte-aanpak-samenstellingsopdracht/ — gebruik samen met actuele Standaard 4410; de brochure is een oudere methodebron.
- Exact Online trainingen: https://www.exact.com/nl/exact-online/support/trainingen — toegang kan per account verschillen.
- Belastingdienst, fiscale versus commerciële winst: https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/inkomstenbelasting_voor_ondernemers/winst_uit_onderneming — deze IB-pagina is geen bron voor een Vpb-tarief.
- IFRS for SMEs: https://www.ifrs.org/issued-standards/ifrs-for-smes/
- Officiële derde-editie-modules: https://www.ifrs.org/supporting-implementation/2025-ifrs-for-smes-supporting-materials/
- IFRS 18: https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/

De derde editie IFRS for SMEs is verplicht vanaf perioden die beginnen op of na 1 januari 2027; eerdere toepassing is toegestaan. Toelaatbaarheid wordt per jurisdictie/rechtspersoon bepaald. Het is niet automatisch een Nederlands statutair stelsel en is geen full IFRS. Onder full IFRS vervangt IFRS 18 vanaf 2027 IAS 1. Een Engelstalige jaarrekening kan gewoon Dutch GAAP blijven.

## Implementatie en verificatie

- Native skill: `xp.js`, categorie Business, normale XP-skill; Daily Missions blijven ongewijzigd.
- Native ladder: `ladders.js`, tien inhoudelijke fases. Accountancy's Skills-paneel verwijst voor bewijs en afronding naar het werkboek; het gebruikt geen automatische level-claim op basis van gelezen tekst.
- Werkboek: `accountancy.html`, `accountancy.css`, `accountancy-data.js`, `accountancy.js`.
- Voortgang: `rpg_accountancy_v1`, toegevoegd aan de bestaande centrale RPG-syncscope; gebruikt bestaande auth, dirty journal en cloudconvergentie. Geen SQL, nieuwe backend, alternatieve syncwriter of externe AI-request.
- Bewijscriteria: alle opleverstukken aangevinkt, criterium bevestigd en minimaal veertig tekens eigen bewijs. Fase 7 en 10 vereisen ook een anonieme reviewreferentie. Dit blijft zelfrapportage; er is geen automatische inhoudelijke dossierbeoordeling.
- Heropenen of bewijs wijzigen maakt de fase en afhankelijke vervolgfases weer open. Bestaande activiteit-XP en andere skills worden daarbij niet aangepast.
- Numerieke controle accepteert Nederlandse notatie. Antwoordwijzigingen maken de vorige score ongeldig.
- Automatische test: `tests/accountancy-smoke.js`, met rekenkundige balansaansluitingen, native registratie, syncscope, notitie-escaping, opvolgings- en reviewgates, heropenen en antwoordopslag.
- Bestaande Chess-registrytest aangepast van 48/46 naar 49/47 totaal/actief vanwege de nieuwe Accountancy-skill.
- Visuele browser- en iPhone/PWA-QA en een echte aangemelde round-trip tussen twee apparaten zijn nog niet uitgevoerd. Automatische tests bewijzen lokale werking en syncregistratie, niet een uitgevoerde gebruikerssessie.

Rollback: verwijder de nieuwe skill/ladder/link en nieuwe bestanden uit de publicatie; verwijder geen bestaand gebruikersbewijs of andere RPG-data.
