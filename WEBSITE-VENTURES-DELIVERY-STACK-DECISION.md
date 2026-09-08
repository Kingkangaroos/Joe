# Website Ventures — Delivery Stack Decision Gate

**Updated: 2026-09-08 · ChatGPT (OpenAI)**

Question: should Website Ventures keep shipping its current fast static/config-driven site system, or add WordPress delivery because active buyers often ask for it?

## Current answer

**Do not rebuild the production line in WordPress now. Keep the current static/config-driven master as P0. Treat WordPress as an evidence-gated commercial compatibility layer, not a new default.**

Why:
- the current Plumbing master, Client Factory, Selected Assets gate and QA system already exist;
- rebuilding before a paying customer asks for it would duplicate a proven technical system with an unproven second stack;
- WordPress can materially increase plugin/update/security/support burden;
- Website Ventures' core advantage is fast, controlled, highly reusable production;
- however, marketplace demand shows that explicit CMS/WordPress requirements are common enough to measure seriously.

## Fresh marketplace evidence, 2026-09-08

### Strong niche-fit but stack mismatch

Freelancer.nl currently lists an **OPEN** project for a company specialized in:
- kelderafdichting;
- vochtbestrijding;
- kelderlekkage.

That is extremely close to the first Plumbing/trades positioning. Their requested site is also conceptually close to our product: professional, modern, mobile-friendly, trust/vakmanschap, services, projects/references, contact/offerte, click-to-call, WhatsApp and maps.

But the request explicitly requires **WordPress**, simple self-editing and installation on hosting/domain.

Source checked 2026-09-08:
https://freelancer.nl/opdrachten/valkenswaard/website-wordpress-webdesign/nieuwe-wordpress-website-laten-maken-d82547f1

### Other marketplace signals

Recent/visible marketplace inventory also includes:
- explicit WordPress website requests;
- Webflow requests;
- Shopify/WooCommerce webshop requests;
- app/platform work;
- simple sites where tech stack matters less.

This means active-buyer marketplaces contain demand, but **not all inventory is compatible with the current Website Ventures product**.

## Product principle

Do not let a platform dictate the entire architecture.

The base Website Ventures product should be sold on outcome:
- premium presentation;
- fast/mobile;
- real business proof;
- contact/conversion;
- customer-owned domain;
- bounded updates/support.

The implementation stack should only become a sales promise when the customer actually needs a specific stack.

## Three delivery modes to consider

### Mode A — Static/config-driven Website Ventures site

Current P0/default.

Strengths:
- fastest production path;
- maximum design/code control;
- very low runtime complexity;
- template/config reuse already built;
- excellent performance potential;
- no WordPress/plugin update burden;
- easy to automate safely.

Weaknesses:
- some buyers explicitly demand WordPress/CMS;
- self-editing is less familiar to customers unless we provide a simple editing layer;
- hosting/handoff model must be deliberately designed.

### Mode B — Static site + simple customer content editor

Potential future middle ground.

Concept:
- keep the actual high-performance Website Ventures frontend;
- expose only safe client-editable content such as services, contact data, photos and selected copy through a controlled editor/config UI;
- customer does not need to touch HTML/GitHub.

This could preserve the production advantage while solving much of the “I want WordPress because I want to edit text” objection.

Do not build it until real customer conversations confirm self-editing is a frequent objection.

### Mode C — WordPress-compatible delivery

Future compatibility layer only if demand proves it.

Possible forms later:
- recreate a proven Website Ventures design as a lightweight custom WordPress theme;
- use block-editor fields only for bounded content areas;
- avoid page-builder chaos as the production default;
- define exactly who owns plugin/theme maintenance and security;
- price support burden separately.

Do not attempt to auto-convert every vanilla interaction into WordPress before there is revenue evidence.

## Evidence gate

Track the first **20 serious buyer opportunities** in `website-ventures-acquisition-tracker.html`.

For each opportunity add/record in notes:
- specific stack required: none / WordPress / Webflow / Shopify / other;
- is stack actually required, or merely familiar wording from the buyer?;
- would a simple customer editing interface satisfy the underlying need?;
- did stack mismatch kill an otherwise strong-fit sale?

### Trigger a WordPress pilot only when one of these becomes true

1. **3 strong-fit opportunities are lost specifically because WordPress is mandatory**, or
2. at least **40% of the first 20 serious high-fit opportunities** require WordPress, or
3. a high-value paying customer explicitly funds the compatibility work.

Then build **one bounded WordPress pilot**, not a second sprawling production line.

## Pricing implication

A stack requirement that increases maintenance/support is not automatically included in the €349 founding product.

If WordPress adds:
- setup;
- migration;
- plugins;
- updates;
- security;
- backups;
- customer support;

then it must be reflected in scope and economics.

Use `website-ventures-unit-economics.html` rather than absorbing the burden because “clients expect WordPress.”

## Current operational rule

For now:

**Sell the outcome, keep static/config-driven P0, track stack objections, and only build WordPress when evidence crosses the explicit gate.**
