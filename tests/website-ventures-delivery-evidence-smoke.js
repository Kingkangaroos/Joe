/* Website Ventures Delivery Gate evidence — ChatGPT (OpenAI), 2026-09-09 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const evidence = require('../website-ventures-delivery-evidence.js');

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
  domain: { state: 'temporary-preview-only' },
  scope: {
    template: 'plumbing-v1',
    revisionRounds: 1,
    included: ['Responsive template adaptation'],
    excluded: ['Nieuwe custom app-functionaliteit']
  }
};

const ready = evidence.assess(intake, config, config.id);
assert.equal(ready.intake.ok, true, 'complete matching Intake must pass evidence');
assert.equal(ready.scope.ok, true, 'explicit included/excluded scope must pass evidence');
assert.equal(ready.config.ok, true, 'valid Factory config aligned to Intake must pass evidence');

const noIntake = evidence.assess(null, null, 'plumbing-demo');
assert.equal(noIntake.intake.ok, false, 'missing Intake must fail closed');
assert.equal(noIntake.scope.ok, false, 'missing scope must fail closed');
assert.equal(noIntake.config.ok, false, 'missing Factory config must fail closed');

const unsafeIntake = clone(intake);
unsafeIntake.offer.primaryCtaHref = 'javascript:alert(1)';
assert.equal(evidence.intakeEvidence(unsafeIntake, config.id).ok, false, 'unsafe Intake CTA must block foundation evidence');

const vagueScope = clone(intake);
vagueScope.scope.excluded = [];
assert.equal(evidence.scopeEvidence(vagueScope).ok, false, 'empty excluded scope must block scope evidence');

const wrongClient = clone(config);
wrongClient.brand.name = 'Andere klant';
assert.equal(evidence.configEvidence(intake, wrongClient, config.id).ok, false, 'Factory brand identity must match Intake');

const wrongCta = clone(config);
wrongCta.final.ctaHref = 'tel:+31612345678';
assert.equal(evidence.configEvidence(intake, wrongCta, config.id).ok, false, 'Factory CTA route must match Intake');

const wrongLabel = clone(config);
wrongLabel.contact.navLabel = 'Andere actie';
assert.equal(evidence.configEvidence(intake, wrongLabel, config.id).ok, false, 'Factory CTA label must match Intake');

const wrongServices = clone(config);
wrongServices.services[0].title = 'Onverwachte dienst';
assert.equal(evidence.configEvidence(intake, wrongServices, config.id).ok, false, 'Factory service identity must match Intake');

const gate = read('website-ventures-delivery-gate.html');
assert.ok(gate.includes('<script src="website-ventures-client-contract.js?v=1"></script>'), 'Delivery Gate must load the client contract first');
assert.ok(gate.includes('<script src="website-ventures-delivery-evidence.js?v=1"></script>'), 'Delivery Gate must load cache-versioned evidence logic');
assert.ok(gate.indexOf('website-ventures-client-contract.js?v=1') < gate.indexOf('website-ventures-delivery-evidence.js?v=1'), 'Delivery evidence must load after its client contract dependency');
assert.ok(gate.includes("const CONFIG_PREFIX = 'wv_client_config_draft_v1_';"), 'Delivery Gate must inspect the Factory draft for the active client');
assert.ok(gate.includes("'intake-approved': 'intake'"), 'Intake checkbox must be evidence-bound');
assert.ok(gate.includes("'scope-visible': 'scope'"), 'Scope checkbox must be evidence-bound');
assert.ok(gate.includes("'factory-config': 'config'"), 'Factory checkbox must be evidence-bound');
assert.ok(gate.includes("disabled aria-disabled=\"true\""), 'Missing evidence must lock its foundational checkbox');
assert.ok(gate.includes("saved[input.dataset.check] = evidenceKey && !evidence[evidenceKey]?.ok ? false : input.checked"), 'Invalid foundational evidence must be persisted as false');
assert.ok(gate.includes("id + ' · menselijke controle'"), 'Proof, contact, device, hosting and handoff gates must remain manual');

console.log('Website Ventures delivery evidence smoke passed.');
