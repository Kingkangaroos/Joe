# Website Ventures — READ ME NOW

**Current checkpoint: 2026-09-08 · ChatGPT (OpenAI)**

If another chat/builder needs the current Website Ventures state, **read this file first**, then use `WEBSITE-VENTURES-HQ.md` / `WEBSITE-VENTURES-HQ-STATE.json` for deeper context.

## CURRENT PRIORITY

1. **Website Ventures remains income priority #1.**
2. **Joey's own Agency Showroom is the first visual/technical flagship.**
3. Higgsfield **Batch 5 is still the next manual generation step**: three 2K desktop agency hero concepts → choose one → deliberate 4:5 mobile derivative.
4. Then Batch 6 selects **one recurring Plumbing technician**.
5. Batch 7 makes only the three currently-needed same-technician working scenes.
6. Batch 8 remains **optional / skip-by-default**.
7. Batch 9 is 4K finish only after real winners exist.

No new paid Higgsfield generation was started by ChatGPT during the fulfilment-system work below.

## ACTIVE VISUAL PIPELINE

- Queue: `website-ventures-higgsfield-prompt-board.html`
- Source JSON: `WEBSITE-VENTURES-HIGGSFIELD-QUEUE.json`
- Review: `website-ventures-higgsfield-review.html`
- Selected/live gate: `website-ventures-selected-assets.html`
- Registry: `WEBSITE-VENTURES-SELECTED-ASSETS.json`
- Loader: `website-ventures-selected-assets.js`
- Production Line: `website-ventures-production-line-v3.html` / `WEBSITE-VENTURES-PRODUCTION-LINE-V3.json`
- Operator Hub: `website-ventures-ops.html`

Rule: **generate/import → review → selected registry → real page → desktop/mobile QA**. A local review checkbox never publishes media by itself.

## AGENCY SHOWROOM

- Live lab page: `site-agency-showroom-v0.html`
- Already has three code-first capability proofs:
  1. sticky scroll storytelling with desktop + mobile showcase slots;
  2. touch/mouse/keyboard before↔premium comparison slider;
  3. pointer-responsive reusable interaction experiment.
- Do **not** add more visual gimmicks just to increase feature count.
- Hero has separate selected-asset slots for desktop and mobile.
- Real proof slot stays empty until real evidence exists.
- Price/copy/brand on the current page remain working hypotheses, not approved public claims.

## PLUMBING CUSTOMER SYSTEM — NOW CONFIG-DRIVEN

Master page:
- `site-plumbing-flagship-v1.html`

Shared config system:
- `website-ventures-client-config.js`
- `website-ventures-plumbing-template.js`
- `WEBSITE-VENTURES-CLIENT-CONFIG-SCHEMA.json`
- repo configs: `website-ventures-client-configs/<slug>.json`

Important behavior:
- one coded Plumbing master;
- customer identity/copy/contact/services/theme come from config;
- local draft preview uses `?wvlocal=1`;
- missing/broken config keeps safe hardcoded fallback;
- generated Selected Assets remain a separate approval gate;
- `plumbing-qa-blue` is only a technical QA fixture, not a brand idea.

## CLIENT FACTORY V2

Page:
- `website-ventures-client-factory.html`

Current behavior:
- automatically opens the local draft made from the latest Client Intake;
- saves local customer config without writing GitHub;
- previews the exact same Plumbing master in an iframe;
- edits brand, accent color, hero, CTA, positioning, services, final CTA and service area;
- computes matching dark brand accent rather than leaking AUREL red into other client themes;
- AUREL can be explicitly loaded as a baseline, but no longer silently overwrites an intake draft;
- Copy JSON is the boundary before a later approved repo commit.

## CLIENT INTAKE + SCOPE GATE

Page:
- `website-ventures-client-intake.html`

Schema:
- `WEBSITE-VENTURES-CLIENT-INTAKE-SCHEMA.json`

Captures before build:
- client identity/contact/service area;
- primary commercial outcome + CTA;
- services;
- domain state + hosting note;
- real proof/assets received;
- template;
- revision rounds;
- explicitly included/excluded scope;
- special requests.

It saves locally and can create the matching Client Factory draft.

**One revision round is only a working default, not yet locked commercial terms.**

## OFFER BUILDER

Page:
- `website-ventures-offer-builder.html`

Rules:
- reads the latest saved intake;
- creates a customer-friendly draft summary;
- base price defaults to **€349 only as the current founding-offer hypothesis**;
- supports one-off / split / TBD payment choice;
- domain/hosting stays explicit;
- optional Website Control Session defaults to €59 only when manually enabled;
- does not promise a fixed ultra-fast delivery time before customer 1–10 evidence exists;
- not a legal contract, invoice or final terms.

Schema:
- `WEBSITE-VENTURES-OFFER-DRAFT-V1.json`

## FULFILMENT MEASUREMENT

Page:
- `website-ventures-fulfilment-run.html`

Purpose:
- measure customers 1–10 instead of guessing delivery speed;
- track active minutes by phase;
- track waiting/client blockers separately;
- measure desktop/mobile QA, domain/hosting and handoff work.

Do not lock a fast-delivery marketing promise until this data exists.

## DELIVERY GATE + CHANGE REQUESTS

Page:
- `website-ventures-delivery-gate.html`

Schema:
- `WEBSITE-VENTURES-DELIVERY-GATE-V1.json`

Required launch gate currently checks:
- intake;
- scope/revisions;
- approved config;
- real-source proof;
- contact CTA;
- desktop QA;
- ~390px mobile QA;
- Selected Assets/fallback;
- domain ownership;
- commercially-appropriate hosting;
- DNS/HTTPS;
- handoff.

Same page logs out-of-scope customer change requests with:
- state;
- estimated extra minutes;
- price impact;
- decision/reason.

Recording a request does **not** automatically mean it is chargeable or approved.

## CUSTOMER HANDOFF

Page:
- `website-ventures-customer-handoff.html`

Schema:
- `WEBSITE-VENTURES-CUSTOMER-HANDOFF-V1.json`

Generates a handoff summary covering:
- live URL;
- domain/account ownership;
- hosting responsibility;
- supplied services;
- included/excluded scope;
- revision allowance used/remaining;
- support/maintenance arrangement;
- future change-request route;
- responsibility for truth of reviews/certifications/guarantees/project proof.

Not a replacement for legal terms or invoices.

## HOSTING / DOMAIN — IMPORTANT BLOCKER

Decision research:
- `WEBSITE-VENTURES-HOSTING-DOMAIN-DECISION.md`

Current facts/decision boundary:
- the current Vercel team/project is **Hobby**;
- Vercel's current Hobby terms are personal/non-commercial, so do **not** launch paid client production there;
- Vercel Pro is a strong early-customer candidate because the current Git/config/deployment architecture already fits it, but it is **not purchased/locked yet**;
- TransIP is a strong domain-management candidate and supports reseller/API workflows and later handover to a customer's own TransIP account;
- customer should remain owner of their domain;
- mijn.host reseller can be revisited when multiple paying clients justify reseller economics.

Do not buy/upgrade recurring services without Joey's explicit approval.

## STILL OPEN COMMERCIAL DECISIONS

Do not falsely mark these as final:

- exact public agency brand/name;
- exact one-sentence offer/outcome;
- €349 founding price vs another launch price;
- later regular price;
- final included/excluded base scope;
- whether 1 revision round becomes the actual standard;
- whether the ~€59 Website Control Session is sold;
- exact maintenance/support model;
- final commercial hosting/provider choice;
- final delivery-time promise;
- acquisition workflow.

## CURRENT SELLING WORKFLOW

The operational flow now is:

**Client Intake → Offer Draft → Client Factory → real assets/proof → Selected Assets → Fulfilment Run → desktop/mobile QA → Delivery Gate → commercial domain/hosting → launch → Customer Handoff.**

The whole point is to make customer #2–10 configuration + evidence + QA, not “rebuild another website from blank.”

## SECURITY / IP WARNING

The GitHub repo `Kingkangaroos/Joe` is currently public. This remains a material competitive-IP risk because internal prompts, workflows and production logic live in the repo. The public-facing agency website should expose polished output, not internal production recipes. Repo privacy/separation still needs a deliberate architecture/admin decision.
