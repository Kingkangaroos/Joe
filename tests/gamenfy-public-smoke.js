const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const html = read('public/index.html');
const app = read('public/app.js');
const auth = read('auth.js');

new vm.Script(app, { filename: 'public/app.js' });
new vm.Script(auth, { filename: 'auth.js' });

assert(html.includes('Gamenfy · Public Beta'), 'public beta auth mark missing');
assert(html.includes('app.js?v=1'), 'public app script missing');
assert(!html.includes('auth.js'), 'public page must not load private auth.js');
assert(!html.includes('sync.js'), 'public page must not load private sync.js');
assert(!html.includes('fitbit-sync.js') && !html.includes('autohabit-reconcile.js'), 'public page must not load private health integrations');
assert(!html.includes('jarvis.js') && !html.includes('finance.js'), 'public page must not load private Jarvis/Finance integrations');
assert(app.includes("const TABLE = 'gamenfy_public_state'"), 'public state table contract missing');
assert(!app.includes("from('app_state')"), 'public app must never query private app_state');
assert(app.includes('gamenfy_public'), 'public account metadata marker missing');
assert(auth.includes("from('gamenfy_private_access')"), 'private allowlist guard missing');
assert(auth.includes("window.location.href = '/public/'"), 'private-to-public redirect missing');

const dirs = ['budgeting','sleep','nutrition','steps','teeth','household','meditation','gratitude','good-deed','screen-time','cold-shower'];
for (const dir of dirs) {
  for (const level of ['01','10']) {
    const file = path.join(root, 'img', 'lab', 'park31', dir, `l${level}.webp`);
    assert(fs.existsSync(file), `missing public companion asset ${dir}/l${level}.webp`);
  }
}

const missionKeys = ['budgeting','sleep','nutrition','walking','teeth','household','meditation','gratitude','good_deed','screen_time','cold_shower'];
for (const key of missionKeys) assert(app.includes(`key: '${key}'`), `mission ${key} missing`);

console.log('Gamenfy Public isolation, syntax, mission and asset smoke checks passed.');
