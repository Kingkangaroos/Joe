from pathlib import Path
import re

p=Path('character.html')
s=p.read_text(encoding='utf-8')
pattern=re.compile(r"window\.exportBackup=function\(\)\{[\s\S]*?\n\};\n\n// ── Level-up moments")
if len(pattern.findall(s))!=1:
    raise SystemExit('exportBackup block count != 1')
replacement="""window.exportBackup=function(){
  const dump={ exportedAt:new Date().toISOString(), app:'gamenfy', version:2, keys:{} };

  // Backup durable/user-authored state, not credentials or rebuildable caches.
  // RPG scope is sourced from the canonical xp.js registry so future keys do
  // not silently fall out of backups. Finance/Health use their own app_state
  // scopes and are mirrored here explicitly.
  const rpgKeys = new Set(Array.isArray(window.RPG_SYNC_KEYS) ? window.RPG_SYNC_KEYS : []);
  const rpgPrefixes = Array.isArray(window.RPG_SYNC_PREFIXES) ? window.RPG_SYNC_PREFIXES : [];
  const financeKeys = new Set(['subs','wishlist','vk_paid_v1','nw_currency','nw:activity','nw:history']);
  const financePrefixes = ['nw:'];
  const healthKeys = new Set(['stack:items','stack:version','stack:low','po_water_v1']);
  const healthPrefixes = ['stack:taken:'];
  const sensitive = new Set(['hevy_api_key','rpg_pin_v1']);

  function inScope(k){
    if(!k || sensitive.has(k)) return false;
    if(rpgKeys.has(k) || financeKeys.has(k) || healthKeys.has(k)) return true;
    if(rpgPrefixes.some(p=>k.startsWith(p))) return true;
    if(financePrefixes.some(p=>k.startsWith(p))) return true;
    if(healthPrefixes.some(p=>k.startsWith(p))) return true;
    // Safe fallback for RPG-only state created before the central registry was
    // available. PIN is already excluded above.
    return k.startsWith('rpg_');
  }

  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(inScope(k)) dump.keys[k]=localStorage.getItem(k);
  }
  const blob=new Blob([JSON.stringify(dump,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='gamenfy-backup-'+new Date().toISOString().slice(0,10)+'.json';
  a.click(); URL.revokeObjectURL(a.href);
  if(typeof showToast==='function') showToast('Backup downloaded · credentials excluded');
};

// ── Level-up moments"""
s=pattern.sub(replacement,s,count=1)

for required in ['window.RPG_SYNC_KEYS','vk_paid_v1','po_water_v1','hevy_api_key','rpg_pin_v1']:
    if required not in s:
        raise SystemExit('required backup contract marker missing: '+required)
if "k.startsWith('hevy_')" in s:
    raise SystemExit('broad hevy_ backup selector still present')

p.write_text(s,encoding='utf-8')
