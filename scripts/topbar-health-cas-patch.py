from pathlib import Path

p = Path('topbar.js')
s = p.read_text()
old = '''  async function pushWaterMergedToSupabase(localWater) {
    if (window.location.pathname.endsWith('/health.html') ||
        window.location.pathname.endsWith('health.html')) return;
    if (!window.gamenfySupabase || !window.gamenfyUserId) return;
    if (TOPBAR_SUPABASE_URL.indexOf('PASTE-') === 0) return;
    try {
      const supa = window.gamenfySupabase;
      const { data } = await supa
        .from('app_state').select('data').eq('key', 'health').maybeSingle();
      const current = (data && data.data) || {};
      const merged = Object.assign({}, current, { po_water_v1: localWater });
      await supa.from('app_state').upsert(
        { key: 'health', user_id: window.gamenfyUserId, data: merged, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    } catch (e) {}
  }
'''
new = '''  function normalizeCloudCounter(value) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  }
  function isCloudCasConflict(error) {
    if (!error) return false;
    const code = String(error.code || '');
    const message = String(error.message || '');
    return code === '40001' || code === '23505' || /conflict|duplicate/i.test(message);
  }
  function mergeQuickWater(remoteState, localWater) {
    const remoteWater = remoteState && remoteState.po_water_v1 && typeof remoteState.po_water_v1 === 'object'
      ? remoteState.po_water_v1
      : null;
    if (!remoteWater) return localWater;

    // Quick Water is an increment action, not a full Health editor. Preserve
    // the server's profile/settings and only merge today's counter upward so
    // two devices (or two rapid taps) cannot make the count go backwards.
    const day = calendarDateKey();
    const next = Object.assign({}, remoteWater);
    next.logs = Object.assign({}, remoteWater.logs || {});
    const remoteCount = Number(next.logs[day] || 0);
    const localCount = Number(localWater && localWater.logs && localWater.logs[day] || 0);
    next.logs[day] = Math.max(
      Number.isFinite(remoteCount) ? remoteCount : 0,
      Number.isFinite(localCount) ? localCount : 0
    );
    return next;
  }
  async function pushWaterMergedToSupabase(localWater) {
    if (window.location.pathname.endsWith('/health.html') ||
        window.location.pathname.endsWith('health.html')) return;
    if (!window.gamenfySupabase || !window.gamenfyUserId) return;
    if (TOPBAR_SUPABASE_URL.indexOf('PASTE-') === 0) return;

    const supa = window.gamenfySupabase;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data, error } = await supa
          .from('app_state')
          .select('data,restore_generation,state_version')
          .eq('key', 'health')
          .eq('user_id', window.gamenfyUserId)
          .maybeSingle();
        if (error || !data) return;

        const current = (data.data && typeof data.data === 'object') ? data.data : {};
        const nextWater = mergeQuickWater(current, localWater);
        const merged = Object.assign({}, current, { po_water_v1: nextWater });
        const { error: writeError } = await supa.rpc('gamenfy_write_app_state', {
          p_key: 'health',
          p_data: merged,
          p_expected_generation: normalizeCloudCounter(data.restore_generation),
          p_expected_version: normalizeCloudCounter(data.state_version),
        });
        if (!writeError) {
          try {
            const localDayCount = Number(localWater && localWater.logs && localWater.logs[calendarDateKey()] || 0);
            const mergedDayCount = Number(nextWater && nextWater.logs && nextWater.logs[calendarDateKey()] || 0);
            if (mergedDayCount > localDayCount) {
              localStorage.setItem('po_water_v1', JSON.stringify(nextWater));
              render();
            }
          } catch (e) {}
          return;
        }
        if (!isCloudCasConflict(writeError)) return;
        // Another canonical Health writer won. Fresh-pull, re-merge only the
        // monotone water counter, then retry against its new version.
      } catch (e) { return; }
    }
  }
'''
if s.count(old) != 1:
    raise SystemExit(f'expected one legacy Quick Water block, found {s.count(old)}')
p.write_text(s.replace(old, new, 1))

test = r'''/* Quick Water canonical Health write gate — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','topbar.js'),'utf8');
const start=source.indexOf('function normalizeCloudCounter(');
const end=source.indexOf('function addWater()',start);
assert.ok(start>=0 && end>start,'Quick Water CAS block must be discoverable');
const block=source.slice(start,end);
assert.ok(block.includes(".select('data,restore_generation,state_version')"),'Quick Water must read CAS watermarks');
assert.ok(block.includes(".eq('key', 'health')"),'Quick Water read must target canonical Health');
assert.ok(block.includes(".eq('user_id', window.gamenfyUserId)"),'Quick Water read must be explicitly owner-scoped');
assert.ok(block.includes("supa.rpc('gamenfy_write_app_state'"),'Quick Water must use canonical server writer');
assert.ok(block.includes("p_key: 'health'"));
assert.ok(block.includes('p_expected_generation: normalizeCloudCounter(data.restore_generation)'));
assert.ok(block.includes('p_expected_version: normalizeCloudCounter(data.state_version)'));
assert.ok(block.includes('for (let attempt = 0; attempt < 3; attempt++)'),'CAS conflict must get bounded retries');
assert.ok(block.includes('if (!isCloudCasConflict(writeError)) return;'),'only CAS conflicts are retried');
assert.ok(block.includes('Math.max('),'Quick Water counter merge must be monotone across concurrent writers');
assert.ok(block.includes('Object.assign({}, remoteWater)'),'remote Health water settings must be preserved');
assert.ok(!block.includes(".from('app_state').upsert("),'Quick Water must not bypass CAS with a direct upsert');
assert.ok(!block.includes('user_id:'),'RPC write payload must derive owner from auth context');
console.log('topbar Health CAS smoke passed: Quick Water is owner-scoped, conflict-safe and cannot lower a concurrent water count.');
'''
Path('tests/topbar-health-cas-smoke.js').write_text(test)
print('Quick Water CAS patch staged.')
