---
name: gamenfy-ga-verder
description: Use when Joey says "ga verder", "go ahead", or similar with no other specific instruction in a Gamenfy session. Defines the fixed order: check his Notion ideas-inbox first, then the Joey-to-do list in the master doc, and only if both are empty, run a full functionality review.
---

# Gamenfy — "ga verder" protocol

Vastgelegd op Joey's verzoek (24-08-2026): hij wil niet dat "ga verder" telkens anders wordt opgevat. Volg deze volgorde altijd, in deze exacte stappen:

## 1. Check Joey's Notion-ideeën-inbox eerst
Pagina: "🧠 Gamenfy — Ideeën & to-do voor Claudia" (zoek via `Notion:notion-search`, query "Gamenfy Ideeën to-do Claudia").
- Lees de sectie "📥 Nieuw — nog niet gelezen door Claudia".
- Staat daar iets: dat heeft voorrang boven alles hieronder. Werk het uit, bouw wat gebouwd moet worden.
- Verplaats verwerkte items naar "✅ Opgepakt / verwerkt" met een korte notitie wat je ermee deed (gebruik `Notion:notion-update-page` of herschrijf de pagina-inhoud).
- Is iets vaag of een groter idee zonder duidelijke scope: bouw niet blind — vat je begrip kort samen en vraag om bevestiging, net als bij een normaal verzoek.

## 2. Dan pas: 🧑 Joey to-do sectie in GAMENFY-MASTER.md
Als de Notion-inbox leeg is: lees `GAMENFY-MASTER.md` §7 "Open items" → de "🧑 Joey to-do"-lijst.
- Dit zijn dingen die WACHTEN op Joey's input/actie, niet dingen die Claude zelfstandig kan bouwen.
- Check of er intussen antwoord is gekomen (in het gesprek, of impliciet doordat de situatie is veranderd — bv. Fitbit weer gekoppeld). Zo ja: verwerk dat.
- Staat er nog iets open zonder dat Joey het net heeft beantwoord: noem het kort, vraag niet opnieuw hetzelfde — hij weet dat het openstaat.

## 3. Alleen als 1 én 2 leeg/klaar zijn: volledige functionaliteitsreview
Doe dan wat Joey omschreef als "een soort testversie voor jezelf uitvoert":
- Loop de kernflows na tegen de live Supabase-data (niet alleen syntax-check): sync, habit-decay, auto-check, level-berekening, Fitbit-pijplijn.
- Zoek zelf naar afwijkingen tussen wat de code doet en wat de data laat zien — niet aannemen dat het werkt omdat het ooit gefixt is.
- Rapporteer kort: wat gecontroleerd is, wat klopte, wat niet.

## Wat dit NIET is
Geen vervanging voor een normaal, specifiek verzoek — als Joey een concrete vraag stelt, behandel die gewoon direct. Dit protocol geldt alleen voor het generieke "ga verder"/"go ahead" zonder verdere context.
