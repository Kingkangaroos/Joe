/* Website Ventures Customer Handoff contract — ChatGPT (OpenAI), 2026-09-09 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const handoff = require('../website-ventures-handoff-contract.js');

const read = file => fs.readFileSync(file, 'utf8');
const clone = value => JSON.parse(JSON.stringify(value));
const config = JSON.parse(read('website-ventures-client-configs/plumbing-demo.json'));
config.contact.primaryLabel = 'Plan een intake';
config.contact.navLabel = 'Plan een intake';
config.final.ctaLabel = 'Plan een intake';
config.contact.primaryHref = 'mailto:hello@example.nl';
config.contact.navHref = 'mailto:hello@example.nl';
config.final.ctaHref = 'mailto:hello@example.nl';

const intake = {
  schemaVersion: 1,
  status: 'internal-intake-draft',
  client: {
    slug: config.id,
    businessName: config.brand.name,
    primaryContact: 'Demo contactpersoon',
    serviceArea: config.serviceArea
  },
  offer: {
    primaryOutcome: 'Een duidelijke route naar contact.',
    primaryCtaLabel: 'Plan een intake',
    primaryCtaHref: 'mailto:hello@example.nl'
  },
  services: config.services.map(service => ({
    title: service.title,
    description: service.description,
    priority: 'P0'
  })),
  domain: { state: 'client-owns-existing-domain', name: 'voorbeeld.nl' },
  scope: {
    template: 'plumbing-v1',
    revisionRounds: 1,
    included: ['Responsive template adaptation'],
    excluded: ['Nieuwe custom app-functionaliteit']
  }
};
const checks = Object.fromEntries(handoff.deliveryChecks.map(id => [id, true]));
const details = {
  liveUrl: 'https://voorbeeld.nl',
  domainOwner: 'Klantaccount bij registrar',
  hosting: 'Klant beheert eigen hosting',
  support: 'Geen doorlopend onderhoud inbegrepen',
  revisionsUsed: 1
};

const ready = handoff.assess(intake, config, checks, details, config.id);
assert.equal(ready.ready, true, 'handoff must unlock only when evidence, 12/12 delivery and details pass');
assert.equal(ready.delivery.done, 12, 'all twelve Delivery Gate checks must be counted');

const noHandoffCheck = clone(checks);
noHandoffCheck.handoff = false;
const missingCheck = handoff.assess(intake, config, noHandoffCheck, details, config.id);
assert.equal(missingCheck.ready, false, '11/12 Delivery Gate state must keep customer copy blocked');
assert.deepEqual(missingCheck.delivery.open, ['handoff'], 'the exact missing Delivery Gate item must be surfaced');

const incompleteDetails = clone(details);
incompleteDetails.liveUrl = 'http://voorbeeld.nl';
incompleteDetails.domainOwner = '';
incompleteDetails.hosting = 'Nog afspreken';
incompleteDetails.support = 'Nog afspreken';
assert.equal(handoff.assess(intake, config, checks, incompleteDetails, config.id).ready, false, 'non-HTTPS or ownerless handoff details must fail closed');
assert.equal(handoff.detailsEvidence(incompleteDetails).errors.length, 4, 'placeholder hosting/support choices must remain open decisions');

const staleConfig = clone(config);
staleConfig.brand.name = 'Andere klant';
const stale = handoff.assess(intake, staleConfig, checks, details, config.id);
assert.equal(stale.ready, false, 'stale mismatched Factory evidence must override saved 12/12 check state');
assert.equal(stale.currentEvidence, false, 'stale Factory identity must be visible as current-evidence failure');

const page = read('website-ventures-customer-handoff.html');
const clientContractAt = page.indexOf('website-ventures-client-contract.js?v=1');
const deliveryContractAt = page.indexOf('website-ventures-delivery-evidence.js?v=1');
const handoffContractAt = page.indexOf('website-ventures-handoff-contract.js?v=1');
assert.ok(clientContractAt > -1 && clientContractAt < deliveryContractAt && deliveryContractAt < handoffContractAt, 'handoff contracts must load in dependency order');
assert.ok(page.includes("const CHECK_PREFIX = 'wv_delivery_checks_v1_';"), 'handoff must load the active client Delivery Gate state');
assert.ok(page.includes('id="copy" type="button" disabled'), 'customer copy must start disabled');
assert.ok(page.includes('if (!result?.report?.ready) return;'), 'copy handler must fail closed on the final handoff contract');
assert.ok(page.includes("'<h1>' + esc(name)"), 'customer identity must be HTML-escaped in the preview');
assert.ok(page.includes("services.map(item => '<li>' + esc(item)"), 'customer service content must be HTML-escaped in the preview');
assert.ok(page.includes("String(value == null ? '' : value)"), 'numeric zero must survive HTML escaping in revision summaries');
assert.ok(page.includes('<option value="">Maak een keuze</option>'), 'hosting/support choices must require an explicit selection');
assert.ok(page.includes('Conceptweergave. Kopiëren blijft geblokkeerd'), 'blocked handoff must remain usable as a clearly labelled concept');

console.log('Website Ventures handoff contract smoke passed.');
