#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function webpDigest(relativePath) {
  const bytes = fs.readFileSync(path.join(ROOT, relativePath));
  assert.equal(bytes.subarray(0, 4).toString(), 'RIFF', relativePath + ' must be a RIFF file');
  assert.equal(bytes.subarray(8, 12).toString(), 'WEBP', relativePath + ' must have a WebP signature');
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function validateBadge(badge, index, assetRoot) {
  const prefix = 'badge[' + index + ']';
  assert.match(String(badge.id || ''), /^[a-z0-9]+(?:-[a-z0-9]+)*$/, prefix + ' needs a stable slug ID');
  assert.ok(String(badge.name || '').trim(), prefix + ' needs a display name');
  assert.ok(['intake', 'contracted', 'reviewed', 'wired', 'live'].includes(badge.status), prefix + ' has an invalid status');
  assert.ok(String(badge.sourceFile || '').trim(), prefix + ' needs source provenance');
  assert.ok(String(badge.assetPath || '').startsWith(assetRoot), prefix + ' asset must stay beneath the badge root');
  assert.ok(['public', 'private'].includes(badge.privacy), prefix + ' needs a privacy class');
  assert.ok(badge.trigger && String(badge.trigger.source || '').trim(), prefix + ' needs a canonical trigger source');
  assert.ok(String(badge.trigger.condition || '').trim(), prefix + ' needs an exact trigger condition');
  assert.ok(badge.states && String(badge.states.locked || '').trim(), prefix + ' needs a locked-state rule');
  assert.ok(String(badge.states.unlocked || '').trim(), prefix + ' needs an unlocked-state rule');
  assert.ok(Array.isArray(badge.placements) && badge.placements.length > 0, prefix + ' needs at least one placement');
  assert.ok(String(badge.accessibleDescription || '').trim(), prefix + ' needs accessible meaning');
  if (badge.status !== 'intake') {
    assert.ok(fs.existsSync(path.join(ROOT, badge.assetPath)), prefix + ' accepted asset is missing');
    webpDigest(badge.assetPath);
  }
}

function audit() {
  const operations = readJson('GAMENFY-ASSET-OPERATIONS.json');
  const badges = readJson('GAMENFY-BADGE-REGISTRY.json');

  assert.equal(operations.schemaVersion, 1);
  assert.equal(operations.defaultView, 'overview');
  assert.equal(operations.strategy.generationAuthorized, false, 'Operations Hub may not authorize generation');
  assert.equal(operations.strategy.creditsSpentThisRound, 0, 'Operations Hub pass must remain zero-credit');
  assert.equal(operations.missionSets.length, 13, 'exactly thirteen personal Daily Mission sets are required');
  assert.equal(operations.missionSets.filter(item => item.privacy === 'public').length, 11, 'exactly eleven mission sets are public');
  assert.equal(operations.missionSets.filter(item => item.privacy === 'private').length, 2, 'exactly two mission sets are private');

  const keys = new Set();
  const directories = new Set();
  let missionFrames = 0;
  for (const mission of operations.missionSets) {
    assert.ok(!keys.has(mission.key), 'duplicate mission key: ' + mission.key);
    assert.ok(!directories.has(mission.directory), 'duplicate mission directory: ' + mission.directory);
    keys.add(mission.key);
    directories.add(mission.directory);
    const digests = new Set();
    for (let level = 1; level <= 10; level += 1) {
      const relativePath = path.posix.join('img/lab/park31', mission.directory, 'l' + String(level).padStart(2, '0') + '.webp');
      digests.add(webpDigest(relativePath));
      missionFrames += 1;
    }
    assert.equal(digests.size, 10, mission.key + ' must have ten distinct evolution frames');
  }

  let dailyScoreFrames = 0;
  const dailyScoreDigests = new Set();
  for (let level = 1; level <= 10; level += 1) {
    const relativePath = 'img/lab/daily-score/joey/l' + String(level).padStart(2, '0') + '.webp';
    dailyScoreDigests.add(webpDigest(relativePath));
    dailyScoreFrames += 1;
  }
  assert.equal(dailyScoreDigests.size, 10, 'Daily Score Joey must have ten distinct frames');

  assert.equal(badges.schemaVersion, 1);
  assert.equal(badges.assetRoot, 'img/gamenfy/badges/');
  assert.ok(Array.isArray(badges.items), 'badge registry items must be an array');
  const badgeIds = new Set();
  badges.items.forEach((badge, index) => {
    validateBadge(badge, index, badges.assetRoot);
    assert.ok(!badgeIds.has(badge.id), 'duplicate badge ID: ' + badge.id);
    badgeIds.add(badge.id);
  });

  const badgeFiles = fs.readdirSync(path.join(ROOT, badges.assetRoot), { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(?:webp|png|jpe?g|svg)$/i.test(entry.name));
  const registeredPaths = new Set(badges.items.map(item => path.basename(item.assetPath || '')));
  const orphanBadgeAssets = badgeFiles.map(entry => entry.name).filter(name => !registeredPaths.has(name));
  assert.deepEqual(orphanBadgeAssets, [], 'unregistered badge assets: ' + orphanBadgeAssets.join(', '));

  const missionInventory = operations.inventory.find(item => item.id === 'GF-MISSION-EVOLUTIONS');
  const scoreInventory = operations.inventory.find(item => item.id === 'GF-DAILY-SCORE');
  const badgeInventory = operations.inventory.find(item => item.id === 'GF-BADGES');
  assert.equal(missionInventory.assetCount, missionFrames);
  assert.equal(missionInventory.setCount, operations.missionSets.length);
  assert.equal(scoreInventory.assetCount, dailyScoreFrames);
  assert.equal(badgeInventory.assetCount, badges.items.length);

  return {
    ok: true,
    missionSets: operations.missionSets.length,
    missionFrames,
    dailyScoreFrames,
    badgeRecords: badges.items.length,
    badgeAssets: badgeFiles.length,
    generationAuthorized: operations.strategy.generationAuthorized,
    creditsSpentThisRound: operations.strategy.creditsSpentThisRound
  };
}

if (require.main === module) {
  try {
    const result = audit();
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (error) {
    process.stderr.write('Gamenfy asset audit failed: ' + error.message + '\n');
    process.exitCode = 1;
  }
}

module.exports = { audit };
