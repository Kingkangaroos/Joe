// Test 1.1 — lightweight source regression checks.
// Run with: node tests/scroll-site-1-1-smoke.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'site-klus-scroll-1-1.html');
const html = fs.readFileSync(file, 'utf8');

const checks = [
  ['content-first page exists', /Test 1\.1|content-first/i],
  ['hero has immediate CTA', /Bespreek je project/],
  ['sticky persistent visual exists', /visual-col[^}]*position:sticky/],
  ['five readable story beats exist', (html.match(/class="beat"/g) || []).length === 5],
  ['photoreal final image is used', /images\.unsplash\.com\/photo-1756079664354-34944e001f6d/],
  ['scroll drives one shared story progress', /--story/],
  ['blueprint stage exists', /class="blueprint"/],
  ['rough construction stage exists', /class="rough"/],
  ['surface stage exists', /class="surface"/],
  ['final photo stage exists', /class="photo"/],
  ['pencil still follows SVG path', /getPointAtLength/],
  ['reduced motion supported', /prefers-reduced-motion/],
  ['no giant 460svh cinematic wrapper', !/height:\s*460svh/.test(html)],
];

let failed = 0;
for (const [name, result] of checks) {
  const ok = typeof result === 'boolean' ? result : result.test(html);
  console.log(`${ok ? '✓' : '✗'} ${name}`);
  if (!ok) failed++;
}
if (failed) {
  console.error(`\n${failed} Test 1.1 smoke check(s) failed.`);
  process.exit(1);
}
console.log('\nTest 1.1 source checks passed.');
