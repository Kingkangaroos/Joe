/* Daily Mission Garden v11.6
   Performed-by: ChatGPT (OpenAI)
   Purpose: Daily Mission Garden + complete 0–10 evolution workbench.
   Source of truth: RPG_DEFAULT_SKILLS entries with isHabit:true, active !== false, !private.
   IMPORTANT: regular skills (tennis, reading, whistling, etc.) can never enter this grid.
*/
(function(){
  'use strict';
  var root,stage,plotsEl,focusEl,progressEl,titleEl,guides,evolutionEl,missions=[],selected=null;
  var SPECIAL_GUIDES={
    sleep:{image:'img/lab/park2/sleep.png',label:'Sleep companion'},
    walking:{image:'img/lab/park2/walking.png',label:'10k Steps companion'},
    meditation:{image:'img/lab/park2/meditation.png',label:'Meditation companion'}
  };
  var positions=[[.14,.56],[.31,.43],[.49,.58],[.68,.42],[.84,.58],[.22,.78],[.41,.78],[.61,.75],[.80,.78],[.09,.84],[.91,.84]];

  function viewedDate(){return typeof viewedDateStr==='function'?viewedDateStr():(typeof todayStr==='function'?todayStr():new Date().toISOString().slice(0,10));}
  function isDone(key){return typeof hlogHas==='function'?hlogHas(key,viewedDate()):false;}
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
  function evolutionIndex(level){
    if(level>=10)return 4;
    if(level>=7)return 3;
    if(level>=4)return 2;
    if(level>=1)return 1;
    return 0;
  }
  function levelDots(level){
    var out='';
    for(var i=1;i<=10;i++)out+='<i'+(i<=level?' class="on"':'')+'></i>';
    return out;
  }
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

  // ── Original vector evolution system ────────────────────────────────
  // Built directly into the app so every mission has 5 genuine visual forms
  // without depending on a guessed skill list or an external image host.
  function svgShell(key,idx,pal,body){
    var id='mg_'+key.replace(/[^a-z0-9]/gi,'')+'_'+idx;
    var scale=[.78,.86,.94,1.02,1.09][idx], lift=[7,5,2,0,-2][idx];
    var aura=idx>=2?'<circle cx="80" cy="61" r="45" fill="none" stroke="'+pal.glow+'" stroke-width="'+(idx===4?5:3)+'" opacity="'+(idx===4?.36:.18)+'"/>':'';
    var stars=idx>=3?'<g fill="'+pal.star+'" opacity=".95"><path d="M27 28l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z"/><path d="M131 38l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>'+(idx===4?'<path d="M117 15l2.3 5.5 5.5 2.3-5.5 2.3-2.3 5.5-2.3-5.5-5.5-2.3 5.5-2.3z"/>':'')+'</g>':'';
    var crown=idx===4?'<g transform="translate(63 8)"><path d="M0 13L4 0l9 8 7-8 7 8 9-8 4 13z" fill="'+pal.star+'" stroke="#7c5b13" stroke-width="1.5"/><rect x="1" y="12" width="38" height="6" rx="3" fill="'+pal.star+'" stroke="#7c5b13" stroke-width="1.5"/></g>':'';
    return '<svg class="mg-evo-svg stage-'+idx+'" viewBox="0 0 160 120" role="img" aria-label="'+esc(key)+' evolution stage '+idx+'"><defs><filter id="'+id+'g" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'+aura+stars+crown+'<g transform="translate(80 65) scale('+scale+') translate(-80 -65) translate(0 '+lift+')"'+(idx===4?' filter="url(#'+id+'g)"':'')+'>'+body+'</g></svg>';
  }
  function face(idx,x,y){
    if(idx===0)return '<g><path d="M'+(x-10)+' '+y+'q5 4 10 0" fill="none" stroke="#23251f" stroke-width="3" stroke-linecap="round"/><path d="M'+(x+8)+' '+y+'q5 4 10 0" fill="none" stroke="#23251f" stroke-width="3" stroke-linecap="round"/><path d="M'+(x+1)+' '+(y+14)+'q7-4 14 0" fill="none" stroke="#23251f" stroke-width="2.5" stroke-linecap="round"/></g>';
    return '<g><ellipse cx="'+(x-5)+'" cy="'+y+'" rx="5.5" ry="7" fill="#fff"/><ellipse cx="'+(x+14)+'" cy="'+y+'" rx="5.5" ry="7" fill="#fff"/><circle cx="'+(x-4)+'" cy="'+(y+1)+'" r="2.5" fill="#20231e"/><circle cx="'+(x+15)+'" cy="'+(y+1)+'" r="2.5" fill="#20231e"/><path d="M'+(x+1)+' '+(y+14)+'q7 '+(idx>=3?8:5)+' 14 0" fill="none" stroke="#20231e" stroke-width="2.7" stroke-linecap="round"/></g>';
  }
  function limbs(color,idx){
    var swing=idx>=3?8:3;
    return '<g stroke="'+color+'" stroke-width="6" stroke-linecap="round"><path d="M54 75l-'+(12+swing)+' 12"/><path d="M106 75l'+(12+swing)+' 12"/><path d="M65 101l-5 12"/><path d="M95 101l5 12"/></g>';
  }

  function mascotSvg(key,idx){
    var p,body='';
    switch(key){
      case 'budgeting':
        p={base:'#5cba8a',accent:'#d8f0df',dark:'#285c45',glow:'#79e7b4',star:'#f3c94f'};
        body=limbs(p.dark,idx)+'<rect x="48" y="42" width="64" height="64" rx="15" fill="'+(idx>=2?'#63c989':p.base)+'" stroke="'+p.dark+'" stroke-width="3"/><rect x="58" y="51" width="44" height="25" rx="7" fill="'+p.accent+'" stroke="'+p.dark+'" stroke-width="2"/>'+face(idx,68,61)+'<g fill="'+(idx>=3?'#f3c94f':'#dceee3')+'" stroke="'+p.dark+'" stroke-width="1.3"><circle cx="63" cy="87" r="5"/><circle cx="80" cy="87" r="5"/><circle cx="97" cy="87" r="5"/><circle cx="63" cy="101" r="5"/><circle cx="80" cy="101" r="5"/><circle cx="97" cy="101" r="5"/></g>'+(idx>=2?'<path d="M58 39q22-17 44 0" fill="'+(idx===4?'#f3c94f':'#79e7b4')+'" stroke="'+p.dark+'" stroke-width="3"/>':'');
        break;
      case 'sleep':
        p={base:'#6fa7e8',accent:'#d9ebff',dark:'#365c8b',glow:'#8fc8ff',star:'#ffe578'};
        body='<ellipse cx="80" cy="76" rx="38" ry="34" fill="'+p.base+'" stroke="'+p.dark+'" stroke-width="3"/>'+limbs(p.dark,idx)+face(idx,70,68)+'<path d="M48 53q24-35 56-15l-14 10q-18-8-42 5z" fill="'+p.accent+'" stroke="'+p.dark+'" stroke-width="3"/><circle cx="104" cy="37" r="7" fill="'+p.star+'"/>'+(idx>=2?'<path d="M45 102q35 13 70 0" fill="none" stroke="'+p.accent+'" stroke-width="7" stroke-linecap="round"/>':'')+(idx===4?'<path d="M78 19l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="'+p.star+'"/>':'');
        break;
      case 'nutrition':
        p={base:'#f18a42',accent:'#63b85d',dark:'#6b3e25',glow:'#9fe779',star:'#ffd65a'};
        body=limbs(p.dark,idx)+'<ellipse cx="80" cy="76" rx="38" ry="33" fill="'+(idx>=2?'#f17744':p.base)+'" stroke="'+p.dark+'" stroke-width="3"/>'+face(idx,70,67)+'<g fill="'+p.accent+'" stroke="#386c38" stroke-width="2"><ellipse cx="65" cy="40" rx="11" ry="18" transform="rotate(-24 65 40)"/><ellipse cx="82" cy="36" rx="11" ry="19"/><ellipse cx="99" cy="41" rx="11" ry="18" transform="rotate(24 99 41)"/></g>'+(idx>=2?'<path d="M62 88l18 10 18-10-5 20H67z" fill="'+(idx===4?'#ffd65a':'#70c66d')+'" stroke="'+p.dark+'" stroke-width="2"/>':'');
        break;
      case 'walking':
        p={base:'#4f94bf',accent:'#e9f5fb',dark:'#27546f',glow:'#6ed7f2',star:'#d8f4ff'};
        body='<path d="M43 77q9-30 35-31 14 1 22 17l15 17q8 9-2 19H58q-24-2-15-22z" fill="'+p.base+'" stroke="'+p.dark+'" stroke-width="3"/><path d="M49 88h65" stroke="'+p.accent+'" stroke-width="8" stroke-linecap="round"/>'+face(idx,67,66)+(idx>=2?'<path d="M89 47q13-18 24-5l-9 13" fill="none" stroke="'+(idx===4?'#ce6cff':'#5dd3e7')+'" stroke-width="6" stroke-linecap="round"/>':'')+(idx>=3?'<path d="M31 70l-15-5M30 84l-18 3" stroke="'+p.glow+'" stroke-width="3" stroke-linecap="round"/>':'');
        break;
      case 'teeth':
        p={base:'#eef8f2',accent:'#88d9e7',dark:'#40777d',glow:'#99f1ff',star:'#d9f8ff'};
        body='<path d="M54 39q26-13 52 0 11 8 6 28-4 13-8 36-3 17-14 5l-10-18-10 18q-11 12-14-5-4-23-8-36-5-20 6-28z" fill="'+(idx>=3?'#fff':p.base)+'" stroke="'+p.dark+'" stroke-width="3"/>'+face(idx,70,60)+'<g transform="rotate('+(idx>=3?8:-8)+' 119 72)"><rect x="116" y="42" width="7" height="58" rx="3.5" fill="#66c7ba"/><rect x="112" y="38" width="15" height="13" rx="4" fill="'+p.accent+'"/></g>'+(idx>=2?'<path d="M46 37l8 8M111 33l-6 10" stroke="'+p.glow+'" stroke-width="3" stroke-linecap="round"/>':'');
        break;
      case 'household':
        p={base:'#e3a840',accent:'#8ed29a',dark:'#6f532c',glow:'#ffd36b',star:'#ffcd56'};
        body=limbs(p.dark,idx)+(idx===4?'<path d="M42 60L80 30l38 30v49H42z" fill="#f4cf70" stroke="'+p.dark+'" stroke-width="3"/><path d="M35 60L80 22l45 38" fill="none" stroke="#cc7a32" stroke-width="9" stroke-linejoin="round"/><rect x="68" y="80" width="24" height="29" rx="4" fill="'+p.accent+'"/>':'<rect x="49" y="44" width="62" height="64" rx="22" fill="'+(idx>=2?'#d6a23d':'#8cb4c5')+'" stroke="'+p.dark+'" stroke-width="3"/>')+face(idx,70,62)+'<g transform="rotate(-15 36 80)"><rect x="32" y="46" width="6" height="64" rx="3" fill="#7e6847"/><path d="M22 102h27l-5 10H26z" fill="'+p.accent+'" stroke="'+p.dark+'" stroke-width="2"/></g>';
        break;
      case 'meditation':
        p={base:'#e7b65b',accent:'#8d5a9f',dark:'#6f4b34',glow:'#c18ee2',star:'#ffe792'};
        body='<circle cx="80" cy="54" r="23" fill="'+p.base+'" stroke="'+p.dark+'" stroke-width="2.5"/>'+face(idx,70,49)+'<path d="M58 73q22-16 44 0l10 29H48z" fill="'+p.accent+'" stroke="'+p.dark+'" stroke-width="3"/><path d="M50 101q30-20 60 0M62 88q18 12 36 0" fill="none" stroke="'+p.dark+'" stroke-width="8" stroke-linecap="round"/>'+(idx>=2?'<circle cx="80" cy="54" r="34" fill="none" stroke="'+p.glow+'" stroke-width="2" opacity=".45"/>':'')+(idx===4?'<circle cx="80" cy="54" r="43" fill="none" stroke="'+p.star+'" stroke-width="4" opacity=".5"/>':'');
        break;
      case 'gratitude':
        p={base:'#f1c56f',accent:'#e85d5d',dark:'#7a6136',glow:'#ffd889',star:'#ffe69a'};
        body='<rect x="45" y="36" width="70" height="75" rx="9" fill="'+(idx===4?'#ffe28b':p.base)+'" stroke="'+p.dark+'" stroke-width="3"/><path d="M57 36v75" stroke="'+p.dark+'" stroke-width="3"/><g fill="none" stroke="'+p.dark+'" stroke-width="2"><path d="M60 53h41M60 66h36M60 79h41"/></g><path d="M80 90c-14-12-25-2-20 9 5 10 20 16 20 16s15-6 20-16c5-11-6-21-20-9z" fill="'+p.accent+'" stroke="#a14343" stroke-width="2"/>'+(idx>=3?'<path d="M37 58l-9 5 9 5M123 58l9 5-9 5" fill="none" stroke="'+p.glow+'" stroke-width="3"/>':'')+(idx===4?'<circle cx="80" cy="87" r="37" fill="none" stroke="'+p.star+'" stroke-width="4" opacity=".45"/>':'');
        break;
      case 'good_deed':
        p={base:'#ef8a49',accent:'#4ca3ce',dark:'#7a4428',glow:'#ffb36f',star:'#ffd75d'};
        body=limbs(p.dark,idx)+'<ellipse cx="80" cy="75" rx="33" ry="34" fill="'+p.base+'" stroke="'+p.dark+'" stroke-width="3"/>'+face(idx,70,65)+(idx>=1?'<path d="M52 58q-18 12-20 35l22-7z" fill="'+(idx>=3?'#e55d49':'#f5b062')+'" stroke="'+p.dark+'" stroke-width="2"/>':'')+(idx>=2?'<path d="M80 79c-8-8-16-1-12 6 3 6 12 10 12 10s9-4 12-10c4-7-4-14-12-6z" fill="'+p.accent+'"/>':'')+(idx===4?'<path d="M48 55q32-25 64 0l-7 8q-25-15-50 0z" fill="'+p.accent+'" stroke="'+p.dark+'" stroke-width="2"/>':'');
        break;
      case 'screen_time':
        p={base:'#4c5962',accent:'#69c5d4',dark:'#272f35',glow:'#73e1e9',star:'#c8ff67'};
        body=limbs(p.dark,idx)+'<rect x="50" y="35" width="60" height="75" rx="13" fill="'+(idx>=3?'#426e79':p.base)+'" stroke="'+p.dark+'" stroke-width="3"/><rect x="58" y="43" width="44" height="51" rx="8" fill="'+(idx>=3?'#82d6dd':'#273138')+'"/>'+face(idx,68,59)+(idx>=2?'<circle cx="80" cy="102" r="4" fill="'+p.accent+'"/>':'')+(idx>=3?'<g fill="'+p.star+'"><circle cx="68" cy="84" r="3"/><circle cx="79" cy="84" r="3"/><circle cx="90" cy="84" r="3"/></g>':'')+(idx===4?'<path d="M52 37q28-24 56 0" fill="none" stroke="'+p.star+'" stroke-width="6" stroke-linecap="round"/>':'');
        break;
      case 'cold_shower':
        p={base:'#62b9db',accent:'#c8f4ff',dark:'#2d6f86',glow:'#7eeaff',star:'#d7fbff'};
        body=limbs(p.dark,idx)+'<path d="M80 29c17 24 32 39 32 57 0 20-14 32-32 32S48 106 48 86c0-18 15-33 32-57z" fill="'+(idx>=3?'#46b7df':p.base)+'" stroke="'+p.dark+'" stroke-width="3"/>'+face(idx,70,73)+(idx>=2?'<g fill="'+p.accent+'"><path d="M41 52l6 12-12 2 11 8-8 10"/><path d="M119 49l-6 13 13 2-11 8 9 10"/></g>':'')+(idx===4?'<path d="M51 95l10-11 8 7 11-14 11 14 8-7 10 11-6 17H57z" fill="'+p.accent+'" opacity=".8"/>':'');
        break;
      default:
        p={base:'#8db7a0',accent:'#eef5ef',dark:'#446152',glow:'#9ee8bd',star:'#ffe17d'};
        body=limbs(p.dark,idx)+'<circle cx="80" cy="75" r="34" fill="'+p.base+'" stroke="'+p.dark+'" stroke-width="3"/>'+face(idx,70,67);
    }
    return svgShell(key,idx,p,body);
  }

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
      var h=habits[m.key]||{},level=Math.max(0,Math.min(10,Number(h.score)||0)),idx=evolutionIndex(level);
      return '<button class="mg-evo-card'+(m.done?' done':'')+'" type="button" data-key="'+esc(m.key)+'" aria-label="'+esc(m.def.label||m.key)+', level '+level+' of 10">'
        +'<div class="mg-evo-visual">'+mascotSvg(m.key,idx)+'<span class="mg-evo-level">Lv '+level+'</span></div>'
        +'<div class="mg-evo-copy"><strong>'+esc((m.def&&m.def.label)||m.key)+'</strong><span>'+evolutionStage(level)+(m.done?' · done today':'')+'</span></div>'
        +'<div class="mg-evo-dots" aria-hidden="true">'+levelDots(level)+'</div>'
        +'</button>';
    }).join('');
    evolutionEl.innerHTML='<div class="mg-evo-head"><div><div class="mg-evo-kicker">ChatGPT workbench · real Daily Missions only</div><h3>Daily Mission Evolutions</h3><p>Every active public Daily Mission now has five distinct forms driven by the persistent 0–10 level.</p></div><span class="mg-evo-count">'+missions.length+'</span></div><div class="mg-evo-grid">'+cards+'</div><div class="mg-evo-note">Private dailies stay outside this public grid. Regular skills are excluded by the app data itself.</div>';
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
    focusEl.innerHTML='<div class="mg-focus-main"><div class="mg-focus-copy"><strong>'+esc((m.def.icon||'🌱')+' '+(m.def.label||m.key))+'</strong><span>'+(m.done?'Blooming · score '+(habit.score||0)+'/10':'Waiting to bloom · score '+(habit.score||0)+'/10')+'</span></div><button class="mg-focus-check'+(m.done?' done':'')+'" type="button" aria-label="'+(m.done?'Uncheck ':'Complete ')+esc(m.def.label||m.key)+'">'+(m.done?'✓':'○')+'</button></div><span class="mg-focus-hint">'+esc(day)+' · tap the circle to '+(m.done?'undo':'complete')+'</span>';
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
