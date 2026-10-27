# Accountancy Praktijklab — 27 oktober 2026

Joey kent de basisactiviteiten en wil praktisch instappen rond fase 6. Doelgroep: kleine Nederlandse eenmanszaken met administratie, btw en jaarstukken. Geen competenties, leerpadfases of XP worden automatisch opgehoogd.

## Instap

Accountancy → Werk zelf een klantdossier uit. Direct: `bookkeeping-practice.html?case=clean` of `?case=messy`. Home heeft een nieuwe melding in de bestaande updatefeed.

Beide originele fictieve cases betreffen een dienstverlener gestart in december 2026. Hierdoor oefent de gebruiker één korte administratieperiode én een volledig eerste boekjaar. Scope: Nederlandse B2B-diensten 21%, factuurstelsel, geen KOR, personeel, voorraad, auto, buitenlandse transacties of IB-berekening. Een eenmanszaak deponeert deze jaarstukken niet bij KVK.

### Nette case

Negen normale boekingen aangeleverd; jaarpremie is nog geheel als kosten verwerkt en afschrijving ontbreekt. Gebruiker beoordeelt bronnen, boekt afsluitcorrecties en onderbouwt bank, btw en rapportage.

Controle-uitkomsten (exacte centen, geen ingediend aangifteformulier): omzet €4.500; kosten €230; resultaat €4.270; bank €5.584,40; debiteuren €1.815; inventaris netto €1.180; vooruitbetaalde kosten €550; btw-schuld netto €659,40; eigen vermogen €8.470; balanstotaal na saldering btw €9.129,40.

### Excel-case

Elf ongecontroleerde overgenomen boekingen, zichtbaar met bronreferenties en rekeningbedragen. Fouten: laptop incl. btw als kosten, dubbele softwarefactuur, privéopname als kosten, klantontvangst dubbel als omzet, particuliere aankoop met onterechte voorbelasting. Losse verkoopfactuur en bankkosten ontbreken. Gegeven klantantwoord bevestigt de particuliere aankoop. Daarna zijn nog afsluitcorrecties nodig.

Controle-uitkomsten: omzet €5.500; kosten €242; resultaat €5.258; bank €5.330,40; debiteuren €3.025; inventaris netto €1.180; vooruitbetaling €550; btw-schuld €869,40; eigen vermogen €9.216; balanstotaal na saldering btw €10.085,40.

## Functionaliteit

- Fictieve bronstukken, oorspronkelijke klantregels en bankafschrift.
- Pakketneutraal journaal met rekeningkeuze, omschrijving, bron en datum; valideert centen, periode, debet/credit en regelgrenzen.
- Tegenboekingsconcept; oorspronkelijke boekingen blijven bestaan.
- Saldibalans en rapportage berekend uit de actuele boekingen van de gebruiker.
- Bankmatching op journaalreferenties, inclusief meerdere regels, dubbele allocaties en niet gekoppelde bankboekingen.
- Btw-werkblad voor Q4: factuurgrondslag, btw en voorbelasting. Alleen exacte oefencijfers, geen echte aangifte.
- Uitleg, vragen, grondslagen, reviewlog en klanttoelichting. Rapportstatus vraagt cijferchecks, bankmatching en eigen reviewvoorwaarden; een match is geen inhoudelijke accountantscontrole.
- Bronpakket en eigen rapport als tekst downloaden vanuit de browser.
- Optioneel herstarten met de oorspronkelijke set of een volledig leeg dossier; bevestiging in de app, geïsoleerd per case.

## AI en privacy

Geen externe AI-koppeling, geen import van echte klantbestanden en geen lokaal AI-model geïnstalleerd. De kopieerbare prompt is uitsluitend samengesteld uit vaste fictieve bronstukken en oorspronkelijke fictieve boekingen, niet uit gebruikersnotities of de actuele invoer. De gebruiker kan zelf met die synthetische prompt een extern model testen en één JSON-voorstel terugplakken. Structuur en balanscontrole zijn geen inhoudelijke validatie. Na expliciete eigen review kan een voorstel alleen naar het boekingsconcept; posten blijft een afzonderlijke actie.

Twee vaste demonstratievoorstellen zijn als vooraf geschreven voorbeelden gelabeld: een bewust fout laptopvoorstel en een bruikbare periodecorrectie. Geen live AI-resultaten suggereren. Zelf gemeten tijd zonder/met AI omvat controle en correcties; geen productiviteitsbelofte.

Werkgeversbeleid blijft leidend; geen werkdata in deze persoonlijke app. Oefenwerk kan via de bestaande Gamenfy-accountsync worden opgeslagen. Dat is geen goedgekeurde lokale bedrijfsomgeving. Geen aanpassingen aan auth, database, RLS of cloud-writer.

## Opslag

`rpg_accountancy_v1.practiceLab.clean` en `.messy`, binnen de bestaande RPG-syncscope. Read-modify-write behoudt leerpadfases en andere accountancyvelden. Beschadigde JSON wordt niet overschreven. Geen nieuwe globale key of backend. Sync tussen echte aangemelde apparaten is nog niet end-to-end uitgevoerd.

## Bronnen, gecontroleerd 27 oktober 2026

- https://www.kvk.nl/deponeren/jaarrekening-wel-of-niet-deponeren/
- https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/btw_aftrekken/welke_btw_is_aftrekbaar/welke_btw_mag_u_aftrekken
- https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/btw_aangifte_doen_en_betalen/bereken_het_bedrag/hoe_berekent_u_het_btw_bedrag/factuurstelsel
- https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/inkomstenbelasting_voor_ondernemers/afschrijving/hoe_berekent_u_het_bedrag_van_de_afschrijving

De gegeven boekingskeuzes, bedragen, afschrijvingsduur en vereenvoudigingen zijn expliciete oefenfeiten. Voor echt cliëntwerk moeten omstandigheden en actuele regels afzonderlijk beoordeeld worden.

## Verificatie

`tests/bookkeeping-practice-smoke.js` toetst beide complete correctiesets, balansaansluitingen, bankmatching, invoergrenzen, AI-parser, veilige notities, afzonderlijke cases en behoud van bestaande werkboekgegevens. JavaScript-syntax gecontroleerd. Een lokale browsercontrole kon niet starten doordat de browserbinary ontbreekt; geen browser geïnstalleerd. Visuele/iPhone-QA en live ingelogde cross-device-sync blijven open.
