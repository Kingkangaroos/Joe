/* Website Ventures client contract — ChatGPT (OpenAI), 2026-09-09 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const contract = require('../website-ventures-client-contract.js');

const read = file => fs.readFileSync(file, 'utf8');
const json = file => JSON.parse(read(file));
const clone = value => JSON.parse(JSON.stringify(value));
const demo = json('website-ventures-client-configs/plumbing-demo.json');
const blue = json('website-ventures-client-configs/plumbing-qa-blue.json');

assert.equal(contract.validate(demo, 'plumbing-demo').ok, true, 'AUREL repo config must satisfy the shared contract');
assert.equal(contract.validate(blue, 'plumbing-qa-blue').ok, true, 'Blue QA repo config must satisfy the shared contract');
assert.equal(contract.safeHref('tel:+31612345678'), true, 'telephone CTA is supported');
assert.equal(contract.safeHref('mailto:test@example.nl'), true, 'email CTA is supported');
assert.equal(contract.safeHref('https://wa.me/31612345678'), true, 'HTTPS/WhatsApp CTA is supported');
assert.equal(contract.safeHref('javascript:alert(1)'), false, 'unsafe protocols are blocked');

const noCta = clone(demo);
noCta.contact.primaryHref = '';
assert.equal(contract.validate(noCta, noCta.id).ok, false, 'missing primary CTA link must block the config');

const unsafeCta = clone(demo);
unsafeCta.final.ctaHref = 'javascript:alert(1)';
assert.equal(contract.validate(unsafeCta, unsafeCta.id).ok, false, 'unsafe final CTA link must block the config');

const partialService = clone(demo);
partialService.services[0].description = '';
assert.equal(contract.validate(partialService, partialService.id).ok, false, 'partial service content must block the config');

const wrongSlug = clone(demo);
assert.equal(contract.validate(wrongSlug, 'different-client').ok, false, 'requested slug and config identity must match');

const badTheme = clone(demo);
badTheme.theme.accent = 'red; background:url(x)';
assert.equal(contract.validate(badTheme, badTheme.id).ok, false, 'theme values must stay constrained to hex colors');

const loader = read('website-ventures-client-config.js');
const bootstrap = read('website-ventures-selected-assets.js');
const factory = read('website-ventures-client-factory.html');
const intake = read('website-ventures-client-intake.html');
assert.ok(loader.includes('validateConfig(config, slug)'), 'runtime loader must validate before applying a config');
assert.ok(loader.includes("dataset.wvClientState = 'invalid-config'"), 'invalid configs must expose a deterministic fallback state');
assert.ok(bootstrap.indexOf("loadScriptOnce('website-ventures-client-contract.js?v=1')") < bootstrap.indexOf("loadScriptOnce('website-ventures-client-config.js?v=2')"), 'versioned shared contract must load before the client loader');
assert.ok(factory.includes('<script src="website-ventures-client-contract.js?v=1"></script>'), 'Client Factory must load a cache-versioned shared contract');
assert.ok(read('site-plumbing-flagship-v1.html').includes('website-ventures-selected-assets.js?v=2'), 'Plumbing master must bust the old selected-asset/bootstrap cache');
assert.ok(read('site-agency-showroom-v0.html').includes('website-ventures-selected-assets.js?v=2'), 'Agency showroom must use the same cache-versioned selected-asset loader');
assert.ok(factory.includes("const c=save();if(!c)return;"), 'Copy JSON must be blocked until save-time validation passes');
assert.ok(factory.includes('Copy validated JSON'), 'Factory UI must describe the validated export gate');
assert.ok(intake.includes("if(!validHref(d.offer.primaryCtaHref))a.push('geldige CTA-link')"), 'Intake cannot become build-ready without a valid CTA link');
assert.ok(intake.includes("d.services.some(x=>!x.title||!x.description)"), 'Intake cannot pass a partial service into Factory');

console.log('Website Ventures client contract smoke passed.');
