/* Repo-wide RPG sync authority regression — ChatGPT (OpenAI)
   xp.js owns the canonical key/prefix lists. Other ACTIVE app pages may only
   delegate to those exact shared lists; test fixtures are intentionally excluded. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', '_archive', 'tests']);
const ACTIVE_EXT = new Set(['.js', '.html', '.ts']);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), out);
      continue;
    }
    if (ACTIVE_EXT.has(path.extname(entry.name))) out.push(path.join(dir, entry.name));
  }
}

const files = [];
walk(ROOT, files);
const registrars = [];
const unsafe = [];
for (const file of files) {
  const rel = path.relative(ROOT, file).replaceAll('\\', '/');
  const src = fs.readFileSync(file, 'utf8');
  const calls = src.match(/initCloudSync\s*\(\s*\{[\s\S]{0,900}?\}\s*\)/gm) || [];
  for (const call of calls) {
    if (!/appKey\s*:\s*['\"]rpg['\"]/.test(call)) continue;
    registrars.push(rel);
    if (rel === 'xp.js') continue;
    const delegatesKeys = /syncedKeys\s*:\s*window\.RPG_SYNC_KEYS/.test(call);
    const delegatesPrefixes = /syncedPrefixes\s*:\s*window\.RPG_SYNC_PREFIXES/.test(call);
    if (!delegatesKeys || !delegatesPrefixes) unsafe.push(rel);
  }
}

assert.ok(registrars.includes('xp.js'), 'xp.js must keep the canonical RPG sync registration');
assert.equal(unsafe.length, 0, 'non-canonical RPG sync scope found in active source: ' + unsafe.join(', '));

const xp = fs.readFileSync(path.join(ROOT, 'xp.js'), 'utf8');
assert.match(xp, /window\.RPG_SYNC_KEYS\s*=\s*\[/, 'canonical RPG sync key list must stay centralized in xp.js');
assert.match(xp, /window\.RPG_SYNC_PREFIXES\s*=\s*\[/, 'canonical RPG sync prefix list must stay centralized in xp.js');
assert.equal((xp.match(/window\.RPG_SYNC_KEYS\s*=\s*\[/g) || []).length, 1, 'RPG sync key list should have one canonical definition');
assert.equal((xp.match(/window\.RPG_SYNC_PREFIXES\s*=\s*\[/g) || []).length, 1, 'RPG sync prefix list should have one canonical definition');

console.log('RPG sync authority smoke: ' + registrars.length + ' active registrar(s), all non-xp delegates use the canonical shared scope.');
