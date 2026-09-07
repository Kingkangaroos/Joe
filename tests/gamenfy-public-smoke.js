const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const html = read('gamenfy-public.html');
const app = read('gamenfy-public.js');
const feedback = read('gamenfy-public-feedback.js');
const auth = read('auth.js');
const vercel = JSON.parse(read('vercel.json'));
const feedbackMigration = read('supabase/migrations/20260907160300_add_gamenfy_public_feedback.sql');

new vm.Script(app, { filename: 'gamenfy-public.js' });
new vm.Script(feedback, { filename: 'gamenfy-public-feedback.js' });
new vm.Script(auth, { filename: 'auth.js' });

assert(html.includes('Gamenfy · Public Beta'), 'public beta auth mark missing');
assert(html.includes('/gamenfy-public.js?v=1'), 'public root app script missing');
assert(html.includes('/gamenfy-public-feedback.js?v=1'), 'public feedback script missing');
assert(html.includes('id="publicFeedbackForm"'), 'public feedback form missing');
assert(!html.includes('src="auth.js') && !html.includes('src="/auth.js'), 'public page must not load private auth.js');
assert(!html.includes('src="sync.js') && !html.includes('src="/sync.js'), 'public page must not load private sync.js');
assert(!html.includes('fitbit-sync.js') && !html.includes('autohabit-reconcile.js'), 'public page must not load private health integrations');
assert(!html.includes('jarvis.js') && !html.includes('finance.js'), 'public page must not load private Jarvis/Finance integrations');
assert(app.includes("const TABLE = 'gamenfy_public_state'"), 'public state table contract missing');
assert(!app.includes("from('app_state')"), 'public app must never query private app_state');
assert(app.includes("emailRedirectTo: window.location.origin + '/public'"), 'signup confirmation must return to stable public route');
assert(app.includes('gamenfy_public'), 'public account metadata marker missing');
assert(auth.includes('const PRIVATE_OWNER_ID = '), 'deterministic private owner gate missing');
assert(auth.includes('session.user.id !== PRIVATE_OWNER_ID'), 'private owner gate must compare the authenticated user id deterministically');
assert(!auth.includes("from('gamenfy_private_access')"), 'retired network allowlist lookup must not return');
assert(auth.includes("window.location.href = '/public/'"), 'private-to-public redirect missing');

assert(feedback.includes("const TABLE = 'gamenfy_public_feedback'"), 'feedback table contract missing');
assert(!feedback.includes("from('app_state')"), 'feedback module must never query private app_state');
assert(feedback.includes('session.user.id'), 'feedback insert must bind to authenticated user');
assert(feedbackMigration.includes('enable row level security'), 'feedback RLS missing');
assert(feedbackMigration.includes('(select auth.uid()) = user_id'), 'feedback owner RLS contract missing');

const rewrites = Array.isArray(vercel.rewrites) ? vercel.rewrites : [];
assert(vercel.outputDirectory === '.', 'Vercel must serve repository root so private and Public Beta can coexist');
assert(rewrites.some((r) => r.source === '/public' && r.destination === '/gamenfy-public.html'), 'stable /public rewrite missing');
assert(rewrites.some((r) => r.source === '/public/' && r.destination === '/gamenfy-public.html'), 'stable /public/ rewrite missing');

const dirs = ['budgeting','sleep','nutrition','steps','teeth','household','meditation','gratitude','good-deed','screen-time','cold-shower'];
for (const dir of dirs) {
  for (const level of ['01','10']) {
    const file = path.join(root, 'img', 'lab', 'park31', dir, `l${level}.webp`);
    assert(fs.existsSync(file), `missing public companion asset ${dir}/l${level}.webp`);
  }
}

const missionKeys = ['budgeting','sleep','nutrition','walking','teeth','household','meditation','gratitude','good_deed','screen_time','cold_shower'];
for (const key of missionKeys) assert(app.includes(`key: '${key}'`), `mission ${key} missing`);

console.log('Gamenfy Public route, deterministic private gate, isolation, feedback, syntax, mission and asset smoke checks passed.');
