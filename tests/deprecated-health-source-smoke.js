/* Deprecated health source revival guard — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const forbidden = [
  'health_fitbit_intraday',
  '/functions/v1/fitbit-intraday',
  '/functions/v1/health-sync'
];
const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '_archive' || entry.name === 'tests') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(?:js|html|ts)$/.test(entry.name)) continue;
    const source = fs.readFileSync(full, 'utf8');
    for (const token of forbidden) {
      if (source.includes(token)) findings.push(`${path.relative(root, full)} -> ${token}`);
    }
  }
}

walk(root);
assert.deepEqual(findings, [], `active source must not revive deprecated health routes/row:\n${findings.join('\n')}`);

const setup = fs.readFileSync(path.join(root, 'FITBIT-SETUP.md'), 'utf8');
assert.match(setup, /`fitbit-intraday`.*HTTP 410/s, 'handoff records intraday route as a 410 stub');
assert.match(setup, /`health-sync`.*HTTP 410/s, 'handoff records health-sync route as a 410 stub');
assert.match(setup, /`app_state\.health_fitbit_intraday`.*historische data/s, 'handoff records old intraday row as inert legacy data');
assert.match(setup, /hoeft niet destructief verwijderd/, 'legacy row cleanup remains explicitly non-destructive');

console.log('Deprecated health source smoke passed: active source uses only current health_fitbit path and legacy routes stay inert/documented.');
