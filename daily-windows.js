/* Daily Mission Windows v11.72
   Performed-by: ChatGPT (OpenAI)
   Purpose: Lab-only living-room prototype for the 11 public Daily Missions.
   Data contract: RPG_DEFAULT_SKILLS + rpg_habitlog_v1 + canonical habit recompute.
*/
(function(){
  'use strict';

  var grid,modal,focusRoom,focusTitle,focusMeta,focusDesc,focusLevel,actionBtn,previewBtn;
  var missions=[];
  var selectedKey=null;
  var previewLevel=null;
  var initTries=0;

  // Only known-real Park D assets are listed. Missing companions deliberately
  // remain null/pending so the prototype never probes fake filenames or mixes art styles.
  var ART={
    budgeting:{base:'img/lab/park2/budgeting.png'},
    good_deed:{base:'img/lab/park2/good-deed.png'},
    sleep:{base:'img/lab/park2/sleep.png',advanced:'img/lab/park2/sleep/advanced.png',mastery:'img/lab/park2/sleep/mastery.png'},
    walking:{base:'img/lab/park2/walking.png',advanced:'img/lab/park2/walking/advanced.png',mastery:'img/lab/park2/walking/mastery.png'},
    meditation:{base:'img/lab/park2/meditation.png',advanced:'img/lab/park2/meditation/advanced.png',mastery:'img/lab/park2/meditation/mastery.png'},
    nutrition:{}, teeth:{}, household:{}, gratitude:{}, screen_time:{}, cold_shower:{}
  };

  var ROOM={
    budgeting:{glow:'rgba(119,205,149,.18)',lit:'rgba(141,231,170,.34)',emoji:'📋'},
    sleep:{glow:'rgba(101,139,225,.18)',lit:'rgba(130,166,255,.34)',emoji:'😴'},
    nutrition:{glow:'rgba(110,190,94,.17)',lit:'rgba(139,222,107,.31)',emoji:'🥗'},
    walking:{glow:'rgba(83,184,219,.18)',lit:'rgba(107,211,240,.32)',emoji:'🚶'},
    teeth:{glow:'rgba(135,221,230,.17)',lit:'rgba(171,244,248,.31)',emoji:'🦷'},
    household:{glow:'rgba(231,177,91,.16)',lit:'rgba(244,195,110,.30)',emoji:'🧹'},
    meditation:{glow:'rgba(176,119,217,.17)',lit:'rgba(198,150,235,.31)',emoji:'🧘'},
    gratitude:{glow:'rgba(236,169,111,.16)',lit:'rgba(248,191,126,.30)',emoji:'🙏'},
    good_deed:{glow:'rgba(232,117,143,.16)',lit:'rgba(245,142,163,.30)',emoji:'🤲'},
    screen_time:{glow:'rgba(92,107,151,.18)',lit:'rgba(112,137,191,.29)',emoji:'📱'},
    cold_shower:{glow:'rgba(76,166,226,.19)',lit:'rgba(96,205,244,.34)',emoji:'💧'}
  };

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function localDateKey(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function todayKey(){return localDateKey(new Date());}
  function shiftDate(key,delta){var p=key.split('-').map(Number),d=new Date(p[0],p[1]-1,p[2]+delta);return localDateKey(d);}
  function logLoad(){try{return JSON.parse(localStorage.getItem('rpg_habitlog_v1'))||{};}catch(e){return {};}}
  function logSave(log){try{localStorage.setItem('rpg_habitlog_v1',JSON.stringify(log));}catch(e){}}
  function isDone(key,date){var l=logLoad();return !!(l[key]&&l[key][date||todayKey()]);}
  function setDone(key,date,val){var l=logLoad();l[key]=l[key]||{};if(val)l[key][date]=true;else delete l[key][date];logSave(l);}
  function scoreOf(key){try{return Math.max(0,Math.min(10,Number(((window.getHabits&&window.getHabits()[key])||{}).score)||0));}catch(e){return 0;}}
  function band(level){if(level>=10)return {i:4,name:'Master'};if(level>=7)return {i:3,name:'Expert'};if(level>=5)return {i:2,name:'Advanced'};if(level>=3)return {i:1,name:'Apprentice'};return {i:0,name:'Starter'};}
  function missedDays(key){if(isDone(key,todayKey()))return 0;var misses=0;for(var i=0;i<14;i++){var d=shiftDate(todayKey(),-i);if(isDone(key,d))break;misses++;}return misses;}
  function publicMissions(){
    var defs=window.RPG_DEFAULT_SKILLS||{};
    return Object.keys(defs).filter(function(k){var d=defs[k];return d&&d.isHabit&&d.active!==false&&!d.private;}).map(function(k){return {key:k,def:defs[k]};});
  }
  function assetFor(key,level){var a=ART[key];if(!a)return null;if(level>=10&&a.mastery)return a.mastery;if(level>=5&&a.advanced)return a.advanced;return a.base||null;}
  function roomTheme(key){return ROOM[key]||{glow:'rgba(139,108,255,.14)',lit:'rgba(183,156,255,.28)',emoji:'⭐'};}
  function waterLines(key){return key==='cold_shower'?'<span class="dw-waterline"><i></i><i></i><i></i><i></i></span>':'';}

  function charHTML(m,level){
    var src=assetFor(m.key,level),t=roomTheme(m.key);
    if(src){
      return '<div class="dw-char"><img src="'+esc(src)+'" alt="'+esc(m.def.label||m.key)+' companion" data-fallback-emoji="'+esc(t.emoji)+'"></div>';
    }
    return '<div class="dw-char"><div class="dw-pending" aria-label="Park D art pending">'+esc(t.emoji)+'</div></div>';
  }

  function windowHTML(m,opts){
    opts=opts||{};
    var actualLevel=scoreOf(m.key),level=opts.level==null?actualLevel:opts.level;
    var done=opts.done==null?isDone(m.key,todayKey()):opts.done;
    var b=band(level),neglected=missedDays(m.key)>=3;
    var t=roomTheme(m.key),label=m.def.label||m.key;
    var cls='dw-window stage-'+b.i+(done?' done':'')+(neglected?' neglected':'');
    var tag=opts.focus?'div':'button';
    var attrs=opts.focus?'':' type="button" data-open="'+esc(m.key)+'"';
    return '<'+tag+' class="'+cls+'" data-mission="'+esc(m.key)+'" style="--room-glow:'+t.glow+';--room-lit:'+t.lit+'"'+attrs+'>'+ 
      '<span class="dw-room">'+
        '<span class="dw-wall"></span><span class="dw-floor"></span><span class="dw-light"></span><span class="dw-fixture"></span>'+waterLines(m.key)+
        '<span class="dw-master-aura"></span><span class="dw-crown" aria-hidden="true">♛</span>'+ 
        '<span class="dw-level-chip">Lvl '+level+' · '+b.name+'</span><span class="dw-status-led"></span>'+ 
        '<span class="dw-help">HELP</span><span class="dw-char-zone">'+charHTML(m,level)+'</span>'+ 
        '<span class="dw-label"><strong>'+esc(label)+'</strong><span>'+(done?'LIGHT ON':'OFF')+'</span></span>'+ 
      '</span>'+ 
    '</'+tag+'>';
  }

  function attachImageFallbacks(scope){
    (scope||document).querySelectorAll('.dw-char img').forEach(function(img){
      img.addEventListener('error',function onErr(){
        img.removeEventListener('error',onErr);
        var wrap=img.closest('.dw-char');if(!wrap)return;
        wrap.innerHTML='<div class="dw-pending" aria-label="Park D art pending">'+esc(img.dataset.fallbackEmoji||'⭐')+'</div>';
      });
    });
  }

  function render(){
    missions=publicMissions();
    grid.innerHTML=missions.map(function(m){return windowHTML(m);}).join('');
    attachImageFallbacks(grid);
    var done=missions.filter(function(m){return isDone(m.key,todayKey());}).length;
    var levels=missions.map(function(m){return scoreOf(m.key);});
    var avg=levels.length?(levels.reduce(function(a,b){return a+b;},0)/levels.length).toFixed(1):'0.0';
    var masters=levels.filter(function(n){return n===10;}).length;
    document.getElementById('dwDoneCount').textContent=done+' / '+missions.length;
    document.getElementById('dwAvgLevel').textContent=avg;
    document.getElementById('dwMasterCount').textContent=masters;
  }

  function missionByKey(key){return missions.find(function(m){return m.key===key;})||null;}
  function openModal(key){selectedKey=key;previewLevel=null;updateModal();modal.hidden=false;document.body.style.overflow='hidden';setTimeout(function(){actionBtn.focus();},30);}
  function closeModal(){modal.hidden=true;document.body.style.overflow='';selectedKey=null;previewLevel=null;}
  function updateModal(){
    var m=missionByKey(selectedKey);if(!m)return;
    var actual=scoreOf(m.key),level=previewLevel==null?actual:previewLevel,done=isDone(m.key,todayKey()),b=band(level);
    focusRoom.innerHTML=windowHTML(m,{focus:true,level:level,done:done});
    attachImageFallbacks(focusRoom);
    focusTitle.textContent=m.def.label||m.key;
    focusMeta.textContent=(previewLevel==null?'TODAY':'VISUAL PREVIEW')+' · '+b.name.toUpperCase();
    focusDesc.textContent=m.def.habitDesc||m.def.why||'Complete this Daily Mission today to move your persistent 0–10 consistency level forward.';
    focusLevel.innerHTML='<span>Level '+level+'/10</span><span class="bar"><i style="width:'+(level*10)+'%"></i></span><span>'+b.name+'</span>';
    actionBtn.textContent=done?'Undo today':'Complete mission';
    actionBtn.classList.toggle('done',done);
    previewBtn.textContent=previewLevel==null?'Preview evolution states':'Preview: Level '+previewLevel+' · '+b.name;
  }

  function toggleSelected(){
    var m=missionByKey(selectedKey);if(!m)return;
    var date=todayKey(),was=isDone(m.key,date),def=m.def||{};
    setDone(m.key,date,!was);

    // Daily Windows writes the dated log directly instead of going through the
    // shared checkHabit()/uncheckHabit() wrappers. Keep Fitbit's manual override
    // state symmetric here as well, otherwise a Walking/Sleep re-check could leave
    // an old manual-off token behind and permanently suppress later reconciliation.
    if((m.key==='walking'||m.key==='sleep')&&typeof window.setAutoHabitManualOverride==='function'){
      try{window.setAutoHabitManualOverride(m.key,date,was);}catch(e){}
    }

    if(!was&&typeof window.checkHabitFor==='function'){
      try{window.checkHabitFor(m.key,date,def.label,def.icon);}catch(e){}
    }
    if(typeof window.recomputeHabitFromLog==='function'){
      try{window.recomputeHabitFromLog(m.key);}catch(e){}
    }
    if(!was&&typeof window.addXP==='function'){
      try{window.addXP(m.key,15,(def.label||m.key)+' Daily Mission');}catch(e){}
    }
    if(was&&typeof window.removeXP==='function'){
      try{window.removeXP(m.key,15,(def.label||m.key)+' Daily Mission unchecked');}catch(e){}
    }
    try{window.dispatchEvent(new CustomEvent('gamenfy:daily-mission-change',{detail:{key:m.key,date:date,done:!was,source:'daily-windows'}}));}catch(e){}
    previewLevel=null;
    render();
    updateModal();
    if(!was)confetti();
  }

  function cyclePreview(){
    var states=[0,3,5,7,10];
    if(previewLevel==null){previewLevel=0;}else{var i=states.indexOf(previewLevel);previewLevel=states[(i+1)%states.length];}
    updateModal();
  }

  function confetti(){
    var host=document.getElementById('dwConfetti');if(!host)return;
    var colors=['#f7d56d','#8b6cff','#63e2a7','#74d4f2','#ff91b6','#ffffff'];
    host.innerHTML='';
    for(var i=0;i<44;i++){
      var p=document.createElement('i');
      p.style.left=(8+Math.random()*84)+'%';
      p.style.color=colors[i%colors.length];
      p.style.setProperty('--dx',(-80+Math.random()*160)+'px');
      p.style.setProperty('--rot',(-360+Math.random()*720)+'deg');
      p.style.animationDelay=(Math.random()*.18)+'s';
      p.style.animationDuration=(.95+Math.random()*.55)+'s';
      host.appendChild(p);
    }
    setTimeout(function(){host.innerHTML='';},1800);
  }

  function bind(){
    grid.addEventListener('click',function(e){var b=e.target.closest('[data-open]');if(b)openModal(b.dataset.open);});
    document.querySelectorAll('[data-close-modal]').forEach(function(b){b.addEventListener('click',closeModal);});
    actionBtn.addEventListener('click',toggleSelected);
    previewBtn.addEventListener('click',cyclePreview);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)closeModal();});
    window.addEventListener('focus',render);
    document.addEventListener('visibilitychange',function(){if(!document.hidden)render();});
    window.addEventListener('storage',function(e){if(!e.key||e.key==='rpg_habitlog_v1'||e.key==='rpg_habits_v1')render();});
    window.addEventListener('gamenfy:remote-state-applied',render);
  }

  function init(){
    initTries++;
    if(!window.RPG_DEFAULT_SKILLS||typeof window.getHabits!=='function'){
      if(initTries<80)setTimeout(init,75);
      return;
    }
    grid=document.getElementById('dwGrid');modal=document.getElementById('dwModal');focusRoom=document.getElementById('dwFocusRoom');
    focusTitle=document.getElementById('dwFocusTitle');focusMeta=document.getElementById('dwFocusMeta');focusDesc=document.getElementById('dwFocusDesc');focusLevel=document.getElementById('dwFocusLevel');
    actionBtn=document.getElementById('dwAction');previewBtn=document.getElementById('dwResetPreview');
    if(!grid||!modal)return;
    bind();render();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
