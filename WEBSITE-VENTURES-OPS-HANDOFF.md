# Website Ventures — Operations Handoff

Performed-by: ChatGPT (OpenAI)

## READ FIRST — active priority override (2026-09-07)

`INCOME-HANDOFF-2026-09-07.md` is the current cross-project commercial handoff and supersedes older priority assumptions in this file.

1. Website Ventures remains priority #1 / near-term income engine.
2. **Joey's own agency/showroom website is P0 and must be built before further Plumbing polish.**
3. Plumbing remains the first commercial niche/customer system and becomes the first major showcase inside the agency site.
4. Active paid-production planning source is now `WEBSITE-VENTURES-PRODUCTION-LINE-V3.json`.
5. `WEBSITE-VENTURES-PRODUCTION-LINE-V2.json` is retained as useful planning history, but its detailed Plumbing scene list and broad Gamenfy park/object queue are **concepts, not approved production requirements**.
6. Gamenfy production is reduced to one approved-character animation technology pilot before any broad object/park/skill batching.
7. Internal production prompts, registries and playbooks are competitive IP; public sites may show outputs/capabilities but not the factory.

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
- `site-agency-showroom-v0.html` — current Lab prototype for Joey's own P0 agency/showroom site. Brand name, headline, exact offer, final price and visual art direction remain prototype choices.
- `WEBSITE-VENTURES-PRODUCTION-LINE-V3.json` — active planning source for agency P0, Plumbing showcase and the bounded Gamenfy animation pilot.
- `website-ventures-production-line-v2.html` / `WEBSITE-VENTURES-PRODUCTION-LINE-V2.json` — archived/secondary planning reference only until reconciled with v3.
- `HIGGSFIELD-ELEMENTS-REGISTRY.json` — planned reusable Higgsfield characters/environments/props. Elements are created only after their source reference is approved.

## Active production sequence — v3

Every paid image/video generation must have, before spend:

1. stable asset ID;
2. exact website/app destination;
3. exact crop/aspect/use state;
4. approved dependency/reference state;
5. bounded variant count;
6. explicit rejection/approval gate;
7. clear follow-up step (integration, consistency test, Element, sprite, motion or Vault).

### P0A — Agency showroom

First prove the agency site in code before generating visuals:

- narrative and section jobs;
- premium spacing/type/system;
- first-scroll interaction payoff;
- Plumbing showcase frame;
- interactive transformation demo;
- reusable premium interaction R&D slot;
- offer/starting-price slot;
- real-proof-only credibility slot;
- mobile behavior for every wow interaction.

External visuals are generated only after these slots/crops are locked.

### P0B — Plumbing showcase/customer system

Fixed principles:

- one strong recurring technician;
- authentic Dutch tradesperson, not fashion-model styling;
- website shell may feel extremely premium;
- real customer/project proof remains real;
- template/system reusability is mandatory.

Older concepts such as leaking-bathroom hero, white/deep-red/chrome/water palette, service van, tool pack, contact bridge and arrival/inspection/repair/handover sequence are **proposals only** until reviewed against the agency showcase slot.

### P0C — Gamenfy animation technology pilot

Park 3.1 already contains 13 native evolution sets × 10 levels = **130 WebPs**. Do not regenerate those by default.

Use one existing approved character and test only:

1. real walk cycle — legs/arms genuinely change frame by frame;
2. natural idle cycle;
3. jump / expressive movement;
4. one character + prop/FX interaction;
5. only after Joey defines the Home feeling/world: one environment concept.

AutoSprite is the first bounded technology test. If results still feel like a sliding/morphing cutout, stop broad animation spend and prototype a rigged 2D architecture (Rive/Spine-style limb/joint system) before producing more animations.

Deferred/P2: full park object family, 11 Daily Mission prop batch, skill-specific packs, new skill characters, chess/piano/book/weights/whistle/tennis packs.

## Cloud-state architecture

Sales and Delivery deliberately do not share the broad `rpg` row. Each page waits for Auth, derives its app-state key from `window.gamenfyUserId`, and calls the shared CAS sync with only its own local storage key. The database RPC `public.gamenfy_write_app_state` accepts the Venture key only when its suffix exactly equals the current `auth.uid()`. This preserves the existing global `app_state.key` primary-key compatibility while avoiding collisions between accounts.

## Explicit handoff boundaries

These boundaries are intentional and must not be replaced by silent automation:

1. **Prospect Lab → Sales Machine:** only after an explicit click/action. Imported research remains `Prospect`; no funnel evidence is fabricated.
2. **Sales Machine → Delivery OS:** only records explicitly marked `Gewonnen` may be imported. They begin `Waiting intake`.
3. **Delivery intake/QA:** importing a win never checks intake or QA items. Completion must reflect real supplied information/testing.
4. **Client communication:** Delivery may prepare/copy an intake request, but no page sends it automatically.

## Founding workflow

1. Finish the agency/showroom proof layer enough to confidently demonstrate capability.
2. Keep Plumbing as the first major showroom demo and reusable customer system.
3. Research candidates in Almere first; Bussum is a practical secondary geography.
4. Explicitly load/select candidates into Sales while preserving `Prospect` status.
5. Record actual attempts, conversations, demos, proposals and wins in Sales Machine.
6. Explicitly import only `Gewonnen` clients to Delivery OS.
7. Build is gated on complete intake.
8. QA is mandatory before launch; fake proof is never acceptable.
9. Record real production + communication + revision + domain-handoff time before claiming ultra-fast fulfilment.
10. Students/salespeople/province scaling remain blocked until delivery and sales are repeatable.

## Current commercial hypotheses — not proven facts

- first niche: plumbing / trades / handyman;
- starting geography: Almere, optionally Bussum;
- founding-price working hypothesis: **€349** for early proof customers;
- later regular-price working hypothesis: **€499–€699** once delivery/system is proven;
- possible Website Control Session add-on: ~**€59**;
- customer remains owner of domain; Joey may manage DNS/hosting/domain operations for them;
- exact hosting/maintenance, revision boundaries, scope and fulfilment flow remain open and must be locked before public commercial launch.

## Acquisition guardrails

- Do not rely on illegal cold calling or generic spam.
- Prioritize active buyer-intent platforms, referrals, warm/local contacts and legally compliant outreach experiments that fit around Joey's full-time job.
- Do not fabricate contact outcomes, demos or interest.

## Critical guardrails

- No automatic prospect outreach from Lab pages.
- No fake reviews, certifications, client work, team claims or measured outcomes.
- No autonomous paid Higgsfield/video credit spend.
- Accepted Website Lab variants stay additive; do not overwrite history.
- Sales and Delivery cloud channels stay isolated from the broad `rpg` app-state.
- Approved Park 3.1 Daily Mission evolution art is preserved.
- Agency public launch must not expose internal prompts, production manifests, registries or backend process; reassess repo/backend exposure before commercial launch.
