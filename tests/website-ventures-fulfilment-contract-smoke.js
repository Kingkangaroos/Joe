/* Website Ventures Fulfilment Run contract — ChatGPT (OpenAI), 2026-09-09 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fulfilment = require('../website-ventures-fulfilment-contract.js');

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
  services: config.services.map(service => ({ title: service.title, description: service.description })),
  domain: { state: 'temporary-preview-only' },
  scope: {
    template: 'plumbing-v1',
    revisionRounds: 1,
    included: ['Responsive template adaptation'],
    excluded: ['Nieuwe custom app-functionaliteit']
  }
};
const run = {
  version: 2,
  slug: config.id,
  runNo: 1,
  status: 'active',
  phases: Object.fromEntries(fulfilment.phaseIds.map(id => [id, { done: true, seconds: 60, runningSince: null, note: '' }]))
};
const checks = Object.fromEntries(fulfilment.deliveryCheckIds.map(id => [id, true]));

assert.equal(fulfilment.assessFoundation(intake, config.id).ok, true, 'matching complete Intake + scope must unlock measurement');
assert.equal(fulfilment.assessFoundation(null, config.id).ok, false, 'measurement must fail closed without a real Intake');

const ready = fulfilment.assessLaunch(run, intake, config, checks, config.id);
assert.equal(ready.ok, true, 'launched status must require current evidence, 9/9 phases and 12/12 Delivery Gate');
assert.equal(ready.phases.done, 9, 'all fulfilment phases must be counted');
assert.equal(ready.delivery.done, 12, 'all Delivery Gate checks must be counted');

const unfinished = clone(run);
unfinished.phases.mobile.done = false;
assert.equal(fulfilment.assessLaunch(unfinished, intake, config, checks, config.id).ok, false, 'unfinished phase must block launched status');

const unchecked = clone(checks);
unchecked['contact-tested'] = false;
assert.equal(fulfilment.assessLaunch(run, intake, config, unchecked, config.id).ok, false, 'open human Delivery Gate check must block launched status');

const staleConfig = clone(config);
staleConfig.brand.name = 'Andere klant';
assert.equal(fulfilment.assessLaunch(run, intake, staleConfig, checks, config.id).ok, false, 'stale Factory evidence must override completed checkboxes');

const wrongRun = clone(run);
wrongRun.slug = 'andere-client';
assert.equal(fulfilment.assessLaunch(wrongRun, intake, config, checks, config.id).ok, false, 'run identity must match the active client');

const page = read('website-ventures-fulfilment-run.html');
const controller = read('website-ventures-fulfilment-run.js');
const clientContractAt = page.indexOf('website-ventures-client-contract.js?v=1');
const deliveryContractAt = page.indexOf('website-ventures-delivery-evidence.js?v=1');
const fulfilmentContractAt = page.indexOf('website-ventures-fulfilment-contract.js?v=1');
const controllerAt = page.indexOf('website-ventures-fulfilment-run.js?v=1');
assert.ok(clientContractAt > -1 && clientContractAt < deliveryContractAt && deliveryContractAt < fulfilmentContractAt && fulfilmentContractAt < controllerAt, 'Fulfilment Run dependencies must load in order');
assert.ok(page.includes('id="runGate"'), 'Fulfilment Run must expose its evidence state');
assert.ok(controller.includes("const INTAKE_PREFIX = 'wv_client_intake_v1_';"), 'run must bind to a real local Intake');
assert.ok(controller.includes('startedAt: null'), 'opening the page must not silently start elapsed measurement');
assert.ok(controller.includes("if (requestedStatus === 'launched')"), 'launched status must use a dedicated guard');
assert.ok(controller.includes("$('runStatus').value = run.status || 'active';"), 'blocked launched selection must revert to persisted status');
assert.ok(controller.includes('run.launchEvidence = {'), 'accepted launched status must retain a compact evidence snapshot');
assert.ok(controller.includes("if (!save(true)) return;"), 'copying run data must also pass the Intake foundation gate');

console.log('Website Ventures fulfilment contract smoke passed.');
