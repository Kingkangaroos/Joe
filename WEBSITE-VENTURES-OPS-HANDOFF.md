# Website Ventures — Operations Handoff

Performed-by: ChatGPT (OpenAI)

## Active operational surfaces

- `ventures-sales-v2.html` — active first-ten sales cockpit.
  - local state key: `rpg_venture_sales_v1`
  - isolated cloud app-state: `venture_sales:<authenticated-user-id>`
  - intentionally does **not** load `xp.js`, so it cannot start the broad RPG sync scope.
- `website-ventures-delivery-os.html` — intake, delivery, QA, hours and launch gate for founding customers 1–10.
  - local state key: `venture_delivery_v1`
  - isolated cloud app-state: `venture_delivery:<authenticated-user-id>`
- `website-ventures-prospect-lab.html` — research only; no implied outreach.
- `website-ventures-chatgpt-lab.html` — hypotheses only; not a source of proven customer facts.
- `website-ventures-visual-vault.html` — asset-production inventory and still-before-motion gate.
- `website-ventures-production-line-v2.html` — detailed visual production factory for Website Ventures **and** Gamenfy reusable objects/animation assets.
  - data source: `WEBSITE-VENTURES-PRODUCTION-LINE-V2.json`
  - includes exact asset IDs, models/workflows, formats, variants, dependencies, acceptance gates, sprint order and stop conditions.
- `HIGGSFIELD-ELEMENTS-REGISTRY.json` — planned reusable Higgsfield characters/environments/props. Elements are created only after their source reference is approved.

## Production Line v2 — source-of-truth rule

The old HQ `visualProduction` queue remains a high-level summary. The detailed paid-production specification is now `WEBSITE-VENTURES-PRODUCTION-LINE-V2.json`.

Every paid image/video generation must have, before spend:

1. stable asset ID;
2. exact website/app destination;
3. reference/dependency state;
4. chosen draft/master model or deterministic alternative;
5. required aspect/transparent/sprite output;
6. bounded variant count;
7. explicit rejection/approval gate;
8. follow-up step (Element, sprite, motion, integration or Vault).

### Website Ventures production focus

- First lock `PL-CHAR-001`, `PL-STYLE-001`, the service van and tool props.
- Then make the Premium Plumbing story sell as **stills** before motion.
- Create reusable Elements only from approved master references.
- Motion is last and only for stills that already score high enough.
- Real customer/project proof is never AI-generated as proof.

### Gamenfy production focus

Park 3.1 already contains 13 native evolution sets × 10 levels = **130 WebPs**. Do not spend Higgsfield credits recreating those by default.

New production spend should target reusable layers:

- park environments and transparent props;
- Daily Score walker system;
- AutoSprite idle/walk/run/custom sprite sheets from approved characters;
- Daily Mission interaction props;
- private-quest FX kept on personal/PIN surfaces;
- skill props such as tennis, chess, reading, strength and piano;
- reusable effects such as level-up/confetti, dust, water/ice, fire and sound waves.

Prefer transparent PNG/WebP + sprite sheets + CSS/JS layering over baking whole Gamenfy scenes into video. Video is reserved for rare cases where it genuinely adds more than a sprite/CSS loop.

## Cloud-state architecture

Sales and Delivery deliberately do not share the broad `rpg` row. Each page waits for Auth, derives its app-state key from `window.gamenfyUserId`, and calls the shared CAS sync with only its own local storage key. The database RPC `public.gamenfy_write_app_state` accepts the Venture key only when its suffix exactly equals the current `auth.uid()`. This preserves the existing global `app_state.key` primary-key compatibility while avoiding collisions between accounts.

## Explicit handoff boundaries

These boundaries are intentional and must not be replaced by silent automation:

1. **Prospect Lab → Sales Machine:** only after an explicit click/action. Wave 01 may fill empty Sales slots, but every imported company remains `Prospect`. Importing research must not increment attempts, conversations, demos, proposals or wins.
2. **Sales Machine → Delivery OS:** only Sales records explicitly marked `Gewonnen` may be imported. They may fill empty Delivery slots only and begin as `Waiting intake`.
3. **Delivery intake/QA:** importing a win never checks intake or QA items. Completion must reflect real supplied information and real testing.
4. **Client communication:** Delivery may prepare/copy an intake request, but no page sends it automatically.

## Founding workflow

1. Research candidates in Prospect Lab.
2. Explicitly load/select candidates into Sales while preserving `Prospect` status.
3. Record actual attempts, conversations, demos, proposals and wins in Sales Machine.
4. Explicitly import only `Gewonnen` clients to Delivery OS.
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
- Approved Park 3.1 Daily Mission evolution art is preserved; new Gamenfy production should add reusable interaction/object layers rather than silently reinterpret membership or replace approved assets.
