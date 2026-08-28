# Park 2.0 — optie D assets

De eerste vijf originele character-assets zijn op 26 augustus 2026 door **ChatGPT / OpenAI Image Generation** gemaakt nadat Joey optie D ("evolueerbare game companions") koos. Op 27 augustus 2026 zijn door ChatGPT drie nieuwe Daily Mission-companions toegevoegd: Sleep, 10k Steps en Meditation.

Vaste ontwerpregels:

- de skill moet direct uit het lichaam en silhouet leesbaar zijn;
- premium, gedetailleerde 3D-filmkwaliteit, maar geen kopie van een bestaand franchise-character;
- speels en expressief, niet babyachtig;
- losse ledematen en duidelijk silhouet voor webanimatie;
- goudaccenten en dezelfde ogen verbinden de familie;
- iedere companion moet later zichtbaar kunnen evolueren van level 1 naar 100.

Bestanden:

- `ai-tools.png` — terminal/robot, technologie en coding;
- `tennis.png` — tennisbal-lichaam en racket;
- `piano.png` — het lichaam **is** een herkenbare vleugel, niet alleen pianokleding;
- `good-deed.png` — lichtgevend hart met beschermende handvormen;
- `budgeting.png` — calculator, geordende munten en groeispruit.
- `sleep.png` — maan-/wolkencompanion met sterrenkussen en slaapmuts;
- `walking.png` — energieke routeverkenner met kompas, stappenteller en wandelschoenen;
- `meditation.png` — amethist-lotuscompanion met mediterende houding en gouden halo.

De assets zijn transparante, tot maximaal 640 px verkleinde PNG's. De originele generaties blijven buiten de repository in de lokale Codex generated-images-map. Bewerk of vervang deze bestanden alleen als Joey een nieuwe karakterrichting kiest.

## Evolutiesysteem — engine gebouwd, assets in productie

Joey heeft expliciet bevestigd dat visuele evolutie een kernfunctie is. Park 2.0 laadt sinds v11.3 automatisch de juiste vorm uit een submap en valt veilig terug op het basisbestand wanneer een specifieke vorm nog niet is geproduceerd:

```text
img/lab/park2/
  ai_tools/starter.png ... mastery.png
  tennis/starter.png ... mastery.png
  piano/starter.png ... mastery.png
  good_deed/starter.png ... mastery.png
  budgeting/starter.png ... mastery.png
  sleep/starter.png ... mastery.png
  walking/starter.png ... mastery.png
  meditation/starter.png ... mastery.png
```

Gewone skills gebruiken leveldrempels 1 / 10 / 25 / 50 / 75, met een extra prestige-effect op level 100. Habits gebruiken hun echte persistente score via de banden 0-2 / 3-4 / 5-6 / 7-8 / 9-10 en mogen visueel terugvallen als de score daalt. Zie `GAMENFY-MASTER.md` voor het volledige evolutiecontract.

Huidige echte vormassets:

- `sleep/advanced.png` — echte middenvorm met compact sterrenorbit, korte droomcape, crescent-sluiting en zwaardere wolkenlaarzen;
- `sleep/mastery.png` — zichtbare celestial guardian-evolutie met grotere anatomie, wolken-/constellatiecape, maankroon en uitgebreid herstelrelic.
- `meditation/advanced.png` — echte middenvorm met extra lotuspetalen, groter kernkristal, verfijnde armbanden en drie beheerste kristallichten;
- `meditation/mastery.png` — zichtbare lotus guardian-evolutie met volwassen anatomie, beschermende kristalpetalen, meervoudige halo en beheerste kristalorbit.
- `walking/advanced.png` — echte middenvorm met verbeterde trailboots, routekaart, grotere rugzak en uitgebreidere stappenteller;
- `walking/mastery.png` — eindvorm als legendarische routeverkenner met expeditierugzak, vijfbladige crest, master-kompas en voltooide-route-aura.

Afgekeurde renders met een ingebakken achtergrond/checkerboard zijn bewust **niet** in de repository opgenomen. Meditation Advanced is na een aparte background-extraction technisch opnieuw gecontroleerd op echte alpha. Ontbrekende vormen blijven eerlijk als open art-productie gelden; de engine gebruikt dan het basisbeeld met een bescheiden vorm-aura, maar doet niet alsof dat al een volledig nieuwe anatomische asset is.

Promptfamilie nieuwe companions en evoluties: premium transparante 3D game-companion, direct leesbaar skill-silhouet, grote expressieve ogen, echte losse armen/benen voor webbeweging, goudaccenten, dezelfde identiteit tussen vormen, geen tekst/logo/scenery en consistent met de bestaande Good Deed/Budgeting/Tennis-familie. Gegenereerd met de ingebouwde **OpenAI Image Generation**-tool; selectie, transparantiecontrole, verkleining en integratie zijn uitgevoerd door **ChatGPT (OpenAI)**.
