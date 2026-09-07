# Website Ventures — Operations Handoff

Performed-by: ChatGPT (OpenAI)

## Active operational surfaces

- `ventures-sales-v2.html` — active first-ten sales cockpit.
  - local state key: `rpg_venture_sales_v1`
  - isolated cloud app-state: `venture_sales`
  - intentionally does **not** load `xp.js`, so it cannot start the broad RPG sync scope.
- `website-ventures-delivery-os.html` — intake, delivery, QA, hours and launch gate for founding customers 1–10.
  - local state key: `venture_delivery_v1`
  - isolated cloud app-state: `venture_delivery`
- `website-ventures-prospect-lab.html` — research only; no implied outreach.
- `website-ventures-chatgpt-lab.html` — hypotheses only; not a source of proven customer facts.
- `website-ventures-visual-vault.html` — asset-production inventory and still-before-motion gate.

## Founding workflow

1. Research candidates in Prospect Lab.
2. A prospect only enters Sales Machine after a real decision to treat it as active outreach/pipeline work.
3. Sales Machine records actual attempts, conversations, demos, proposals and wins.
4. A win moves operationally to Delivery OS.
5. Build is gated on complete intake.
6. Founding scope remains max 3 core pages + one bundled revision round unless separately priced.
7. QA is mandatory before launch; fake proof is never acceptable.
8. Record real production hours. Students/salespeople/province scaling remain blocked until delivery and sales are repeatable.

## Current commercial hypothesis — not proven fact

- customers 1–3: €995 setup + €49/month
- leading wedge: plumbing / installations
- production goal after complete intake: ≤6 hours
- evidence gates: 30 meaningful owner contacts, 10 demos, 3 paid customers

## Critical guardrails

- No automatic prospect outreach from Lab pages.
- No fake reviews, certifications, client work or team claims.
- No autonomous paid Higgsfield/video credit spend.
- Accepted Website Lab variants stay additive; do not overwrite history.
- Sales and Delivery cloud channels stay isolated from the broad `rpg` app-state.
