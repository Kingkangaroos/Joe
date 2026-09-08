/* Website Ventures Batch 5 promotion gate — ChatGPT (OpenAI), 2026-09-08 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { promote } = require('../scripts/website-ventures-promote-batch5.js');

const repo = path.resolve(__dirname, '..');
const tempRoots = [];
function fixture () {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wv-batch5-'));
  tempRoots.push(root);
  for (const file of ['WEBSITE-VENTURES-ASSET-IMPORT-MANIFEST.json', 'WEBSITE-VENTURES-SELECTED-ASSETS.json']) {
    fs.copyFileSync(path.join(repo, file), path.join(root, file));
  }
  return root;
}
function fakePng (file, width, height) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const data = Buffer.alloc(24);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(data, 0);
  data.write('IHDR', 12, 4, 'ascii');
  data.writeUInt32BE(width, 16);
  data.writeUInt32BE(height, 20);
  fs.writeFileSync(file, data);
}
function candidate (root, jobId, index, width, height) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'WEBSITE-VENTURES-ASSET-IMPORT-MANIFEST.json')));
  const item = manifest.assets.find(asset => asset.jobId === jobId);
  const file = path.join(root, item.candidatePaths[index]);
  fakePng(file, width, height);
  return { item, file };
}

try {
  const root = fixture();
  const desktop = candidate(root, 'AG-HERO-PRODUCT-001', 1, 1600, 900);
  const dry = promote({ root, jobId: 'AG-HERO-PRODUCT-001', variant: 'B', generationId: 'hf-test-desktop', dryRun: true });
  assert.equal(dry.slotKey, 'agency.hero.desktop');
  assert.equal(fs.existsSync(path.join(root, desktop.item.targetPath)), false, 'dry-run must not copy the candidate');

  promote({ root, jobId: 'AG-HERO-PRODUCT-001', variant: 'B', generationId: 'hf-test-desktop' });
  let registry = JSON.parse(fs.readFileSync(path.join(root, 'WEBSITE-VENTURES-SELECTED-ASSETS.json')));
  assert.equal(registry.slots['agency.hero.desktop'].status, 'selected');
  assert.equal(registry.slots['agency.hero.desktop'].selectedVariant, 'B');
  assert.equal(registry.slots['agency.hero.desktop'].selectedGenerationId, 'hf-test-desktop');
  assert.ok(fs.existsSync(path.join(root, desktop.item.targetPath)), 'approved candidate is copied to the final target');
  assert.throws(() => promote({ root, jobId: 'AG-HERO-PRODUCT-001', variant: 'B', generationId: 'hf-second' }), /--replace/, 'replacement needs explicit approval');

  const mobile = candidate(root, 'AG-HERO-MOBILE-001', 0, 1200, 1500);
  promote({ root, jobId: 'AG-HERO-MOBILE-001', variant: 'A', generationId: 'hf-test-mobile' });
  registry = JSON.parse(fs.readFileSync(path.join(root, 'WEBSITE-VENTURES-SELECTED-ASSETS.json')));
  assert.equal(registry.slots['agency.hero.mobile'].selectedPath, mobile.item.targetPath);

  const blockedRoot = fixture();
  candidate(blockedRoot, 'AG-HERO-MOBILE-001', 0, 1200, 1500);
  assert.throws(() => promote({ root: blockedRoot, jobId: 'AG-HERO-MOBILE-001', variant: 'A', generationId: 'hf-mobile-too-early' }), /blocked until/, 'mobile must remain locked before desktop selection');

  const wrongRatioRoot = fixture();
  candidate(wrongRatioRoot, 'AG-HERO-TRANSFORM-001', 0, 1000, 1000);
  assert.throws(() => promote({ root: wrongRatioRoot, jobId: 'AG-HERO-TRANSFORM-001', variant: 'A', generationId: 'hf-wrong-ratio' }), /must be 16:9/, 'wrong aspect ratio must be rejected');

  console.log('Website Ventures Batch 5 promotion gate smoke passed.');
} finally {
  for (const root of tempRoots) fs.rmSync(root, { recursive: true, force: true });
}
