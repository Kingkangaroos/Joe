/* Daily Mission Garden v11.5
   Performed-by: ChatGPT (OpenAI)
   Purpose: validate compact movement + focus + per-mission evolution cards.
   Source of truth: RPG_DEFAULT_SKILLS entries with isHabit:true, active !== false, !private.
   IMPORTANT: regular skills (e.g. tennis, reading, whistling) must never appear here. */
(function(){
  'use strict';
  var root,stage,plotsEl,focusEl,progressEl,titleEl,guides,evolutionEl,missions=[],selected=null;
  var SPECIAL_GUIDES={
    sleep:{image:'img/lab/park2/sleep.png',label:'Sleep companion'},
    walking:{image:'img/lab/park2/walking.png',label:'10k Steps companion'},
    meditation:{image:'img/lab/park2/meditation.png',label:'Meditation companion'}
  };
  /* Only assets that already exist in the repo are mapped here.
     Missing missions deliberately fall back to their own icon until a dedicated evolution asset is approved. */
  var MISSION_ASSETS={
    budgeting:'img/lab/park2/budgeting.png',
    sleep:'img/lab/park2/sleep.png',
    walking:'img/lab/park2/walking.png',
    meditation:'img/lab/park2/meditation.png',
    good_deed:'img/lab/park2/good-deed.png'
  };
  var positions=[[.14,.56],[.31,.43],[.49,.58],[.68,.42],[.84,.58],[.22,.78],[.41,.78],[.61,.75],[.80,.78],[.09,.84],[.91,.84]];
  function viewedDate(){return typeof viewedDateStr==='function'?viewedDateStr():(typeof todayStr==='function'?todayStr():new Date().toISOString().slice(0,10));}
  function isDone(key){return typeof hlogHas==='function'?hlogHas(key,viewedDate()):false;}
  function guideFor(key){
    var special=SPECIAL_GUIDES[key];
    if(special){
      guides.special.querySelector('img').src=special.image;
      guides.special.setAttribute('aria-label',special.label);
      guides.special.dataset.skill=key;
      guides.special.classList.add('active');
      return guides.special;
    }
    guides.special.classList.remove('active');
    guides.special.removeAttribute('data-skill');
    return /budget|nutrition|household|screen/.test(key)?guides.budget:guides.good;
  }
  function missionData(){
    var defs=window.RPG_DEFAULT_SKILLS||{};
    return Object.keys(defs).filter(function(k){
      var d=defs[k];
      return d&&d.isHabit&&!d.private&&d.active!==false;
    }).map(function(k){return {key:k,def:defs[k],done:isDone(k)};});
  }
  function evolutionStage(level){
    if(level>=10)return 'Master';
    if(level>=7)return 'Evolved';
    if(level>=4)return 'Growing';
    if(level>=1)return 'Awakening';
    return 'Dormant';
  }
  function levelDots(level){
    var out='';
    for(var i=1;i<=10;i++)out+='<i'+(i<=level?' class="on"':'')+'></i>';
    return out;
  }
  function ensureEvolutionWorkbench(){
    if(evolutionEl||!root)return;
    evolutionEl=document.createElement('section');
    evolutionEl.className='mg-evo-workbench';
    evolutionEl.id='missionEvolutionWorkbench';
    evolutionEl.setAttribute('aria-label','Daily Mission evolution workbench');
    root.insertAdjacentElement('afterend',evolutionEl);
  }
  function renderEvolutions(){
    ensureEvolutionWorkbench();
    if(!evolutionEl)return;
    var habits=window.getHabits?window.getHabits():{};
    var cards=missions.map(function(m){
      var h=habits[m.key]||{},level=Math.max(0,Math.min(10,Number(h.score)||0)),asset=MISSION_ASSETS[m.key]||'';
      var visual=asset
        ? '<img src="'+asset+'" alt="" draggable="false">'
        : '<div class="mg-evo-fallback" aria-hidden="true"><span>'+((m.def&&m.def.icon)||'✦')+'</span><small>character<br>to build</small></div>';
      return '<button class="mg-evo-card'+(m.done?' done':'')+'" type="button" data-key="'+m.key+'" aria-label="'+(m.def.label||m.key)+', level '+level+' of 10">'
        +'<div class="mg-evo-visual">'+visual+'<span class="mg-evo-level">Lv '+level+'</span></div>'
        +'<div class="mg-evo-copy"><strong>'+((m.def&&m.def.label)||m.key)+'</strong><span>'+evolutionStage(level)+(m.done?' · done today':'')+'</span></div>'
        +'<div class="mg-evo-dots" aria-hidden="true">'+levelDots(level)+'</div>'
        +'</button>';
    }).join('');
    evolutionEl.innerHTML='<div class="mg-evo-head"><div><div class="mg-evo-kicker">ChatGPT workbench · real Daily Missions only</div><h3>Daily Mission Evolutions</h3><p>Each active public Daily Mission gets its own square and evolves with the persistent 0–10 habit level.</p></div><span class="mg-evo-count">'+missions.length+'</span></div><div class="mg-evo-grid">'+cards+'</div><div class="mg-evo-note">Private dailies stay outside this public grid. Regular skills are excluded by the app data itself.</div>';
    evolutionEl.querySelectorAll('.mg-evo-card').forEach(function(card){
      card.onclick=function(){
        var key=card.dataset.key,plot=plotsEl&&plotsEl.querySelector('[data-key="'+key+'"]'),m=missions.find(function(x){return x.key===key;});
        if(plot&&m){focusMission(m,plot);plot.scrollIntoView({behavior:'smooth',block:'center'});}
      };
    });
  }
  function placeRestingGuides(){
    if(!stage||!guides)return;
    var sw=stage.clientWidth||390;
    [[guides.good,16,111],[guides.budget,Math.max(4,sw-82),118],[guides.special,Math.max(4,(sw-66)/2),110]].forEach(function(item){
      item[0].style.setProperty('--gx',item[1]+'px');
      item[0].style.setProperty('--gy',item[2]+'px');
    });
  }
  function focusMission(m,plot){
    selected=m;plotsEl.querySelectorAll('.mg-plot').forEach(function(p){p.classList.toggle('selected',p===plot);});
    Object.keys(guides).forEach(function(k){guides[k].classList.remove('focused','moving');});
    placeRestingGuides();
    var guide=guideFor(m.key),sw=stage.clientWidth,sh=stage.clientHeight,px=parseFloat(plot.style.left)/100*sw,py=parseFloat(plot.style.top)/100*sh;
    guide.classList.add('moving','focused');guide.style.setProperty('--gx',Math.max(4,Math.min(sw-70,px-33))+'px');guide.style.setProperty('--gy',Math.max(70,Math.min(sh-78,py-64))+'px');
    setTimeout(function(){guide.classList.remove('moving');},720);
    var habit=(window.getHabits&&window.getHabits()[m.key])||{},day=typeof viewedDateLabel==='function'?viewedDateLabel():'Today';
    focusEl.innerHTML='<div class="mg-focus-main"><div class="mg-focus-copy"><strong>'+((m.def.icon||'🌱')+' '+(m.def.label||m.key))+'</strong><span>'+(m.done?'Blooming · score '+(habit.score||0)+'/10':'Waiting to bloom · score '+(habit.score||0)+'/10')+'</span></div><button class="mg-focus-check'+(m.done?' done':'')+'" type="button" aria-label="'+(m.done?'Uncheck ':'Complete ')+(m.def.label||m.key)+'">'+(m.done?'✓':'○')+'</button></div><span class="mg-focus-hint">'+day+' · tap the circle to '+(m.done?'undo':'complete')+'</span>';
    focusEl.querySelector('.mg-focus-check').onclick=function(e){e.stopPropagation();toggleFocused(m.key,!m.done);};focusEl.classList.add('show');
  }
  function toggleFocused(key,willComplete){
    if(typeof window.toggleMission!=='function')return;
    window.toggleMission(key);
    if(willComplete){root.classList.remove('celebrate');void root.offsetWidth;root.classList.add('celebrate');setTimeout(function(){root.classList.remove('celebrate');},900);}
    setTimeout(render,20);
  }
  function render(){
    if(!root||!window.RPG_DEFAULT_SKILLS)return;missions=missionData();plotsEl.innerHTML='';var done=missions.filter(function(m){return m.done;}).length;
    progressEl.textContent=done+' of '+missions.length+' blooming';titleEl.textContent=done===missions.length&&done?'The whole garden is blooming':done?done+' missions in bloom':'Your missions are waking up';
    missions.forEach(function(m,i){var pos=positions[i%positions.length],p=document.createElement('button');p.type='button';p.className='mg-plot'+(m.done?' done':'');p.style.left=(pos[0]*100)+'%';p.style.top=(pos[1]*100)+'%';p.dataset.key=m.key;p.setAttribute('aria-label',(m.def.label||m.key)+(m.done?', completed':', not completed'));p.innerHTML='<span class="mg-sprout"></span><span class="mg-flower">'+(m.def.icon||'✦')+'</span>';p.onclick=function(){focusMission(m,p);};plotsEl.appendChild(p);});
    renderEvolutions();
    if(selected){var target=missions.find(function(m){return m.key===selected.key;}),plot=target&&plotsEl.querySelector('[data-key="'+target.key+'"]');if(plot)focusMission(target,plot);}
  }
  function start(){
    root=document.getElementById('missionGarden');stage=document.getElementById('mgStage');plotsEl=document.getElementById('mgPlots');focusEl=document.getElementById('mgFocusCard');progressEl=document.getElementById('mgProgress');titleEl=document.getElementById('mgTitle');guides={good:document.getElementById('mgGuideGood'),budget:document.getElementById('mgGuideBudget'),special:document.getElementById('mgGuideSpecial')};
    if(!root||!stage||!guides.special)return;if(!window.RPG_DEFAULT_SKILLS||!window.getHabits){setTimeout(start,80);return;}placeRestingGuides();guides.good.onclick=function(){var p=plotsEl.querySelector('.mg-plot');if(p)p.click();};guides.budget.onclick=function(){var ps=plotsEl.querySelectorAll('.mg-plot');if(ps.length)ps[ps.length-1].click();};guides.special.onclick=function(){var p=selected&&plotsEl.querySelector('[data-key="'+selected.key+'"]');if(p)p.click();};render();window.addEventListener('storage',render);window.addEventListener('resize',function(){placeRestingGuides();if(selected)render();});window.renderMissionGarden=render;window.renderMissionEvolutions=renderEvolutions;
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
