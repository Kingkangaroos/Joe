# Website Ventures — READ ME NOW

**Current checkpoint: 2026-09-08 · ChatGPT (OpenAI)**

If another chat/builder needs the current Website Ventures state, **read this file first**, then use `WEBSITE-VENTURES-HQ.md` / `WEBSITE-VENTURES-HQ-STATE.json` for deeper context.

## CURRENT PRIORITY

1. **Website Ventures remains income priority #1.**
2. **Joey's own Agency Showroom remains the first visual/technical flagship.**
3. Higgsfield **Batch 5 is still the next manual visual step**: three 2K desktop agency hero concepts → choose one → deliberate 4:5 mobile derivative from that exact winner.
4. Batch 6 then selects **one recurring Plumbing technician**.
5. Batch 7 creates only the three currently-needed same-technician working scenes.
6. Batch 8 remains optional / skip-by-default.
7. Batch 9 is 4K finish only after actual winners exist.

No new paid Higgsfield generation was started by ChatGPT during the operational/commercial buildout below.

## ONE PRIMARY INTERNAL ENTRY POINT

- `website-ventures-ops.html` = **Operator Hub**

It now links:
- visual generation/review/Selected Assets;
- full client production street;
- commercial readiness;
- unit economics;
- opportunity scoring;
- First 10 acquisition tracker;
- pricing market snapshot;
- static vs WordPress evidence gate;
- hosting/domain and security boundaries.

`ventures-workspace.html` in Finance → Ventures now points centrally to the Operator Hub and forces `ventures.js?v=11.5` so stale quest copy should not remain cached.

## ACTIVE VISUAL PIPELINE

- Queue: `website-ventures-higgsfield-prompt-board.html`
- Source JSON: `WEBSITE-VENTURES-HIGGSFIELD-QUEUE.json`
- Review: `website-ventures-higgsfield-review.html`
- Selected/live gate: `website-ventures-selected-assets.html`
- Registry: `WEBSITE-VENTURES-SELECTED-ASSETS.json`
- Loader: `website-ventures-selected-assets.js`
- Production Line: `website-ventures-production-line-v3.html` / `WEBSITE-VENTURES-PRODUCTION-LINE-V3.json`

Rule:

**generate/import → review → selected registry → real page → desktop/mobile QA**

A local review checkbox never publishes media by itself.

## AGENCY SHOWROOM

Page:
- `site-agency-showroom-v0.html`

Already contains three code-first capability proofs:
1. sticky scroll storytelling with desktop + mobile showcase slots;
2. touch/mouse/keyboard before↔premium comparison slider;
3. pointer-responsive reusable interaction experiment.

Rules:
- do not add more visual gimmicks just to increase feature count;
- hero has separate selected-asset slots for desktop and mobile;
- real proof stays empty until real evidence exists;
- current brand/headline/pricing copy remains prototype/hypothesis until explicitly locked.

## PLUMBING PRODUCT — CONFIG DRIVEN

Master:
- `site-plumbing-flagship-v1.html`

System:
- `website-ventures-client-config.js`
- `website-ventures-plumbing-template.js`
- `WEBSITE-VENTURES-CLIENT-CONFIG-SCHEMA.json`
- repo configs: `website-ventures-client-configs/<slug>.json`

Current behavior:
- one coded master;
- customer identity/copy/contact/services/theme come from config;
- local preview uses `?wvlocal=1`;
- missing/broken config keeps safe hardcoded fallback;
- client config never auto-approves generated Selected Assets;
- `plumbing-qa-blue` is only a technical QA fixture, not a brand/product direction.

## CLIENT PRODUCTION STREET

The current operational flow is:

**Client Intake → Offer Draft → Client Factory → real assets/proof → Selected Assets → Fulfilment Run → desktop/mobile QA → Delivery Gate → commercial domain/hosting → launch → Customer Handoff.**

### 1. Intake + Scope
- `website-ventures-client-intake.html`
- `WEBSITE-VENTURES-CLIENT-INTAKE-SCHEMA.json`

Captures client facts, CTA, services, domain/hosting state, proof/assets, template, revision rounds and explicit included/excluded scope.

One revision round is currently only a working default, not final commercial terms.

### 2. Offer Builder
- `website-ventures-offer-builder.html`
- `WEBSITE-VENTURES-OFFER-DRAFT-V1.json`

Reads latest intake and creates customer-friendly proposal copy.

Important:
- €349 defaults only as founding-price hypothesis;
- Website Control Session around €59 is optional/hypothesis;
- no fixed ultra-fast delivery promise yet;
- not a legal contract or invoice.

### 3. Client Factory v2
- `website-ventures-client-factory.html`

Important fix:
- Intake-created client drafts now open automatically;
- AUREL no longer silently overwrites the customer draft;
- AUREL is only an explicit baseline;
- customer config stays local until deliberately copied/committed.

### 4. Fulfilment Run
- `website-ventures-fulfilment-run.html`

Measures customer 1–10 active production minutes and blockers. Do not guess fulfilment time from template theory.

### 5. Delivery Gate + Change Requests
- `website-ventures-delivery-gate.html`
- `WEBSITE-VENTURES-DELIVERY-GATE-V1.json`

Checks intake, scope, config, proof, CTA, desktop QA, ~390px mobile QA, selected assets/fallback, domain ownership, commercial hosting, DNS/HTTPS and handoff.

Also records out-of-scope requests, estimated extra minutes, price impact and decision/reason.

### 6. Customer Handoff
- `website-ventures-customer-handoff.html`
- `WEBSITE-VENTURES-CUSTOMER-HANDOFF-V1.json`

Produces a handoff summary for URL, ownership, hosting, scope, revisions, support and future changes.

## COMMERCIAL READINESS

Sources:
- `WEBSITE-VENTURES-COMMERCIAL-READINESS.json`
- `website-ventures-commercial-readiness.html`

Status language:
- `ready` = built/decided;
- `human` = Joey decision required;
- `manual` = manual creative/production action;
- `external` = provider/admin/legal/business action requiring explicit approval;
- `deferred` = correctly postponed until evidence exists.

### Ready now
- Agency code/interaction structure;
- reusable Plumbing master;
- full client production street;
- customer-domain ownership principle;
- bounded first-10 acquisition process.

### Manual blockers
- Batch 5 final Agency hero desktop + mobile;
- Batch 6 recurring technician;
- Batch 7 same-technician scene set.

### Joey decisions still open
- exact public customer outcome / one-sentence offer;
- founding price;
- base scope;
- actual revision limit;
- optional control/training add-on;
- maintenance/support model.

### External/approval blockers
- commercial hosting/provider;
- source repo privacy/fork cutover;
- production deployment exposure of internal tools;
- final contracting/invoicing/legal process.

**Public paid selling stays HOLD while critical offer/infrastructure/security/legal gates remain unresolved.** A bounded private pilot can happen earlier only when those responsibilities are handled case-by-case.

## PRICING + UNIT ECONOMICS

Market snapshot:
- `WEBSITE-VENTURES-PRICE-MARKET-SNAPSHOT-2026-09.md`

Current Dutch public examples checked 2026-09-08 ranged roughly from:
- €349 at the low end;
- multiple offers around €499–€799;
- several at €995+ depending on scope.

Conclusion:
- €349 is plausible as a deliberately bounded founding offer;
- it is **not** a proven optimum or permanent ceiling;
- production efficiency should improve margin and speed, not automatically force price to the minimum market number.

Calculator:
- `website-ventures-unit-economics.html`

Default hypothesis currently uses:
- 45 min sales/admin;
- 90 min build/config;
- 30 min revisions;
- 35 min QA/launch;
- 20 min handoff/support;
- total = 220 active minutes.

At €349 and zero direct variable costs that is roughly €95 contribution per active hour before tax/fixed overhead. At a €75/hour target, roughly 279 total active minutes are available before dropping below that target.

Do not treat these as proven numbers; replace them with customer 1–10 data.

## ACQUISITION — CURRENT LEGAL/OPERATING ROUTE

Playbook:
- `WEBSITE-VENTURES-ACQUISITION-V1.md`

Tracker:
- `website-ventures-acquisition-tracker.html`

Opportunity triage:
- `website-ventures-opportunity-scorer.html`

Current channel order:
1. active-buyer platforms;
2. warm introductions;
3. referrals;
4. carefully appropriate in-person business discovery;
5. broader outbound only later and only after renewed legal/compliance review.

Current Netherlands operational boundary from official ACM/KVK research on 2026-09-08:
- since 1 July 2026, consumers and natural small entrepreneurs such as zzp/einmanszaak and VOF are protected against unsolicited commercial telephone calls without prior explicit consent;
- commercial email/WhatsApp is likewise not a generic cold-outreach loophole;
- public contact details are not the same thing as consent;
- do not build scraped mass cold email/WhatsApp/call workflows.

The tracker warns on risky contact combinations but is not legal advice.

## CURRENT BUYER-MARKET EVIDENCE

Active-buyer marketplaces do contain website demand, but much of it is stack-specific.

Important current example found on Freelancer.nl:
- open project for a company specializing in **kelderafdichting, vochtbestrijding and kelderlekkage**;
- extremely strong niche fit with Plumbing/trades;
- wants a professional trust-heavy service website with projects, quote/contact, mobile, WhatsApp/click-to-call etc.;
- but explicitly requires **WordPress**.

This produced a useful product decision instead of an immediate rebuild.

## STATIC VS WORDPRESS DECISION

Source:
- `WEBSITE-VENTURES-DELIVERY-STACK-DECISION.md`

Current rule:

**Keep the current static/config-driven system as P0. Do not rebuild Website Ventures in WordPress now.**

WordPress becomes a bounded pilot only if one of these evidence gates fires:
1. 3 strong-fit opportunities are lost specifically because WordPress is mandatory; or
2. at least 40% of the first 20 serious high-fit opportunities require WordPress; or
3. a high-value paying customer explicitly funds the compatibility work.

Possible middle ground later:
- keep fast static frontend;
- give customers a controlled content editor for services/contact/photos/copy rather than a full page-builder stack.

Do not build that editor until real customer conversations show self-editing is a frequent objection.

## HOSTING / DOMAIN — IMPORTANT BLOCKER

Decision research:
- `WEBSITE-VENTURES-HOSTING-DOMAIN-DECISION.md`

Current facts:
- current Vercel project is Hobby;
- do not launch paid customer production there;
- Vercel Pro remains a plausible early-customer route because current Git/config architecture already fits it, but it is not purchased/locked;
- TransIP is a strong domain-management candidate;
- customer should remain owner of their domain;
- reseller economics can be revisited after real customers.

Do not buy/upgrade recurring services without Joey's explicit approval.

## SECURITY / IP — TWO SEPARATE PROBLEMS

### 1. Source repo
- `Kingkangaroos/Joe` is currently public;
- Vercel deployment metadata confirms `githubRepoVisibility: public`;
- it is also a public fork, so visibility cannot simply be independently flipped private inside the fork network.

Cutover doc:
- `WEBSITE-VENTURES-IP-REPO-CUTOVER.md`

Safe intended sequence:
1. detach / leave fork network → standalone;
2. verify repo/Git/Vercel integrity;
3. convert standalone source private;
4. verify deployments again.

This is permanent/admin-impactful and must not be silently executed.

### 2. Deployment exposure

Even a private repo is not enough while internal HTML/JSON/Markdown tools are deployed as public static URLs.

Doc:
- `WEBSITE-VENTURES-DEPLOYMENT-EXPOSURE.md`

Internal Queue/HQ/Operator/commercial tooling is currently still publicly reachable on the production Vercel deployment. A future security cutover must protect/split internal tooling while keeping intended public agency/client output accessible.

Do not abruptly protect/move the current Gamenfy deployment because PWA/auth/Fitbit flows may depend on the existing production origin.

## GAMENFY VENTURE QUEST

`ventures.js` was refreshed to **v11.5** for the `sell_websites` venture.

The old generic quest wording was replaced by the current Website Ventures strategy while preserving same-ID `done` / `doneAt` completion state for `s1–s11`.

`ventures-workspace.html` now loads `ventures.js?v=11.5` and links directly to the current Operator Hub, Readiness, First 10 Tracker and Unit Economics tools.

Do not reset historical venture progress.

## STILL NOT LOCKED

Do not falsely mark these as final:
- public agency brand/name;
- exact one-sentence offer/outcome;
- €349 founding price;
- later standard price;
- actual base scope;
- actual revision limit;
- Website Control Session/add-on;
- support/maintenance model;
- commercial hosting provider/plan;
- delivery-time marketing promise;
- WordPress delivery as a standard product;
- any mass outbound acquisition system.

## NEXT REAL BOTTLENECK

The autonomous no-cost infrastructure work is now far ahead of the manual visual proof.

**Next real P0 remains Higgsfield Batch 5.**

Until the selected Agency hero exists, do not bury the project under more random tooling or generated support art. New autonomous work should primarily remove actual blockers, tighten measurement, or prepare evidence — not invent extra scope.
