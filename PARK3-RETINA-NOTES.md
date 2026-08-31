# Park 3.0 — Retina asset pass (Claude, branch `claude/park3-retina-assets`)

## Oorzaak van de wazigheid — bevestigd, niet aangenomen

De live atlas (`img/lab/park3/atlas/part-*.txt`, base64-WebP) is in totaal **550×1063px** voor een 10×11-raster van 110 frames. Per frame is dat **55×96 pixels**. De grootste weergavecontext in de app (`.p3-focus-art{width:min(190px,58vw)}`) toont dit op een 3x-Retina-iPhone op 570 apparaatpixels breed — een uitrekking van ruim **10x**. Dát is de oorzaak, niet een compressie-instelling.

## Waarom niet gewoon een betere atlas

Er bleken al drie eerdere verbeterpogingen in de geschiedenis te staan (`atlas-hd`, `atlas-sharp`, `atlas-crisp`). Alle drie zijn **corrupte AVIF-bestanden** — onafhankelijk bevestigd met zowel Pillow als ffmpeg/libavif ("Decode error rate 1 exceeds maximum"). Dit is vermoedelijk exact de eerdere "zwarte vlakken op iPhone"-fout die al in de vorige code-commentaar stond genoemd. Geen van de drie was bruikbaar.

## Wat wél is gedaan

De 110 frames zijn uit de **enige betrouwbare bron** (de live WebP-atlas) uitgesneden en met kwalitatief hoogwaardige Lanczos-resampling opnieuw geëxporteerd als **11 losse, statische WebP-bestanden** — één per missie, elk een horizontale strip van de 10 levels (1100×192px totaal, 110×192px per frame). Dit is 2x de oorspronkelijke pixeldichtheid.

**Waarom niet hoger dan 2x**: Lanczos-resampling voegt geen echte, nieuwe beelddetail toe voorbij wat in de 55×96-bron al aanwezig is. Verder opschalen (3x, 4x) zou dezelfde vaagheid zijn, alleen met meer bytes — geen eerlijke verbetering. 2x is het punt waarop de kwaliteitswinst nog reëel is.

**Eerlijke beperking**: dit is een aanzienlijke, zichtbare verbetering (zelf visueel vergeleken, minder blokkerige randen/details), maar geen "perfecte" native Retina-scherpte — die zou alleen te bereiken zijn met de originele, ongecomprimeerde brongrafiek, die niet beschikbaar is. Ik heb geen nieuwe kunst gegenereerd of het ontwerp aangepast — uitsluitend opnieuw geëxporteerd vanuit exact dezelfde goedgekeurde pixels.

## Architectuurwijziging, en waarom die zelfstandig al helpt

Naast de resolutie is ook het **laadmechanisme** vervangen: van "13 tekstbestanden ophalen → samenvoegen → base64 decoderen → Blob → Object-URL, bij elke paginabezoek opnieuw" naar **11 gewone statische bestanden**, geladen via normale `<img>`-preload. Voordelen los van de resolutiewinst:
- Echte browser-caching (Cache-Control/ETag) in plaats van elke keer opnieuw decoderen.
- Eén kapot bestand raakt nu alleen die ene missie-kaart (`.p3-art-broken`-status), niet het hele scherm — voorheen deelden alle 110 frames één storingspunt.
- Geen JS-side atob/Blob-overhead meer bij elke paginalaad.

## Wat bewust ongewijzigd is

- Karakterontwerpen, evolutie-identiteiten, en de exacte 11×10-toewijzing.
- `rpg_habits_v1`, `rpg_habitlog_v1`, `getHabits()`, `getSkillLevel()`, `recomputeHabitFromLog()` — geen regel aangeraakt.
- Level-0-regel: score 0 toont nog steeds Level-1-kunst met het "kritiek"-label; de numerieke badge blijft L0.
- Privé-labeling: `no_porn` toont nog steeds "Discipline" in de UI.
- Park 2.0, Main, en Supabase-sync: volledig buiten scope, niet aangeraakt (bevestigd via `git status`).

## Bestandsgrootte

11 bestanden, 512 KB totaal (was 152 KB als tekst-atlas). Grotere transfer bij de allereerste load, maar door echte bestands-caching en het wegvallen van de decodeeroverhead naar verwachting een gelijk of beter gevoel van snelheid bij een volgend bezoek — dit is niet in een echte browser op een iPhone getest, alleen gevalideerd op de brongegevens, syntax en logica.
