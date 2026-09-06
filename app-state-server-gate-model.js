// Gamenfy app_state server write-gate model — analysis only
// Performed-by: ChatGPT (OpenAI), 2026-09-06
//
// Pure JS mirror of the proposed database contract. It intentionally performs
// NO network/database writes. Tests use it to prove CAS + restore invariants
// before any SQL is ever considered for production.
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.GamenfyAppStateServerGateModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CANONICAL = Object.freeze(['rpg', 'finance', 'health']);
  const SENSITIVE = new Set(['hevy_api_key', 'rpg_pin_v1']);

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function asObject(v, label) {
    if (!v || typeof v !== 'object' || Array.isArray(v)) {
      throw new Error((label || 'payload') + ':json-object-required');
    }
    return clone(v);
  }

  function asInt(v, label) {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0) throw new Error((label || 'value') + ':nonnegative-integer-required');
    return n;
  }

  function assertNoSensitive(obj, label) {
    for (const key of Object.keys(obj)) {
      if (SENSITIVE.has(key)) throw new Error((label || 'payload') + ':sensitive-key-blocked:' + key);
    }
  }

  function normalizeRow(row, key) {
    if (!row) {
      return { key, data: {}, restore_generation: 0, state_version: 0, missing: true };
    }
    return {
      key,
      data: asObject(row.data || {}, key + '.data'),
      restore_generation: asInt(row.restore_generation || 0, key + '.restore_generation'),
      state_version: asInt(row.state_version || 0, key + '.state_version'),
      missing: false,
    };
  }

  function writeRow(currentRow, request) {
    request = request || {};
    const key = String(request.key || '').trim();
    if (!key) throw new Error('write:key-required');
    const data = asObject(request.data, 'write.data');
    const expectedGeneration = asInt(request.expectedGeneration, 'write.expectedGeneration');
    const expectedVersion = asInt(request.expectedVersion, 'write.expectedVersion');
    const current = normalizeRow(currentRow, key);

    if (current.missing && (expectedGeneration !== 0 || expectedVersion !== 0)) {
      throw new Error('write:missing-baseline-mismatch');
    }
    if (!current.missing && current.restore_generation !== expectedGeneration) {
      throw new Error('write:restore-generation-conflict');
    }
    if (!current.missing && current.state_version !== expectedVersion) {
      throw new Error('write:state-version-conflict');
    }

    return {
      key,
      data,
      restore_generation: expectedGeneration,
      state_version: current.state_version + 1,
      missing: false,
    };
  }

  function restoreRows(inputRows, request) {
    request = request || {};
    const strategy = request.strategy;
    if (strategy !== 'merge' && strategy !== 'overwrite') throw new Error('restore:strategy-invalid');
    const expectedGeneration = asInt(request.expectedGeneration, 'restore.expectedGeneration');
    const expectedVersions = request.expectedVersions || {};
    const payloads = request.payloads || {};

    // Work on a detached snapshot. If any precondition fails, caller's input is
    // untouched — mirroring one PostgreSQL transaction that rolls back entirely.
    const before = {};
    for (const key of CANONICAL) before[key] = normalizeRow(inputRows && inputRows[key], key);

    const desired = {};
    for (const key of CANONICAL) {
      const current = before[key];
      const expectedVersion = asInt(expectedVersions[key], 'restore.' + key + '.expectedVersion');
      const incoming = asObject(payloads[key], 'restore.' + key + '.payload');
      assertNoSensitive(incoming, 'restore.' + key);

      // A restore plan is valid only against three concrete cloud baselines.
      // Allowing an absent row creates an insert-vs-restore race because there is
      // no row to lock. Missing canonical rows must first be initialized through
      // the normal write gate, then the user re-previews/reconfirms the restore.
      if (current.missing) {
        throw new Error('restore:' + key + ':baseline-missing');
      }
      if (current.restore_generation !== expectedGeneration) {
        throw new Error('restore:' + key + ':generation-conflict');
      }
      if (current.state_version !== expectedVersion) {
        throw new Error('restore:' + key + ':version-conflict');
      }

      desired[key] = strategy === 'merge'
        ? Object.assign({}, current.data, incoming)
        : incoming;
    }

    const newGeneration = expectedGeneration + 1;
    const rows = {};
    for (const key of CANONICAL) {
      rows[key] = {
        key,
        data: desired[key],
        restore_generation: newGeneration,
        state_version: before[key].state_version + 1,
        missing: false,
      };
    }

    return { newGeneration, rows };
  }

  return Object.freeze({
    CANONICAL,
    writeRow,
    restoreRows,
  });
});
