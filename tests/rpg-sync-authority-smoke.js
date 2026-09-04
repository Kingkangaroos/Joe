/* Repo-wide RPG sync authority regression — ChatGPT (OpenAI)
   Ensures xp.js remains the only active source that registers appKey='rpg'. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', '_archive']);
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
const hits = [];
for (const file of files) {
  const rel = path.relative(ROOT, file).replaceAll('\\', '/');
  const src = fs.readFileSync(file, 'utf8');
  if (!/initCloudSync\s*\(\s*\{[\s\S]{0,700}?appKey\s*:\s*['\"]rpg['\"]/m.test(src)) continue;
  hits.push(rel);
}

assert.deepEqual(hits, ['xp.js'], 'xp.js must remain the sole active RPG whole-row sync registrar; found: ' + hits.join(', '));

const xp = fs.readFileSync(path.join(ROOT, 'xp.js'), 'utf8');
assert.match(xp, /window\.RPG_SYNC_KEYS\s*=\s*\[/, 'canonical RPG sync key list must stay centralized in xp.js');
assert.match(xp, /window\.RPG_SYNC_PREFIXES\s*=\s*\[/, 'canonical RPG sync prefix list must stay centralized in xp.js');
assert.match(xp, /appKey\s*:\s*['\"]rpg['\"]/, 'xp.js must continue registering the rpg app key');

console.log('RPG sync authority smoke: xp.js is the only active whole-row RPG sync registrar.');
