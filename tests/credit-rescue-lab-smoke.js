const fs = require('fs');
const assert = require('assert');
const path = require('path');
const root = path.resolve(__dirname, '..');
const m = JSON.parse(fs.readFileSync(path.join(root, 'WEBSITE-VENTURES-CREDIT-RESCUE-2026-10-07.json'), 'utf8'));
assert.strictEqual(m.authorization.maxCredits, 544);
assert.strictEqual(m.creditsSpent, 544);
assert.strictEqual(m.endingBalance, 0);
assert.strictEqual(m.assets.length, 22);
assert.strictEqual(new Set(m.assets.map(a => a.jobId)).size, 22);
assert.strictEqual(m.assets.reduce((n, a) => n + a.credits, 0), 544);
assert.strictEqual(m.assets.filter(a => a.type === 'image').length, 14);
assert.strictEqual(m.assets.filter(a => a.type === 'video').length, 8);
assert.strictEqual(m.assets.filter(a => a.world === 'gamenfy').reduce((n, a) => n + a.credits, 0), 62);
for (const a of m.assets) {
  assert(a.prompt.length > 30 && a.purpose && a.sourceDescription && a.qa);
  assert.strictEqual(a.status, 'completed');
  assert(/^[a-f0-9-]{36}$/.test(a.jobId));
  for (const p of [a.webPath, a.previewPath, a.poster].filter(Boolean)) {
    assert(!p.includes('..'));
    assert(fs.statSync(path.join(root, p)).size > 500);
  }
}
const js = fs.readFileSync(path.join(root, 'website-ventures-credit-rescue-lab.js'), 'utf8');
assert(js.includes("v.preload = 'none'") && !js.includes('autoplay'));
assert(js.includes('visibilitychange') && js.includes('cancelAnimationFrame'));
assert(!/supabase|fetch\([^\n]+POST|localStorage\.setItem/.test(js));
assert(js.includes('textContent') && !js.includes('innerHTML'));
for (const file of ['lab.html', 'ventures-workspace.html']) assert(fs.readFileSync(path.join(root, file), 'utf8').includes('website-ventures-credit-rescue-lab.html'));
const vr = JSON.parse(fs.readFileSync(path.join(root, 'WEBSITE-VENTURES-RELEASES.json'), 'utf8'));
assert(vr.releases.some(r => r.id === '2026-10-07-credit-rescue'));
assert(vr.releases.some(r => r.id === '2026-10-01-ventures-research-credit-lab'));
console.log('credit rescue Lab: 22 assets, 544 credits, local files and safe playback verified');
