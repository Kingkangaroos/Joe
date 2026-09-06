/* app_state server write-gate + atomic restore contract — ChatGPT (OpenAI), 2026-09-06 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const model = require(path.join(root, 'app-state-server-gate-model.js'));
const sql = fs.readFileSync(path.join(root, 'server', 'database', 'app-state-generation-write-gate-contract.sql'), 'utf8');

function row(key, data, generation, version) {
  return { key, data, restore_generation: generation, state_version: version };
}

// ── Executable normal-write CAS model ──────────────────────────────────────
{
  const next = model.writeRow(row('rpg', { a: 1 }, 3, 8), {
    key: 'rpg', data: { a: 2 }, expectedGeneration: 3, expectedVersion: 8,
  });
  assert.equal(next.restore_generation, 3, 'normal write must stay in the same restore epoch');
  assert.equal(next.state_version, 9, 'normal write must advance per-row state_version');
  assert.deepEqual(next.data, { a: 2 });
}

assert.throws(() => model.writeRow(row('rpg', { a: 1 }, 4, 9), {
  key: 'rpg', data: { a: 2 }, expectedGeneration: 3, expectedVersion: 9,
}), /restore-generation-conflict/, 'old client generation must be rejected after a restore bump');

assert.throws(() => model.writeRow(row('rpg', { a: 1 }, 4, 10), {
  key: 'rpg', data: { a: 2 }, expectedGeneration: 4, expectedVersion: 9,
}), /state-version-conflict/, 'same-generation concurrent stale write must be rejected');

{
  const inserted = model.writeRow(null, {
    key: 'health', data: { first: true }, expectedGeneration: 0, expectedVersion: 0,
  });
  assert.equal(inserted.restore_generation, 0);
  assert.equal(inserted.state_version, 1);
  assert.deepEqual(inserted.data, { first: true });
}

assert.throws(() => model.writeRow(null, {
  key: 'health', data: {}, expectedGeneration: 1, expectedVersion: 0,
}), /missing-baseline-mismatch/);

// ── Executable atomic restore model ─────────────────────────────────────────
const baseline = {
  rpg: row('rpg', { keep: 'r', replace: 'old' }, 5, 12),
  finance: row('finance', { keep: 'f', replace: 'old' }, 5, 7),
  health: row('health', { keep: 'h', replace: 'old' }, 5, 4),
};

{
  const result = model.restoreRows(baseline, {
    strategy: 'merge',
    expectedGeneration: 5,
    expectedVersions: { rpg: 12, finance: 7, health: 4 },
    payloads: {
      rpg: { replace: 'new', added: 1 },
      finance: { replace: 'new' },
      health: { added: 3 },
    },
  });
  assert.equal(result.newGeneration, 6);
  for (const key of model.CANONICAL) {
    assert.equal(result.rows[key].restore_generation, 6, key + ' must advance to the shared restore generation');
  }
  assert.equal(result.rows.rpg.state_version, 13);
  assert.equal(result.rows.finance.state_version, 8);
  assert.equal(result.rows.health.state_version, 5);
  assert.deepEqual(result.rows.rpg.data, { keep: 'r', replace: 'new', added: 1 }, 'merge must preserve absent current keys');
  assert.deepEqual(result.rows.health.data, { keep: 'h', replace: 'old', added: 3 });
}

{
  const result = model.restoreRows(baseline, {
    strategy: 'overwrite',
    expectedGeneration: 5,
    expectedVersions: { rpg: 12, finance: 7, health: 4 },
    payloads: {
      rpg: { replace: 'new' },
      finance: {},
      health: { only: 'incoming' },
    },
  });
  assert.deepEqual(result.rows.rpg.data, { replace: 'new' }, 'overwrite must remove current keys absent from incoming data');
  assert.deepEqual(result.rows.finance.data, {});
  assert.deepEqual(result.rows.health.data, { only: 'incoming' });
}

{
  const before = JSON.stringify(baseline);
  assert.throws(() => model.restoreRows(baseline, {
    strategy: 'merge',
    expectedGeneration: 5,
    expectedVersions: { rpg: 12, finance: 999, health: 4 },
    payloads: { rpg: {}, finance: {}, health: {} },
  }), /finance:version-conflict/);
  assert.equal(JSON.stringify(baseline), before, 'one stale domain must reject the whole restore without mutating the input snapshot');
}

assert.throws(() => model.restoreRows({
  rpg: row('rpg', {}, 5, 12),
  finance: row('finance', {}, 4, 7),
  health: row('health', {}, 5, 4),
}, {
  strategy: 'merge',
  expectedGeneration: 5,
  expectedVersions: { rpg: 12, finance: 7, health: 4 },
  payloads: { rpg: {}, finance: {}, health: {} },
}), /finance:generation-conflict/, 'one domain in another restore epoch must abort the complete restore');

assert.throws(() => model.restoreRows(baseline, {
  strategy: 'merge',
  expectedGeneration: 5,
  expectedVersions: { rpg: 12, finance: 7, health: 4 },
  payloads: { rpg: { hevy_api_key: 'blocked' }, finance: {}, health: {} },
}), /sensitive-key-blocked:hevy_api_key/);

assert.throws(() => model.restoreRows(baseline, {
  strategy: 'overwrite',
  expectedGeneration: 5,
  expectedVersions: { rpg: 12, finance: 7, health: 4 },
  payloads: { rpg: { rpg_pin_v1: 'blocked' }, finance: {}, health: {} },
}), /sensitive-key-blocked:rpg_pin_v1/);

{
  const restored = model.restoreRows(baseline, {
    strategy: 'merge',
    expectedGeneration: 5,
    expectedVersions: { rpg: 12, finance: 7, health: 4 },
    payloads: { rpg: { restored: true }, finance: {}, health: {} },
  });
  assert.equal(restored.rows.rpg.restore_generation, 6);
  assert.throws(() => model.writeRow(restored.rows.rpg, {
    key: 'rpg', data: { oldDevice: true }, expectedGeneration: 5, expectedVersion: 13,
  }), /restore-generation-conflict/, 'pre-restore PWA generation must not overwrite the restored epoch');
}

// ── SQL design/staging/security contract ────────────────────────────────────
assert.match(sql, /STATUS: DESIGN \/ REGRESSION CONTRACT ONLY — DO NOT APPLY TO PRODUCTION/i);
assert.match(sql, /^begin;/im);
assert.match(sql, /rollback;\s*$/i, 'design SQL must be non-persistent when accidentally executed as a whole file');
assert.match(sql, /add column if not exists state_version bigint not null default 0/i);

assert.match(sql, /create or replace function public\.gamenfy_write_app_state\(/i);
assert.match(sql, /create or replace function public\.gamenfy_restore_app_state_v1\(/i);
const fnBlocks = sql.match(/create or replace function[\s\S]*?\$\$;/gi) || [];
assert.equal(fnBlocks.length, 2, 'contract must contain exactly the normal-write gate and atomic restore RPC');
for (const block of fnBlocks) {
  assert.match(block, /security definer/i);
  assert.match(block, /set search_path = ''/i);
  assert.match(block, /v_uid uuid := \(select auth\.uid\(\)\)/i, 'owner must come from authenticated server context');
}

assert.doesNotMatch(sql, /\bp_user_id\b|\bp_owner(?:_id)?\b/i, 'no RPC may accept a caller-supplied owner identity');
assert.match(sql, /where s\.user_id = v_uid and s\.key = p_key[\s\S]*?for update/i);
assert.match(sql, /v_generation <> p_expected_generation/i);
assert.match(sql, /v_version <> p_expected_version/i);
assert.match(sql, /state_version = s\.state_version \+ 1/i);

assert.match(sql, /s\.key in \('finance', 'health', 'rpg'\)[\s\S]*?order by s\.key[\s\S]*?for update/i,
  'restore must lock canonical rows in deterministic order');
assert.match(sql, /v_new_generation := p_expected_generation \+ 1/i);
assert.match(sql, /on conflict \(user_id, key\) do update/ig);
assert.ok((sql.match(/on conflict \(user_id, key\) do update/ig) || []).length >= 3,
  'restore must use composite owner/key conflict target for all canonical domains');
for (const key of ['rpg', 'finance', 'health']) {
  assert.match(sql, new RegExp("values \\('" + key + "', v_uid,"), 'restore must write ' + key + ' owner row');
}
assert.match(sql, /p_rpg \? 'hevy_api_key'/i);
assert.match(sql, /p_rpg \? 'rpg_pin_v1'/i);

assert.match(sql, /revoke execute on function public\.gamenfy_write_app_state[\s\S]*?from public;/i);
assert.match(sql, /revoke execute on function public\.gamenfy_write_app_state[\s\S]*?from anon;/i);
assert.match(sql, /grant execute on function public\.gamenfy_write_app_state[\s\S]*?to authenticated;/i);
assert.match(sql, /revoke execute on function public\.gamenfy_restore_app_state_v1[\s\S]*?from public;/i);
assert.match(sql, /revoke execute on function public\.gamenfy_restore_app_state_v1[\s\S]*?from anon;/i);
assert.match(sql, /grant execute on function public\.gamenfy_restore_app_state_v1[\s\S]*?to authenticated;/i);

assert.match(sql, /revoke insert, update, delete on table public\.app_state from authenticated;/i,
  'final browser cutover must close the direct-write bypass after RPC rollout');
assert.match(sql, /grant select on table public\.app_state to authenticated;/i);
assert.doesNotMatch(sql, /revoke[^;]*service_role/i, 'design must not casually change service-role grants');

console.log('app_state server write-gate smoke passed: executable model rejects stale generations/versions and the SQL contract is auth-bound, CAS-gated, atomic, rollback-only and staged to close direct browser writes.');
