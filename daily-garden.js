/* Daily Mission Garden v11.4
   Performed-by: ChatGPT (OpenAI)
   Purpose: validate compact movement + focus before deeper character individualisation. */
(function(){
  'use strict';
  var root,stage,plotsEl,focusEl,progressEl,titleEl,guides,missions=[],selected=null;
  var SPECIAL_GUIDES={
    sleep:{image:'img/lab/park2/sleep.png',label:'Sleep companion'},
    walking:{image:'img/lab/park2/walking.png',label:'10k Steps companion'},
    meditation:{image:'img/lab/park2/meditation.png',label:'Meditation companion'}
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
  function missionData(){var defs=window.RPG_DEFAULT_SKILLS||{};return Object.keys(defs).filter(function(k){var d=defs[k];return d&&d.isHabit&&!d.private&&d.active!==false;}).map(function(k){return {key:k,def:defs[k],done:isDone(k)};});}
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
    focusEl.innerHTML='<div class="mg-focus-main"><div class="mg-focus-copy"><strong>'+((m.def.icon||'🌱')+' '+(m.def.label||m.key))+'</strong><span>'+(m.done?'Blooming · score '+(habit.score||0)+'/10':'Waiting to bloom')+'</span></div><button class="mg-focus-check'+(m.done?' done':'')+'" type="button" aria-label="'+(m.done?'Uncheck ':'Complete ')+(m.def.label||m.key)+'">'+(m.done?'✓':'○')+'</button></div><span class="mg-focus-hint">'+day+' · tap the circle to '+(m.done?'undo':'complete')+'</span>';
    focusEl.querySelector('.mg-focus-check').onclick=function(e){e.stopPropagation();toggleFocused(m.key,!m.done);};focusEl.classList.add('show');
  }
  function toggleFocused(key,willComplete){
    if(typeof window.toggleMission!=='function')return;
    window.toggleMission(key);
    if(willComplete){root.classList.remove('celebrate');void root.offsetWidth;root.classList.add('celebrate');setTimeout(function(){root.classList.remove('celebrate');},900);}
  }
  function render(){
    if(!root||!window.RPG_DEFAULT_SKILLS)return;missions=missionData();plotsEl.innerHTML='';var done=missions.filter(function(m){return m.done;}).length;
    progressEl.textContent=done+' of '+missions.length+' blooming';titleEl.textContent=done===missions.length&&done?'The whole garden is blooming':done?done+' missions in bloom':'Your missions are waking up';
    missions.forEach(function(m,i){var pos=positions[i%positions.length],p=document.createElement('button');p.type='button';p.className='mg-plot'+(m.done?' done':'');p.style.left=(pos[0]*100)+'%';p.style.top=(pos[1]*100)+'%';p.dataset.key=m.key;p.setAttribute('aria-label',(m.def.label||m.key)+(m.done?', completed':', not completed'));p.innerHTML='<span class="mg-sprout"></span><span class="mg-flower">'+(m.def.icon||'✦')+'</span>';p.onclick=function(){focusMission(m,p);};plotsEl.appendChild(p);});
    if(selected){var target=missions.find(function(m){return m.key===selected.key;}),plot=target&&plotsEl.querySelector('[data-key="'+target.key+'"]');if(plot)focusMission(target,plot);}
  }
  function start(){
    root=document.getElementById('missionGarden');stage=document.getElementById('mgStage');plotsEl=document.getElementById('mgPlots');focusEl=document.getElementById('mgFocusCard');progressEl=document.getElementById('mgProgress');titleEl=document.getElementById('mgTitle');guides={good:document.getElementById('mgGuideGood'),budget:document.getElementById('mgGuideBudget'),special:document.getElementById('mgGuideSpecial')};
    if(!root||!stage||!guides.special)return;if(!window.RPG_DEFAULT_SKILLS||!window.getHabits){setTimeout(start,80);return;}placeRestingGuides();guides.good.onclick=function(){var p=plotsEl.querySelector('.mg-plot');if(p)p.click();};guides.budget.onclick=function(){var ps=plotsEl.querySelectorAll('.mg-plot');if(ps.length)ps[ps.length-1].click();};guides.special.onclick=function(){var p=selected&&plotsEl.querySelector('[data-key="'+selected.key+'"]');if(p)p.click();};render();window.addEventListener('storage',render);window.addEventListener('resize',function(){placeRestingGuides();if(selected)render();});window.renderMissionGarden=render;
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
