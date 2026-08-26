# Park 2.0 — optie D assets

Deze vijf originele character-assets zijn op 26 augustus 2026 door **ChatGPT / OpenAI Image Generation** gemaakt nadat Joey optie D ("evolueerbare game companions") koos.

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

De assets zijn transparante, tot maximaal 640 px verkleinde PNG's. De originele generaties blijven buiten de repository in de lokale Codex generated-images-map. Bewerk of vervang deze bestanden alleen als Joey een nieuwe karakterrichting kiest.

## Verplicht vervolg: echte evoluties

Deze vijf bestanden zijn alleen de huidige basisvormen. Joey heeft expliciet bevestigd dat visuele evolutie een kernfunctie is. De geplande structuur wordt:

```text
img/lab/park2/
  ai_tools/starter.png ... mastery.png
  tennis/starter.png ... mastery.png
  piano/starter.png ... mastery.png
  good_deed/starter.png ... mastery.png
  budgeting/starter.png ... mastery.png
```

Dat zijn 25 consistente master-assets. Gewone skills gebruiken leveldrempels 1 / 10 / 25 / 50 / 75, met een extra prestige-effect op level 100. Habits gebruiken scorebanden 0-2 / 3-4 / 5-6 / 7-8 / 9-10 en mogen visueel terugvallen als de score daalt. Zie `GAMENFY-MASTER.md` voor het volledige evolutiecontract.
