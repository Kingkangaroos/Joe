// Gamenfy backup restore validator — analysis only, never applies data.
// ChatGPT (OpenAI), 2026-09-06.
(function(){
  'use strict';

  var SENSITIVE=new Set(['hevy_api_key','rpg_pin_v1']);
  var FINANCE_KEYS=new Set(['subs','wishlist','vk_paid_v1','nw_currency','nw:activity','nw:history']);
  var FINANCE_PREFIXES=['nw:'];
  var HEALTH_KEYS=new Set(['stack:items','stack:version','stack:low','po_water_v1']);
  var HEALTH_PREFIXES=['stack:taken:'];
  var OWNER_BINDING_TYPE='supabase-user-sha256-v1';

  function startsAny(key,prefixes){return prefixes.some(function(p){return key.indexOf(p)===0;});}
  function registry(){
    return {
      rpgKeys:new Set(Array.isArray(window.RPG_SYNC_KEYS)?window.RPG_SYNC_KEYS:[]),
      rpgPrefixes:Array.isArray(window.RPG_SYNC_PREFIXES)?window.RPG_SYNC_PREFIXES.slice():[]
    };
  }
  function domainForKey(key){
    var r=registry();
    if(SENSITIVE.has(key))return 'sensitive';
    if(FINANCE_KEYS.has(key)||startsAny(key,FINANCE_PREFIXES))return 'finance';
    if(HEALTH_KEYS.has(key)||startsAny(key,HEALTH_PREFIXES))return 'health';
    if(r.rpgKeys.has(key)||startsAny(key,r.rpgPrefixes)||key.indexOf('rpg_')===0)return 'rpg';
    return 'unknown';
  }
  function isPlainObject(v){return !!v&&typeof v==='object'&&!Array.isArray(v);}
  function stable(v){return typeof v==='string'?v:JSON.stringify(v);}
  function validFingerprint(v){return /^[0-9a-f]{64}$/i.test(String(v||''));}
  function inspectOwner(owner){
    var present=isPlainObject(owner);
    var rawIdPresent=present&&typeof owner.userId==='string'&&owner.userId.length>0;
    var bindingType=present?String(owner.bindingType||''):'';
    var fingerprint=present?String(owner.fingerprint||'').toLowerCase():'';
    var valid=present&&!rawIdPresent&&bindingType===OWNER_BINDING_TYPE&&validFingerprint(fingerprint);
    return {present:present,rawIdPresent:rawIdPresent,valid:valid,bindingType:bindingType||null,fingerprint:valid?fingerprint:null};
  }

  function validateBackup(input){
    var errors=[],warnings=[];
    if(!isPlainObject(input))return {valid:false,errors:['Backup root must be a JSON object.'],warnings:[],manifest:null,entries:[],blocked:[],unknown:[],restoreReady:false};
    if(input.app!=='gamenfy')errors.push('Backup app marker must be "gamenfy".');
    var version=Number(input.version||0);
    if(!Number.isInteger(version)||version<2)errors.push('Only Gamenfy backup version 2 or newer is supported for dry-run analysis.');
    if(!isPlainObject(input.keys))errors.push('Backup keys must be an object.');
    var entries=[],blocked=[],unknown=[];
    if(isPlainObject(input.keys)){
      Object.keys(input.keys).sort().forEach(function(key){
        var raw=input.keys[key];
        if(typeof raw!=='string'&&raw!==null){warnings.push('Key '+key+' has a non-string localStorage value and is excluded.');return;}
        var domain=domainForKey(key);
        var row={key:key,value:raw,domain:domain};
        if(domain==='sensitive'){blocked.push(row);return;}
        if(domain==='unknown'){unknown.push(row);return;}
        entries.push(row);
      });
    }
    if(blocked.length)errors.push('Backup contains sensitive credential/PIN keys and cannot be considered safe.');
    if(unknown.length)warnings.push(unknown.length+' unknown key(s) are excluded from any future restore plan.');
    if(!input.exportedAt)warnings.push('Backup has no exportedAt timestamp.');

    var owner=inspectOwner(input.owner);
    if(owner.rawIdPresent){
      if(version>=4)errors.push('Backup v4 owner manifest must not contain a raw user ID.');
      else warnings.push('Legacy raw owner ID is ignored and does not count as owner proof.');
    }
    if(version>=4&&!owner.valid)errors.push('Backup v4 requires a valid pseudonymous same-account owner binding.');
    if(version<4&&!owner.valid)warnings.push('Owner/auth proof is missing. Version 2/3 backups remain dry-run only.');
    if(owner.valid)warnings.push('Same-account binding is present but is not authenticated by this offline dry-run.');

    return {
      valid:errors.length===0,
      errors:errors,
      warnings:warnings,
      manifest:{
        app:input.app||null,
        version:version||null,
        exportedAt:input.exportedAt||null,
        ownerBindingPresent:owner.valid,
        ownerBindingType:owner.valid?owner.bindingType:null,
        ownerFingerprint:owner.valid?owner.fingerprint:null,
        // Offline parsing alone never proves who is currently authenticated.
        ownerProof:false
      },
      entries:entries,
      blocked:blocked,
      unknown:unknown,
      restoreReady:false
    };
  }

  function compareOwnerFingerprint(validation,currentFingerprint){
    var manifest=validation&&validation.manifest||{};
    var expected=String(manifest.ownerFingerprint||'').toLowerCase();
    var current=String(currentFingerprint||'').toLowerCase();
    if(!manifest.ownerBindingPresent||!validFingerprint(expected))return {verified:false,match:false,reason:'backup-owner-binding-missing'};
    if(!validFingerprint(current))return {verified:false,match:false,reason:'current-owner-fingerprint-missing'};
    var diff=0;
    for(var i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^current.charCodeAt(i);
    return {verified:true,match:diff===0,reason:diff===0?'same-account':'different-account'};
  }

  function currentKeys(storage){
    var out={};
    if(!storage)return out;
    for(var i=0;i<storage.length;i++){
      var k=storage.key(i);
      if(!k)continue;
      var domain=domainForKey(k);
      if(domain==='rpg'||domain==='finance'||domain==='health')out[k]={value:storage.getItem(k),domain:domain};
    }
    return out;
  }

  function analyzeAgainstStorage(validation,storage,strategy){
    strategy=strategy==='overwrite'?'overwrite':'merge';
    var current=currentKeys(storage);
    var incoming={};
    (validation.entries||[]).forEach(function(e){incoming[e.key]=e;});
    var rows=[];
    Object.keys(incoming).sort().forEach(function(key){
      var inc=incoming[key],cur=current[key];
      var status=!cur?'new':stable(cur.value)===stable(inc.value)?'same':'change';
      rows.push({key:key,domain:inc.domain,status:status,current:cur?cur.value:null,incoming:inc.value,action:status==='same'?'keep':'set'});
    });
    if(strategy==='overwrite'){
      Object.keys(current).sort().forEach(function(key){
        if(incoming[key])return;
        rows.push({key:key,domain:current[key].domain,status:'missing',current:current[key].value,incoming:null,action:'would-remove'});
      });
    }
    var counts={new:0,change:0,same:0,missing:0};
    var domains={rpg:{new:0,change:0,same:0,missing:0},finance:{new:0,change:0,same:0,missing:0},health:{new:0,change:0,same:0,missing:0}};
    rows.forEach(function(r){counts[r.status]=(counts[r.status]||0)+1;if(domains[r.domain])domains[r.domain][r.status]=(domains[r.domain][r.status]||0)+1;});
    return {strategy:strategy,rows:rows,counts:counts,domains:domains,restoreReady:false};
  }

  window.GamenfyRestoreValidator={
    validateBackup:validateBackup,
    compareOwnerFingerprint:compareOwnerFingerprint,
    analyzeAgainstStorage:analyzeAgainstStorage,
    domainForKey:domainForKey,
    sensitiveKeys:Array.from(SENSITIVE),
    ownerBindingType:OWNER_BINDING_TYPE
  };
})();
