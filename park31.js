/* Park 3.1 — Steps companion HQ integration
   Performed-by: ChatGPT (OpenAI), 2026-08-31.
   The live walking habit score selects l01.webp through l10.webp.
   A tap only toggles light/glow; character movement is intentionally deferred.
*/
(function(){
  'use strict';

  var KEY='walking';
  var VERSION='1.0';
  var stage,button,art,levelEl,stateEl,sourceEl,copyEl,levelsEl,progressEl,lightEl,errorEl;
  var current={raw:0,art:1,source:'empty'};
  var tries=0,pollId=null;

  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function hostWindow(){
    try{
      if(window.parent&&window.parent!==window&&typeof window.parent.getHabits==='function')return window.parent;
    }catch(e){}
    return window;
  }
  function previewLevel(){
    var value=new URLSearchParams(location.search).get('level');
    if(value===null)return null;
    var n=Number(value);
    return Number.isFinite(n)&&n>=0&&n<=10?Math.round(n):null;
  }
  function levelInfo(){
    var forced=previewLevel();
    if(forced!==null)return {raw:forced,art:clamp(forced||1,1,10),source:'preview'};
    var w=hostWindow();
    try{
      var habits=(w.getHabits&&w.getHabits())||{};
      var n=Number((habits[KEY]||{}).score);
      if(Number.isFinite(n))return {raw:clamp(Math.round(n),0,10),art:clamp(Math.round(n)||1,1,10),source:'habit'};
    }catch(e){}
    try{
      var local=JSON.parse(localStorage.getItem('rpg_habits_v1'))||{};
      var score=Number((local[KEY]||{}).score);
      if(Number.isFinite(score))return {raw:clamp(Math.round(score),0,10),art:clamp(Math.round(score)||1,1,10),source:'local-habit'};
    }catch(e){}
    return {raw:0,art:1,source:'empty'};
  }
  function assetUrl(level){return 'img/lab/park31/steps/l'+String(clamp(level,1,10)).padStart(2,'0')+'.webp?v='+VERSION;}
  function state(level){
    level=Number(level)||0;
    if(level<=0)return 'CRITICAL';
    if(level<=2)return 'STARTER';
    if(level<=4)return 'BUILDING';
    if(level<=6)return 'ADVANCED';
    if(level<=8)return 'EXPERT';
    if(level===9)return 'ELITE';
    return 'MASTER';
  }
  function sourceLabel(source){return source==='preview'?'PREVIEW MODE':source==='empty'?'LIVE · NO SCORE YET':'LIVE · TODAY’S MISSIONS';}
  function buildLevels(){
    if(!levelsEl)return;
    levelsEl.innerHTML=Array.from({length:10},function(_,index){
      var level=index+1;
      return '<span class="p31-level" data-level="'+level+'" aria-label="Level '+level+'">'+level+'</span>';
    }).join('');
  }
  function render(){
    if(!stage||!art)return;
    current=levelInfo();
    var url=assetUrl(current.art);
    if(art.getAttribute('src')!==url){
      stage.classList.add('is-loading');
      errorEl.hidden=true;
      art.setAttribute('src',url);
    }
    art.alt='Steps companion op level '+current.art;
    stage.classList.toggle('is-zero',current.raw===0);
    stage.dataset.liveLevel=String(current.raw);
    stage.dataset.artLevel=String(current.art);
    levelEl.textContent='LEVEL '+current.raw;
    stateEl.textContent=state(current.raw);
    sourceEl.textContent=sourceLabel(current.source);
    copyEl.textContent=current.raw===0?'Level 1-art bij technisch level 0':'Live evolution · artwork '+current.art+' van 10';
    progressEl.style.width=(current.art*10)+'%';
    levelsEl.querySelectorAll('[data-level]').forEach(function(node){
      var active=Number(node.dataset.level)===current.art;
      node.classList.toggle('is-current',active);
      if(active)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');
    });
  }
  function preload(){
    for(var level=1;level<=10;level++){
      var image=new Image();
      image.src=assetUrl(level);
    }
  }
  function toggleLight(){
    var lit=!stage.classList.contains('is-lit');
    stage.classList.toggle('is-lit',lit);
    button.setAttribute('aria-pressed',String(lit));
    button.setAttribute('aria-label',lit?'Zet het parklicht uit':'Zet het parklicht aan');
    lightEl.textContent=lit?'Parklicht aan':'Parklicht uit';
  }
  function refresh(){render();}
  function bind(){
    button.addEventListener('click',toggleLight);
    art.addEventListener('load',function(){stage.classList.remove('is-loading');errorEl.hidden=true;});
    art.addEventListener('error',function(){stage.classList.remove('is-loading');errorEl.hidden=false;});
    window.addEventListener('storage',function(event){if(!event.key||event.key==='rpg_habits_v1'||event.key==='rpg_habitlog_v1')refresh();});
    window.addEventListener('gamenfy:daily-mission-change',refresh);
    window.addEventListener('gamenfy:remote-state-applied',refresh);
    try{
      if(window.parent&&window.parent!==window){
        window.parent.addEventListener('gamenfy:daily-mission-change',refresh);
        window.parent.addEventListener('gamenfy:remote-state-applied',refresh);
      }
    }catch(e){}
    window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh();});
    pollId=setInterval(function(){if(!document.hidden)refresh();},1200);
  }
  function init(){
    tries++;
    var w=hostWindow();
    if(typeof w.getHabits!=='function'&&tries<100){setTimeout(init,75);return;}
    stage=document.getElementById('p31Stage');button=document.getElementById('p31Companion');art=document.getElementById('p31Art');
    levelEl=document.getElementById('p31LiveLevel');stateEl=document.getElementById('p31State');sourceEl=document.getElementById('p31Source');
    copyEl=document.getElementById('p31EvolutionCopy');levelsEl=document.getElementById('p31Levels');progressEl=document.getElementById('p31Progress');
    lightEl=document.getElementById('p31LightState');errorEl=document.getElementById('p31Error');
    if(!stage||!button||!art||!levelsEl)return;
    buildLevels();bind();render();preload();
    if(art.complete&&art.naturalWidth){stage.classList.remove('is-loading');errorEl.hidden=true;}
    if(window.parent===window&&typeof window.initCloudSync==='function'&&window.supabase){
      try{window.initCloudSync({appKey:'rpg',syncedKeys:window.RPG_SYNC_KEYS,syncedPrefixes:window.RPG_SYNC_PREFIXES});}catch(e){}
    }
  }
  window.addEventListener('beforeunload',function(){if(pollId)clearInterval(pollId);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
