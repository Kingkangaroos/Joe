# Website Ventures — Hosting & Domain decision brief

Updated: 2026-09-08  
Managed by: ChatGPT (OpenAI)  
Status: **RESEARCHED / WORKING RECOMMENDATION — NOT YET COMMERCIAL LOCK**

## Why this exists

Website Ventures is preparing to sell low-friction premium websites to local businesses. The technical template system is becoming repeatable, but customer delivery still needs a commercially valid answer for:

- where the public customer site is hosted;
- who owns the domain;
- who controls DNS;
- whether business email is included;
- how recurring infrastructure cost is recovered;
- how handoff works if a customer leaves.

This document narrows the options without pretending Joey has already approved a final commercial package.

## Hard facts verified 2026-09-08

### Vercel

- The current `joe` Vercel team is on **Hobby**.
- Vercel's current Terms of Service say Hobby is for **personal or non-commercial use only**.
- Vercel's current pricing page describes Hobby as personal/non-commercial and Pro as the plan for professional developers, freelancers and businesses.
- Current Vercel Pro headline price is **$20/month** before VAT/tax, with a $20 included usage credit; usage above included credit can be pay-as-you-go.
- Therefore: **do not sell production client hosting on the existing Hobby plan.**
- Before the Agency Showroom itself becomes a real public commercial acquisition site, either move its commercial deployment to a commercially appropriate plan/provider or explicitly confirm another compliant hosting route.

Sources checked: Vercel Terms of Service + Vercel Pricing, 2026-09-08.

### TransIP

- Any TransIP account can be used as a reseller account.
- TransIP's API can automate domain availability, registration, transfer, nameservers, holder changes, DNS and webhosting actions.
- API use itself is offered without an extra API fee.
- TransIP offers a Whitelabel service for domains; current documentation states the first year is free, then **€40.50 excl. VAT/year per TransIP account**. Existing .nl domains can be added to Whitelabel for **€2.99 excl. VAT** each according to the current knowledge-base article.
- Current standard .nl renewal shown by TransIP is **€16.50/year** after promotional first-year pricing.
- Whitelabel is optional. It should not be bought merely because it sounds professional; use it only if Joey actually decides to resell domains under his own brand.

Sources checked: TransIP reseller, API, Whitelabel and .nl pricing pages, 2026-09-08.

### mijn.host reseller hosting

- mijn.host currently offers reseller hosting with separate customer/users, unlimited domains, mailbox support, SSL, backups and DirectAdmin-style management.
- The current Professional reseller page advertises **€9.99/month promotional pricing** (normal price shown as €14.99/month) and up to **50 users**, with unlimited domains/mailboxes plus LiteSpeed/Redis and daily backups.
- Premium is advertised from €29.99/month promotional pricing and up to 150 users.
- Their Whitelabel service is included on some higher reseller packages and is otherwise available separately; their knowledge base currently shows €4.99/month for the standalone Whitelabel package.
- This route is operationally attractive if Website Ventures wants to bundle website + mailbox + classic hosting under one reseller control panel.

Sources checked: mijn.host reseller-hosting and Whitelabel pages, 2026-09-08.

### Cloudflare Pages

- Static asset requests on Cloudflare Pages are currently free/unlimited on both free and paid plans.
- The current Free Pages limits include 500 builds/month, one concurrent build and up to 100 custom domains per project.
- Cloudflare's broader plan page describes Free as suited to personal/hobby or non-business-critical use and Pro as professional websites that are not business-critical.
- Because Website Ventures intends to sell production sites, do **not** make a free-tier assumption the business depends on without a deliberate provider/terms decision.

Sources checked: Cloudflare Pages pricing/limits and Cloudflare plans pages, 2026-09-08.

## Working recommendation

### Phase 0 — right now, before customer #1

1. **Keep building/testing in the current repo and Vercel deployment.** It is still an internal personal build environment; do not present Hobby as the eventual paid hosting promise.
2. **Customer owns the domain in substance.** The customer's organization/name should be the registrant/holder. Website Ventures should never make transfer deliberately difficult.
3. Keep domain and hosting as separate concepts:
   - domain = customer's asset;
   - hosting = Website Ventures service/infrastructure choice;
   - DNS = operational bridge between them.
4. Do not buy Whitelabel yet. It does not solve the important problem right now.
5. Do not promise 'hosting included forever' inside a €349 one-off purchase before the recurring cost model is decided.

### Phase 1 — first 1–3 paying customers

**Preferred simplicity test: Vercel Pro for the Website Ventures commercial environment** while the customer system is still being proven.

Why:
- current workflow already deploys from GitHub to Vercel;
- minimal new operational stack while customer 1–3 exposes the real workflow;
- selected-assets/config architecture already fits Git/Vercel deployments;
- avoids migrating the production workflow before we know which features clients actually need.

But this is a **working recommendation, not a purchase instruction**. Do not upgrade automatically without Joey's approval because it starts recurring billing.

For domains during this phase:
- Prefer customer-owned registration or customer-holder data.
- If Joey manages the domain, document holder/renewal/transfer status in the fulfilment run.
- Use TransIP as a strong candidate because its API/reseller features leave room for later automation.

### Phase 2 — after enough real customers to justify reseller operations

Evaluate moving simple local-business sites to a reseller-hosting layer such as mijn.host if the measured customer need is:

- branded mailbox hosting;
- one panel for many client accounts;
- low predictable hosting cost per customer;
- classic FTP/DirectAdmin handoff;
- reseller/whitelabel operations.

Do **not** migrate merely to save a few euros before the workflow is proven. Migration/support complexity is also a cost.

## Commercial model candidates — NOT LOCKED

### Candidate A — one-off build + annual infrastructure

Example structure only:
- one-off website fee;
- annual hosting/maintenance/domain-management fee;
- customer domain remains transferable/customer-owned.

This is cleaner than hiding indefinite hosting cost inside a single €349 payment.

### Candidate B — one-off build, customer pays infrastructure directly

- Website Ventures invoices build/setup only;
- customer directly owns/pays domain and hosting account;
- Joey configures it during fulfilment.

Lowest long-term liability, but more friction during onboarding and less recurring revenue.

### Candidate C — Website Ventures managed hosting

- Joey holds commercial hosting/reseller account;
- customer pays a yearly management/hosting fee;
- domain holder remains the customer;
- Website Ventures handles DNS, SSL and deployments.

Best operational control, but creates support responsibility. Price only after customer 1–10 support time is measured.

## Recommended customer ownership rules

These are safe operating principles, not final contract language:

1. **Domain holder = customer** whenever possible.
2. Store no domain/API passwords in Client Factory or Fulfilment Run.
3. Record only provider, ownership state, renewal responsibility and DNS status in internal workflow.
4. If Website Ventures buys/registers on behalf of the customer, use the customer's holder information and keep a documented transfer route.
5. On termination, provide required transfer/auth code and remove Website Ventures-specific access after handoff/payment obligations are settled under the eventual contract.
6. Email/mailbox scope must be explicit; a static website host is not automatically an email provider.

## What is still genuinely open

- Vercel Pro vs reseller hosting as the default customer production host.
- Whether hosting is optional, bundled yearly or required.
- Exact annual fee.
- Whether Website Ventures manages domain registration or only DNS.
- Whether business email is included in any package.
- Revision/support SLA.
- Backup/restore responsibilities.
- Exact exit/handoff wording in customer terms.

## Decision gate

Do not lock the above from theory alone. Before finalizing the public offer:

1. run customer #1 through `website-ventures-fulfilment-run.html`;
2. record whether the customer already has a domain/email provider;
3. measure DNS/domain setup time and support friction;
4. measure actual recurring support requests;
5. only then lock the hosting fee and default provider for customers 2–10.

## Current practical blocker

The existing Vercel team is Hobby. Because the current Vercel terms restrict Hobby to personal/non-commercial use, **commercial production launch requires a hosting-plan decision before accepting the first paying site on that environment.**
