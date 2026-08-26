---
name: gamenfy-ga-verder
description: Use when Joey says "ga verder", "go ahead", or similar with no other specific instruction in a Gamenfy session. Defines the fixed order: check the Joey-to-do list in the master doc, and only if empty, run a full functionality review.
---

# Gamenfy — "ga verder" protocol

Vastgelegd op Joey's verzoek (24-08-2026), gecorrigeerd diezelfde sessie (Joey wil niet in Notion werken — alles blijft in de app/repo). Volg deze volgorde altijd:

## 1. Check de 🧑 Joey to-do sectie in GAMENFY-MASTER.md
Lees `GAMENFY-MASTER.md` §7 "Open items" → de "🧑 Joey to-do"-lijst.
- Dit zijn dingen die WACHTEN op Joey's input/actie, niet dingen die Claude zelfstandig kan bouwen.
- Check of er intussen antwoord is gekomen (in het gesprek, of impliciet doordat de situatie is veranderd — bv. Fitbit weer gekoppeld). Zo ja: verwerk dat.
- Staat er nog iets open zonder dat Joey het net heeft beantwoord: noem het kort, vraag niet opnieuw hetzelfde — hij weet dat het openstaat.

## 2. Alleen als 1 leeg/klaar is: volledige functionaliteitsreview
Doe dan wat Joey omschreef als "een soort testversie voor jezelf uitvoert":
- Loop de kernflows na tegen de live Supabase-data (niet alleen syntax-check): sync, habit-decay, auto-check, level-berekening, Fitbit-pijplijn.
- Zoek zelf naar afwijkingen tussen wat de code doet en wat de data laat zien — niet aannemen dat het werkt omdat het ooit gefixt is.
- Rapporteer kort: wat gecontroleerd is, wat klopte, wat niet.

## Wat dit NIET is
Geen vervanging voor een normaal, specifiek verzoek — als Joey een concrete vraag stelt, behandel die gewoon direct. Dit protocol geldt alleen voor het generieke "ga verder"/"go ahead" zonder verdere context.
