// Gamenfy backup owner binding helper — pseudonymous same-account binding only.
// This is NOT a signature and does not prove file integrity. It prevents accidental
// cross-account restores when compared against the currently authenticated owner.
(function(){
  'use strict';
  var TYPE='supabase-user-sha256-v1';
  var PREFIX='gamenfy-owner-v1:';

  function validFingerprint(value){return /^[0-9a-f]{64}$/i.test(String(value||''));}
  function normalizeUserId(value){return String(value||'').trim().toLowerCase();}

  async function fingerprintUserId(userId){
    var normalized=normalizeUserId(userId);
    if(!normalized)throw new Error('Authenticated owner id is required for backup binding.');
    if(!window.crypto||!window.crypto.subtle||typeof TextEncoder==='undefined')throw new Error('Secure SHA-256 support is unavailable.');
    var digest=await window.crypto.subtle.digest('SHA-256',new TextEncoder().encode(PREFIX+normalized));
    return Array.from(new Uint8Array(digest)).map(function(b){return b.toString(16).padStart(2,'0');}).join('');
  }

  function createManifest(fingerprint){
    if(!validFingerprint(fingerprint))throw new Error('Invalid owner fingerprint.');
    return {bindingType:TYPE,fingerprint:String(fingerprint).toLowerCase()};
  }

  function inspectManifest(owner){
    var present=!!(owner&&typeof owner==='object');
    var rawIdPresent=present&&typeof owner.userId==='string'&&owner.userId.length>0;
    var bindingType=present?String(owner.bindingType||''):'';
    var fingerprint=present?String(owner.fingerprint||'').toLowerCase():'';
    var valid=present&&!rawIdPresent&&bindingType===TYPE&&validFingerprint(fingerprint);
    return {present:present,valid:valid,rawIdPresent:rawIdPresent,bindingType:bindingType||null,fingerprint:valid?fingerprint:null};
  }

  function compareFingerprint(owner,currentFingerprint){
    var info=inspectManifest(owner);
    if(!info.valid)return {verified:false,match:false,reason:info.rawIdPresent?'raw-owner-id-rejected':'missing-or-invalid-binding'};
    if(!validFingerprint(currentFingerprint))return {verified:false,match:false,reason:'current-owner-fingerprint-missing'};
    var a=info.fingerprint,b=String(currentFingerprint).toLowerCase(),diff=0;
    for(var i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
    return {verified:true,match:diff===0,reason:diff===0?'same-account':'different-account'};
  }

  window.GamenfyOwnerBinding={
    type:TYPE,
    fingerprintUserId:fingerprintUserId,
    createManifest:createManifest,
    inspectManifest:inspectManifest,
    compareFingerprint:compareFingerprint,
    validFingerprint:validFingerprint
  };
})();
