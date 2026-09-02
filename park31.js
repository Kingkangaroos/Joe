/* Park 3.1 — Daily Mission companion HQ integration
   Performed-by: ChatGPT (OpenAI), 2026-08-31.
   The live walking habit score selects l01.webp through l10.webp.
   A tap only toggles light/glow; character movement is intentionally deferred.
*/
(function(){
  'use strict';

  var KEY='walking';
  var VERSION='1.7';
  var MISSIONS=[
    {key:'walking',label:'Steps',emoji:'👟',dir:'steps'},
    {key:'nutrition',label:'Nutrition',emoji:'🥗',dir:'nutrition'},
    {key:'teeth',label:'Brush Teeth',emoji:'🦷',dir:'teeth'},
    {key:'household',label:'Household',emoji:'🧹',dir:'household'},
    {key:'gratitude',label:'Gratitude',emoji:'🙏',dir:'gratitude'},
    {key:'good_deed',label:'Good Deed',emoji:'❤️',dir:'good-deed'},
    {key:'screen_time',label:'Screen Time',emoji:'📵',dir:'screen-time'},
    {key:'cold_shower',label:'Cold Shower',emoji:'💧',dir:'cold-shower'},
    {key:'weed_control',label:'Gardening',emoji:'🌿',dir:'no-weed',private:true},
    {key:'no_porn',label:'Discipline',emoji:'⚡',dir:'discipline',private:true},
    {key:'sleep',label:'Sleep',emoji:'😴',dir:'sleep'}
  ];
  var stage,button,art,levelEl,stateEl,sourceEl,copyEl,levelsEl,progressEl,lightEl,errorEl,rosterEl,rosterCountEl;
  var current={raw:0,art:1,source:'empty'};
  var artworkReady={walking:true,nutrition:true,teeth:true,household:true,gratitude:true,good_deed:true,screen_time:true,cold_shower:true,weed_control:true,no_porn:true,sleep:true};
  var tries=0,pollId=null,missionMode=false;

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
  function levelInfo(mission){
    mission=mission||MISSIONS[0];
    var forced=mission.key===KEY?previewLevel():null;
    if(forced!==null)return {raw:forced,art:clamp(forced||1,1,10),source:'preview'};
    var w=hostWindow();
    if(mission.private){
      try{
        var character=(w.getCharacter&&w.getCharacter())||{};
        var xp=((((character||{}).skills||{})[mission.key]||{}).xp)||0;
        var privateLevel=Number(w.getSkillLevel?w.getSkillLevel(mission.key,xp):(w.xpToLevel?w.xpToLevel(xp):1));
        if(Number.isFinite(privateLevel))return {raw:Math.max(0,Math.round(privateLevel)),art:clamp(Math.round(privateLevel)||1,1,10),source:'private-skill'};
      }catch(e){}
      return {raw:0,art:1,source:'empty'};
    }
    try{
      var habits=(w.getHabits&&w.getHabits())||{};
      var n=Number((habits[mission.key]||{}).score);
      if(Number.isFinite(n))return {raw:clamp(Math.round(n),0,10),art:clamp(Math.round(n)||1,1,10),source:'habit'};
    }catch(e){}
    try{
      var local=JSON.parse(localStorage.getItem('rpg_habits_v1'))||{};
      var score=Number((local[mission.key]||{}).score);
      if(Number.isFinite(score))return {raw:clamp(Math.round(score),0,10),art:clamp(Math.round(score)||1,1,10),source:'local-habit'};
    }catch(e){}
    return {raw:0,art:1,source:'empty'};
  }
  function assetUrl(level,mission){mission=mission||MISSIONS[0];return 'img/lab/park31/'+mission.dir+'/l'+String(clamp(level,1,10)).padStart(2,'0')+'.webp?v='+VERSION;}
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
  function rosterCard(mission){
    var info=levelInfo(mission),ready=!!artworkReady[mission.key],done=missionMode&&isDone(mission);
    return '<button class="p31-slot'+(ready?' is-ready':' is-waiting')+(done?' is-done':'')+'" type="button" data-mission="'+mission.key+'"'+(ready?'':' disabled')+' aria-pressed="'+(done?'true':'false')+'">'
      +'<span class="p31-slot-art">'+(ready?'<img src="'+assetUrl(info.art,mission)+'" alt="" draggable="false">':mission.emoji)+'</span>'
      +'<span class="p31-slot-copy"><strong>'+mission.label+'</strong><small>10 evolution levels</small><em>'+(missionMode?(done?'Completed today':'Tap to complete'):(ready?'HQ artwork ready':'artwork pending'))+'</em></span>'
      +'<span class="p31-slot-level">L'+info.raw+'</span></button>';
  }
  function viewedDay(){
    var w=hostWindow();
    try{if(typeof w.viewedDateStr==='function')return w.viewedDateStr();}catch(e){}
    var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function isDone(mission){
    var date=viewedDay();
    try{
      if(mission.private){
        var daily=JSON.parse(localStorage.getItem('rpg_daily_v1:'+date))||{};
        return !!(daily.quests&&daily.quests[mission.key]&&daily.quests[mission.key].done);
      }
      var log=JSON.parse(localStorage.getItem('rpg_habitlog_v1'))||{};
      return !!(log[mission.key]&&log[mission.key][date]);
    }catch(e){return false;}
  }
  function toggleMission(mission){
    var w=hostWindow();
    try{
      if(mission.private&&typeof w.togglePrivateQuest==='function')w.togglePrivateQuest(mission.key);
      else if(!mission.private&&typeof w.toggleMission==='function')w.toggleMission(mission.key);
      else return;
      setTimeout(refresh,0);
    }catch(e){}
  }
  function renderRoster(){
    if(!rosterEl)return;
    rosterEl.innerHTML=MISSIONS.map(rosterCard).join('');
    var ready=MISSIONS.filter(function(mission){return artworkReady[mission.key];}).length;
    rosterCountEl.textContent=ready+'/11 artwork ready';
  }
  function probeRoster(){
    MISSIONS.slice(1).forEach(function(mission){
      var image=new Image(),info=levelInfo(mission);
      image.onload=function(){artworkReady[mission.key]=true;renderRoster();};
      image.onerror=function(){artworkReady[mission.key]=false;};
      image.src=assetUrl(info.art,mission);
    });
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
    art.alt='Steps companion at level '+current.art;
    stage.classList.toggle('is-zero',current.raw===0);
    stage.dataset.liveLevel=String(current.raw);
    stage.dataset.artLevel=String(current.art);
    levelEl.textContent='LEVEL '+current.raw;
    stateEl.textContent=state(current.raw);
    sourceEl.textContent=sourceLabel(current.source);
    copyEl.textContent=current.raw===0?'Level 1 artwork at technical level 0':'Live evolution · artwork '+current.art+' of 10';
    progressEl.style.width=(current.art*10)+'%';
    levelsEl.querySelectorAll('[data-level]').forEach(function(node){
      var active=Number(node.dataset.level)===current.art;
      node.classList.toggle('is-current',active);
      if(active)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');
    });
    renderRoster();
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
    button.setAttribute('aria-label',lit?'Turn the park light off':'Turn the park light on');
    lightEl.textContent=lit?'Park light on':'Park light off';
  }
  function refresh(){render();}
  function bind(){
    button.addEventListener('click',toggleLight);
    rosterEl.addEventListener('click',function(event){
      var slot=event.target.closest('[data-mission]');
      if(!slot||slot.disabled)return;
      var selected=MISSIONS.find(function(mission){return mission.key===slot.dataset.mission;});
      if(missionMode&&selected){toggleMission(selected);return;}
      slot.classList.toggle('is-lit');
    });
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
    var params=new URLSearchParams(location.search);
    missionMode=params.get('mode')==='missions';
    if(params.get('embed')==='1')document.body.classList.add('p31-embedded');
    if(missionMode)document.body.classList.add('p31-mission-mode');
    stage=document.getElementById('p31Stage');button=document.getElementById('p31Companion');art=document.getElementById('p31Art');
    levelEl=document.getElementById('p31LiveLevel');stateEl=document.getElementById('p31State');sourceEl=document.getElementById('p31Source');
    copyEl=document.getElementById('p31EvolutionCopy');levelsEl=document.getElementById('p31Levels');progressEl=document.getElementById('p31Progress');
    lightEl=document.getElementById('p31LightState');errorEl=document.getElementById('p31Error');rosterEl=document.getElementById('p31Roster');rosterCountEl=document.getElementById('p31RosterCount');
    if(!stage||!button||!art||!levelsEl||!rosterEl||!rosterCountEl)return;
    buildLevels();bind();render();preload();probeRoster();
    if(art.complete&&art.naturalWidth){stage.classList.remove('is-loading');errorEl.hidden=true;}
    if(window.parent===window&&typeof window.initCloudSync==='function'&&window.supabase){
      try{window.initCloudSync({appKey:'rpg',syncedKeys:window.RPG_SYNC_KEYS,syncedPrefixes:window.RPG_SYNC_PREFIXES});}catch(e){}
    }
  }
  window.addEventListener('beforeunload',function(){if(pollId)clearInterval(pollId);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
