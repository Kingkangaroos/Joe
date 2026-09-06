/* Gamenfy app_state Stage 2A regression guard — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const sql = fs.readFileSync(path.join(root, 'server', 'database', 'app-state-write-gate-stage2a.sql'), 'utf8');
const executableSql = sql.replace(/--.*$/gm, '');

assert.match(sql, /^begin;/im);
assert.match(sql, /commit;\s*$/i);
assert.match(sql, /add column if not exists state_version bigint not null default 0/i);

assert.match(sql, /create or replace function public\.gamenfy_write_app_state\(/i);
assert.doesNotMatch(executableSql, /gamenfy_restore_app_state/i,
  'Stage 2A must not expose any restore RPC');

const fn = (executableSql.match(/create or replace function public\.gamenfy_write_app_state\([\s\S]*?\$\$;/i) || [])[0] || '';
assert.ok(fn, 'normal CAS writer must exist');
assert.match(fn, /security definer/i);
assert.match(fn, /set search_path = ''/i);
assert.match(fn, /v_uid uuid := \(select auth\.uid\(\)\)/i,
  'owner must be derived from authenticated server context');
assert.doesNotMatch(fn, /\bp_user_id\b|\bp_owner(?:_id)?\b/i,
  'caller may not supply an owner id');
assert.match(fn, /p_key not in \('rpg', 'finance', 'health'\)/i,
  'Stage 2A writer must be canonical-domain only');
assert.match(fn, /where s\.user_id = v_uid and s\.key = p_key[\s\S]*?for update/i,
  'existing owner row must be locked before CAS');
assert.match(fn, /v_generation <> p_expected_generation/i);
assert.match(fn, /v_version <> p_expected_version/i);
assert.match(fn, /state_version = s\.state_version \+ 1/i);
assert.match(fn, /insert into public\.app_state/i);
assert.doesNotMatch(fn, /on\s+conflict/i,
  'missing-baseline creation must not silently upsert over a concurrent creator');

assert.match(sql, /revoke execute on function public\.gamenfy_write_app_state[\s\S]*?from public;/i);
assert.match(sql, /revoke execute on function public\.gamenfy_write_app_state[\s\S]*?from anon;/i);
assert.match(sql, /grant execute on function public\.gamenfy_write_app_state[\s\S]*?to authenticated;/i);

assert.doesNotMatch(executableSql, /revoke\s+(?:insert|update|delete)[\s\S]*?on table public\.app_state/i,
  'Stage 2A is additive and must not lock old clients out yet');
assert.doesNotMatch(executableSql, /service_role/i,
  'Stage 2A must not alter service-role behavior');
assert.doesNotMatch(executableSql, /drop constraint|drop primary key|drop column/i,
  'Stage 2A must not perform destructive schema cutover');

console.log('app_state Stage 2A smoke passed: additive state_version + canonical owner-bound CAS writer only; restore, table revokes, service-role and PK cutover remain absent.');
