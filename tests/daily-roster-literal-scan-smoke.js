/* Repo-wide Daily Mission literal roster regression — ChatGPT (OpenAI)
   Detects stale explicit public-habit rosters in active source. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const CANON = ['budgeting','sleep','nutrition','walking','teeth','household','meditation','gratitude','good_deed','screen_time','cold_shower'];
const FORBIDDEN_PUBLIC = ['grounding','no_porn','weed_control','tennis','reading','whistling'];
const SKIP_DIRS = new Set(['.git', 'node_modules', '_archive']);
const ACTIVE_EXT = new Set(['.js', '.html', '.ts']);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), out);
      continue;
    }
    if (ACTIVE_EXT.has(path.extname(entry.name))) out.push(path.join(dir, entry.name));
  }
}

const files=[]; walk(ROOT,files);
const suspicious=[];
for (const file of files) {
  const rel=path.relative(ROOT,file).replaceAll('\\','/');
  if (rel.startsWith('tests/')) continue;
  const src=fs.readFileSync(file,'utf8');
  // Only inspect explicit arrays/maps that look like habit/public mission membership,
  // not ordinary copy or the canonical RPG_DEFAULT_SKILLS definitions themselves.
  const lower=src.toLowerCase();
  if (!/(habit|daily mission|daily_mission|public.*mission|mission.*public)/.test(lower)) continue;
  const hasCanon = CANON.filter(k => new RegExp(`['\"]${k}['\"]`).test(src));
  const bad = FORBIDDEN_PUBLIC.filter(k => new RegExp(`['\"]${k}['\"]`).test(src));
  if (bad.length && hasCanon.length >= 2 && rel !== 'xp.js' && rel !== 'park31-lab.js') {
    suspicious.push({rel,bad,canonCount:hasCanon.length});
  }
}

assert.equal(suspicious.length,0,'possible stale explicit Daily Mission roster(s): '+JSON.stringify(suspicious));
console.log('Daily Mission roster scan: no obvious stale public roster literals in active source.');
