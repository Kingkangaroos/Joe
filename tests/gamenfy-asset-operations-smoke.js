/* Gamenfy Asset Operations regression guard — ChatGPT (OpenAI), 2026-09-10 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { audit } = require('../scripts/gamenfy-validate-assets.js');

const ROOT = path.join(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const operations = JSON.parse(read('GAMENFY-ASSET-OPERATIONS.json'));
const badges = JSON.parse(read('GAMENFY-BADGE-REGISTRY.json'));
const page = read('gamenfy-asset-operations.html');
const runtime = read('gamenfy-asset-operations.js');
const lab = read('lab.html');
const hq = read('project-hq.html');
const home = read('index.html');

new vm.Script(runtime, { filename: 'gamenfy-asset-operations.js' });
const result = audit();
assert.deepEqual(result, {
  ok: true,
  missionSets: 13,
  missionFrames: 130,
  dailyScoreFrames: 10,
  badgeRecords: 0,
  badgeAssets: 0,
  generationAuthorized: false,
  creditsSpentThisRound: 0
});

assert.equal(operations.badgeSystem.status, 'awaiting-original-files');
assert.equal(badges.status, 'awaiting-joey-originals');
assert.deepEqual(badges.items, [], 'missing originals must never be replaced by invented badge records');
assert.match(page, /data-gamenfy-scope="personal"/, 'hub remains inside the private Gamenfy boundary');
assert.match(page, /data-default-view="overview"/, 'hub defaults to Overview');
assert.match(page, /Warm White \+ Oxblood/, 'hub exposes the controlled white/red Lab direction');
assert.match(page, /GAMENFY-ASSET-OPERATIONS\.json/, 'hub loads the durable operations manifest');
assert.match(page, /GAMENFY-BADGE-REGISTRY\.json/, 'hub loads the badge registry');
assert.doesNotMatch(page + runtime, /higgsfield\.ai|imagegen|generate image/i, 'read-only hub must not expose a generation launch route');
assert.match(lab, /gamenfy-asset-operations\.html/, 'General Lab must surface the Gamenfy Asset Operations Hub');
assert.match(lab, /13 Daily Mission-evoluties/, 'Lab card must describe the complete personal roster');
assert.match(hq, /gamenfy-asset-operations\.html/, 'Project HQ must link to the asset operator route');
assert.doesNotMatch(home, /#7F1830|#B82948|gamenfy-asset-operations\.css/, 'white/red remains Lab-only and does not silently restyle Home');

console.log('Gamenfy Asset Operations smoke passed: 140 approved frames audited, badge intake stays truthful and generation remains disabled.');
