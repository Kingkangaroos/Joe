/* Authenticated cross-surface Fitbit reconciler loader smoke — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'auth.js'), 'utf8');

function tick() { return new Promise((resolve) => setImmediate(resolve)); }

async function runScenario(opts) {
  opts = opts || {};
  const appended = [];
  const windowListeners = {};
  const documentListeners = {};
  const session = { user: { id: 'owner-1', email: 'owner@example.test' }, access_token: 'session-token' };

  const client = {
    auth: {
      onAuthStateChange() {},
      getSession() { return Promise.resolve({ data: { session }, error: null }); },
      signOut() { return Promise.resolve(); },
      signUp() { return Promise.resolve({ data: {}, error: null }); },
      signInWithPassword() { return Promise.resolve({ data: { session }, error: null }); }
    }
  };

  function createElement(tag) {
    return {
      tagName: String(tag || '').toUpperCase(),
      id: '', dataset: {}, style: {}, textContent: '', innerHTML: '', removed: false,
      addEventListener() {}, setAttribute() {}, appendChild() {}, remove() { this.removed = true; }
    };
  }

  const sandboxWindow = {
    supabase: { createClient: () => client },
    __cloudSyncRegistry: opts.rpgSync ? { rpg: true } : {},
    __gamenfyAutohabitLoaderInstalled: !!opts.mainOwnsLoader,
    addEventListener(type, fn) { windowListeners[type] = fn; },
    dispatchEvent(event) {
      const fn = windowListeners[event.type];
      if (fn) fn(event);
      return true;
    },
    location: { reload() {} }
  };
  if (opts.engine) {
    sandboxWindow.recomputeHabitFromLog = () => {};
    sandboxWindow.getCharacter = () => ({ xpLog: [] });
    sandboxWindow.addXP = () => {};
  }

  const document = {
    body: null,
    documentElement: { style: {} },
    head: { appendChild(el) { appended.push(el); return el; } },
    getElementById() { return null; },
    createElement,
    querySelector() { return null; },
    addEventListener(type, fn) { documentListeners[type] = fn; }
  };

  class CustomEventStub {
    constructor(type, init) { this.type = type; this.detail = (init && init.detail) || {}; }
  }

  const sandbox = {
    window: sandboxWindow,
    document,
    CustomEvent: CustomEventStub,
    Promise,
    Object,
    String,
    Error,
    Math,
    console,
    fetch: () => Promise.resolve({}),
    confirm: () => false,
    setTimeout: () => 1,
    clearTimeout: () => {}
  };

  vm.runInNewContext(source, sandbox, { filename: 'auth.js' });
  await tick();
  await tick();
  return { appended, windowListeners, window: sandboxWindow };
}

(async () => {
  {
    const state = await runScenario({ rpgSync: true, engine: true });
    let scripts = state.appended.filter((el) => el.tagName === 'SCRIPT');
    assert.equal(scripts.length, 1, 'authenticated RPG surfaces load exactly one retrospective reconciler');
    assert.equal(scripts[0].src, 'autohabit-reconcile.js?v=11.9');
    assert.equal(scripts[0].dataset.gamenfyAutohabitReconcile, '1');
    assert.equal(state.window.__gamenfyAutohabitSessionLoaderLoaded, undefined, 'loader does not claim success before script.onload');

    state.windowListeners['gamenfy:cloud-sync-ready']({ detail: { appKey: 'rpg' } });
    scripts = state.appended.filter((el) => el.tagName === 'SCRIPT');
    assert.equal(scripts.length, 1, 'cloud-ready event cannot double-inject while reconciler script is still loading');

    scripts[0].onload();
    assert.equal(state.window.__gamenfyAutohabitSessionLoaderLoaded, true, 'session loader records ownership only after successful script load');
    state.windowListeners['gamenfy:cloud-sync-ready']({ detail: { appKey: 'rpg' } });
    assert.equal(state.appended.filter((el) => el.tagName === 'SCRIPT').length, 1, 'successful load remains deduplicated');
  }

  {
    const state = await runScenario({ rpgSync: true, engine: true });
    let scripts = state.appended.filter((el) => el.tagName === 'SCRIPT');
    assert.equal(scripts.length, 1, 'first reconciler request is injected');
    scripts[0].onerror();
    assert.equal(scripts[0].removed, true, 'failed script node is removed so it cannot block a retry');
    assert.equal(state.window.__gamenfyAutohabitSessionLoaderLoaded, undefined, 'failed network load never claims reconciler ownership');

    state.windowListeners['gamenfy:cloud-sync-ready']({ detail: { appKey: 'rpg' } });
    scripts = state.appended.filter((el) => el.tagName === 'SCRIPT');
    assert.equal(scripts.length, 2, 'a later readiness signal retries the reconciler after script failure');
    scripts[1].onload();
    assert.equal(state.window.__gamenfyAutohabitSessionLoaderLoaded, true, 'retry can become the successful owner');
  }

  {
    const state = await runScenario({ rpgSync: false, engine: false });
    assert.equal(state.appended.filter((el) => el.tagName === 'SCRIPT').length, 0, 'utility/non-RPG pages never become Daily Mission writers');
  }

  {
    const state = await runScenario({ rpgSync: true, engine: true, mainOwnsLoader: true });
    assert.equal(state.appended.filter((el) => el.tagName === 'SCRIPT').length, 0, 'Main synchronous blocker remains sole loader owner on Main');
  }

  assert.match(source, /__cloudSyncRegistry && window\.__cloudSyncRegistry\.rpg/, 'loader requires RPG cloud sync registration');
  assert.match(source, /typeof window\.recomputeHabitFromLog === 'function'/, 'loader requires authoritative replay engine');
  assert.match(source, /typeof window\.getCharacter === 'function'/, 'loader requires character audit engine');
  assert.match(source, /typeof window\.addXP === 'function'/, 'loader requires XP writer before reconciliation');
  assert.match(source, /script\.onerror = \(\) =>/, 'loader handles script network failure explicitly');
  assert.match(source, /script\.onload = \(\) =>/, 'loader marks success only after script load');

  // Main boot race contract: all three are deferred, xp.js waits for DOMContentLoaded
  // before starting RPG sync, while checkin.js executes as a deferred script before
  // that event and installs __gamenfyAutohabitLoaderInstalled synchronously.
  const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const xp = fs.readFileSync(path.join(__dirname, '..', 'xp.js'), 'utf8');
  const authTag = index.match(/<script src="auth\.js[^>]*><\/script>/)[0];
  const xpTag = index.match(/<script src="xp\.js[^>]*><\/script>/)[0];
  const checkinTag = index.match(/<script src="checkin\.js[^>]*><\/script>/)[0];
  assert.match(authTag, /\bdefer\b/, 'Main auth loader stays deferred');
  assert.match(xpTag, /\bdefer\b/, 'Main RPG engine stays deferred');
  assert.match(checkinTag, /\bdefer\b/, 'Main synchronous legacy blocker stays deferred');
  assert.ok(index.indexOf(authTag) < index.indexOf(xpTag) && index.indexOf(xpTag) < index.indexOf(checkinTag), 'Main keeps auth -> xp -> checkin deferred execution order');
  assert.match(xp, /document\.readyState==='loading'\) document\.addEventListener\('DOMContentLoaded', initRPGSync\)/, 'RPG sync cannot start before deferred checkin.js installs Main loader ownership');

  console.log('Authenticated Fitbit reconciliation loader smoke passed: cross-surface load, retry after network failure, utility-page block, Main dedupe and boot ordering.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});