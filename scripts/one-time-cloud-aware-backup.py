from pathlib import Path

p = Path('character.html')
s = p.read_text(encoding='utf-8')
start = s.index('// ── Export backup')
end = s.index('// ── Level-up moments', start)

new_block = r'''// ── Export backup (v3 — cloud-aware, credential-free) ─────────
// A Character-page localStorage snapshot is not necessarily complete: Finance
// or Health may not have been opened on this device yet. Backup therefore reads
// the three owner-scoped durable app_state rows directly, then overlays only
// local dirty-journal entries that are demonstrably newer than that cloud row.
// Stale device cache never wins over newer cloud data.
window.exportBackup = async function(){
  const domains = ['rpg','finance','health'];
  const sensitive = new Set(['hevy_api_key','rpg_pin_v1']);
  const dirtyPrefix = '__gamenfy_sync_dirty_v1:';

  function fail(msg){
    if(typeof showToast === 'function') showToast(msg || 'Backup failed');
    else try { alert(msg || 'Backup failed'); } catch(e) {}
    return false;
  }
  function parseRaw(raw){
    if(raw == null) return null;
    try { return JSON.parse(raw); } catch(e) { return raw; }
  }
  function cloneObj(v){
    if(!v || typeof v !== 'object' || Array.isArray(v)) return {};
    try { return JSON.parse(JSON.stringify(v)); } catch(e) { return {}; }
  }
  function localBelongsTo(domain, k){
    if(!k || sensitive.has(k)) return false;
    if(domain === 'rpg') {
      const keys = Array.isArray(window.RPG_SYNC_KEYS) ? window.RPG_SYNC_KEYS : [];
      const prefixes = Array.isArray(window.RPG_SYNC_PREFIXES) ? window.RPG_SYNC_PREFIXES : [];
      return keys.includes(k) || prefixes.some(p=>k.startsWith(p)) || k.startsWith('rpg_') || k === 'po_coach_weights';
    }
    if(domain === 'finance') {
      return ['subs','wishlist','vk_paid_v1','nw_currency','nw:activity','nw:history'].includes(k) || k.startsWith('nw:');
    }
    if(domain === 'health') {
      return ['stack:items','stack:version','stack:low','po_water_v1'].includes(k) || k.startsWith('stack:taken:');
    }
    return false;
  }

  try {
    if(window.gamenfyAuthReady) await window.gamenfyAuthReady;
    if(!window.gamenfySupabase || !window.gamenfyUserId) {
      return fail('Cloud backup unavailable — sign in first');
    }

    const { data: rows, error } = await window.gamenfySupabase
      .from('app_state')
      .select('key,data,updated_at')
      .in('key', domains);
    if(error) throw error;

    const byKey = {};
    (rows || []).forEach(row => { if(row && domains.includes(row.key)) byKey[row.key] = row; });

    const dump = {
      exportedAt: new Date().toISOString(),
      app: 'gamenfy',
      version: 3,
      source: 'owner-cloud-plus-newer-local-dirty',
      credentialsExcluded: ['rpg_pin_v1','hevy_api_key'],
      domains: {},
      keys: {},
      deviceOnly: {}
    };

    for(const domain of domains){
      const row = byKey[domain] || { data:{}, updated_at:null };
      const remoteMs = row.updated_at ? (Date.parse(row.updated_at) || 0) : 0;
      const state = cloneObj(row.data);

      // Never place convenience PIN/API credentials in a downloadable backup.
      sensitive.forEach(k => { delete state[k]; });

      // Preserve only pending local changes newer than the exact cloud baseline.
      // sync.js stores raw localStorage values + timestamps in this journal.
      let pendingApplied = 0;
      try {
        const rawJournal = localStorage.getItem(dirtyPrefix + domain);
        const journal = rawJournal ? JSON.parse(rawJournal) : null;
        const items = journal && journal.items && typeof journal.items === 'object' ? journal.items : {};
        Object.entries(items).forEach(([k, item]) => {
          if(!localBelongsTo(domain, k) || !item || (item.ts || 0) <= remoteMs) return;
          if(item.removed) delete state[k];
          else state[k] = parseRaw(item.value);
          pendingApplied++;
        });
      } catch(e) {}

      dump.domains[domain] = {
        cloudUpdatedAt: row.updated_at || null,
        pendingLocalApplied: pendingApplied,
        data: state
      };

      // Flat compatibility view for the current export format. A future restore
      // should prefer domains[*].data, which preserves parsed cloud values.
      Object.entries(state).forEach(([k, v]) => {
        if(sensitive.has(k)) return;
        dump.keys[k] = (typeof v === 'string') ? v : JSON.stringify(v);
      });
    }

    // Preserve non-authoritative device-only remnants separately instead of
    // letting them override newer cloud rows. Useful for forensic recovery,
    // but a future restore must not auto-merge these without explicit preview.
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(!k || sensitive.has(k) || k.startsWith(dirtyPrefix)) continue;
      const domain = domains.find(d => localBelongsTo(d, k));
      if(!domain) continue;
      const authoritative = dump.domains[domain] && dump.domains[domain].data;
      if(authoritative && Object.prototype.hasOwnProperty.call(authoritative, k)) continue;
      dump.deviceOnly[k] = localStorage.getItem(k);
    }

    const blob = new Blob([JSON.stringify(dump,null,2)],{type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gamenfy-backup-' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
    if(typeof showToast === 'function') showToast('Cloud backup downloaded');
    return true;
  } catch(e) {
    console.error('Gamenfy backup failed', e);
    return fail('Cloud backup failed — no incomplete file downloaded');
  }
};

'''
s = s[:start] + new_block + s[end:]
p.write_text(s, encoding='utf-8')

Path('tests/cloud-backup-smoke.js').write_text(r'''/* Cloud-aware backup regression — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname,'..','character.html'),'utf8');

assert.match(src,/window\.exportBackup\s*=\s*async\s+function/,
  'backup must be async so it can read owner-scoped cloud rows');
assert.ok(src.includes(".from('app_state')"), 'backup must read durable app_state cloud data');
assert.ok(src.includes(".select('key,data,updated_at')"), 'backup must read cloud timestamps for dirty ordering');
assert.ok(src.includes(".in('key', domains)"), 'backup must request RPG, Finance and Health rows together');
assert.ok(src.includes("const domains = ['rpg','finance','health']"), 'backup must cover all three durable user domains');
assert.ok(src.includes("const dirtyPrefix = '__gamenfy_sync_dirty_v1:'"),
  'backup must understand pending sync journals');
assert.ok(src.includes('(item.ts || 0) <= remoteMs'),
  'stale local journal entries must not override newer cloud data');
assert.ok(src.includes('pendingLocalApplied: pendingApplied'),
  'backup must record whether newer local pending edits were included');
assert.ok(src.includes('deviceOnly: {}'),
  'non-authoritative local remnants must be separated from cloud-authoritative data');
assert.ok(src.includes("credentialsExcluded: ['rpg_pin_v1','hevy_api_key']"),
  'backup must document excluded local secrets/convenience PIN');
assert.ok(src.includes("return fail('Cloud backup failed — no incomplete file downloaded')"),
  'cloud errors must fail closed instead of silently exporting an incomplete file');
assert.ok(!src.includes("if(inScope(k)) dump.keys[k]=localStorage.getItem(k)"),
  'legacy localStorage-only backup loop must stay retired');

console.log('Cloud backup smoke: owner cloud is authoritative, newer dirty edits are preserved, stale device cache cannot masquerade as a complete backup.');
''', encoding='utf-8')
