/* Park 3.1 Lab mission controller
   Keeps the interactive Daily Mission flow inside the normal Lab while Home
   stays unchanged. Uses the same local stores and XP engine as Home. */
(function(){
  'use strict';

  var HABITLOG_KEY='rpg_habitlog_v1';
  var AUTO_KEY='rpg_autohabit_v1';
  var PRIVATE_DAILY={
    weed_control:{skill:'weed_control',label:'Gardening',xp:40},
    no_porn:{skill:'no_porn',label:'Discipline',xp:45}
  };

  function todayStr(){
    var d=new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function loadJson(key,fallback){
    try{return JSON.parse(localStorage.getItem(key))||fallback;}catch(e){return fallback;}
  }
  function saveJson(key,value){
    try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){return false;}
  }
  function hlogHas(key,date){
    var log=loadJson(HABITLOG_KEY,{});
    return !!(log[key]&&log[key][date]);
  }
  function hlogSet(key,date,value){
    var log=loadJson(HABITLOG_KEY,{});
    log[key]=log[key]||{};
    if(value)log[key][date]=true;else delete log[key][date];
    saveJson(HABITLOG_KEY,log);
  }
  // Walking + Sleep are auto-backed by Fitbit on Main. If Joey deliberately
  // unchecks one here in the Lab, record that choice so a later Fitbit
  // reconciliation cannot immediately fight him and re-check it.
  function markAutoOverride(key,date,suppressed){
    if(key!=='walking'&&key!=='sleep')return;
    if(typeof window.setAutoHabitManualOverride==='function'){
      window.setAutoHabitManualOverride(key,date,suppressed);
      return;
    }
    var state=loadJson(AUTO_KEY,{});
    var stateKey=key+':'+date;
    if(suppressed)state[stateKey]='manual-off';
    else if(state[stateKey]==='manual-off')delete state[stateKey];
    saveJson(AUTO_KEY,state);
  }
  function updateDayMarker(date,value){
    var streak=loadJson('rpg_streak_v1',{days:{}});
    streak.days=streak.days||{};
    if(value)streak.days[date]=true;else delete streak.days[date];
    saveJson('rpg_streak_v1',streak);
  }
  function notify(key,done){
    try{window.dispatchEvent(new CustomEvent('gamenfy:daily-mission-change',{detail:{source:'park31-lab',key:key,date:todayStr(),done:!!done}}));}catch(e){}
  }

  window.viewedDateStr=todayStr;

  window.toggleMission=function(key){
    if(!key||typeof window.checkHabit!=='function')return false;
    var date=todayStr();
    var done=hlogHas(key,date);
    var def=(window.RPG_DEFAULT_SKILLS||{})[key]||{label:key,icon:'⭐'};

    if(done){
      if(typeof window.uncheckHabit==='function')window.uncheckHabit(key);
      hlogSet(key,date,false);
      markAutoOverride(key,date,true);
      if(typeof window.recomputeHabitFromLog==='function')window.recomputeHabitFromLog(key);
      if(typeof window.addXP==='function')window.addXP(key,-15,'Habit unchecked: '+def.label);
      updateDayMarker(date,false);
    }else{
      window.checkHabit(key,def.label,def.icon);
      hlogSet(key,date,true);
      markAutoOverride(key,date,false);
      if(typeof window.recomputeHabitFromLog==='function')window.recomputeHabitFromLog(key);
      if(typeof window.addXP==='function')window.addXP(key,15,'Habit: '+def.label);
      updateDayMarker(date,true);
    }
    notify(key,!done);
    return !done;
  };

  function privateUnlocked(){
    try{return sessionStorage.getItem('rpg_private_unlocked')==='1';}catch(e){return false;}
  }
  function unlockPrivate(){
    try{sessionStorage.setItem('rpg_private_unlocked','1');}catch(e){}
  }
  function configuredPin(){
    try{return localStorage.getItem('rpg_pin_v1')||'1111';}catch(e){return '1111';}
  }
  function showPinModal(onSuccess){
    var old=document.getElementById('p31PinModal');
    if(old)old.remove();
    var overlay=document.createElement('div');
    overlay.id='p31PinModal';
    overlay.style.cssText='position:fixed;inset:0;z-index:9900;display:grid;place-items:center;padding:20px;background:rgba(7,9,29,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)';
    overlay.innerHTML='<div style="width:min(300px,100%);padding:25px 22px;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:#10132f;color:#f7fbff;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.4)">'+
      '<div style="font-size:28px;margin-bottom:8px">🔒</div><strong style="font:800 15px system-ui">Private mission</strong>'+ 
      '<p style="margin:6px 0 16px;color:#a7aacb;font:12px/1.45 system-ui">Enter your PIN to update this mission.</p>'+ 
      '<input id="p31PinInput" type="password" inputmode="numeric" maxlength="4" placeholder="••••" aria-label="Private mission PIN" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(255,255,255,.06);color:#fff;font-size:22px;text-align:center;letter-spacing:10px;outline:none">'+
      '<div id="p31PinError" style="height:16px;margin-top:8px;color:#ff8ba7;font:11px system-ui"></div>'+ 
      '<button id="p31PinCancel" type="button" style="border:0;background:none;color:#a7aacb;font:700 11px system-ui;cursor:pointer">Cancel</button></div>';
    document.body.appendChild(overlay);
    var input=document.getElementById('p31PinInput');
    var error=document.getElementById('p31PinError');
    document.getElementById('p31PinCancel').addEventListener('click',function(){overlay.remove();});
    overlay.addEventListener('click',function(event){if(event.target===overlay)overlay.remove();});
    setTimeout(function(){input.focus();},50);
    input.addEventListener('input',function(){
      if(input.value.length!==4)return;
      if(input.value===configuredPin()){
        unlockPrivate();overlay.remove();onSuccess();
      }else{
        error.textContent='Wrong PIN, try again';input.value='';
      }
    });
  }

  window.privatePinPrompt=showPinModal;
  window.togglePrivateQuest=function(id){
    var quest=PRIVATE_DAILY[id];
    if(!quest)return false;
    if(!privateUnlocked()){
      showPinModal(function(){window.togglePrivateQuest(id);});
      return false;
    }
    var date=todayStr();
    var storageKey='rpg_daily_v1:'+date;
    var daily=loadJson(storageKey,{});
    daily.quests=daily.quests||{};
    var wasDone=!!(daily.quests[id]&&daily.quests[id].done);
    daily.quests[id]={done:!wasDone};
    saveJson(storageKey,daily);
    if(typeof window.addXP==='function')window.addXP(quest.skill,wasDone?-quest.xp:quest.xp,(wasDone?'Unchecked: ':'Daily mission: ')+quest.label);
    notify(id,!wasDone);
    return !wasDone;
  };
})();
