/* Park 3.0 — Daily Mission Evolution Plaza
   Performed-by: ChatGPT (OpenAI)
   Source of truth: approved 11 x 10 companion evolution atlas.
   Live data: same sources as Today's Missions on Main.
   v12.4: iOS-safe WebP atlas + parent/live-level bridge.
*/
(function(){
  'use strict';

  var MISSIONS=[
    {key:'nutrition',label:'Nutrition',row:0,emoji:'🥗',desc:'Healthy daily choices build the stomach guardian from tiny starter to Master.'},
    {key:'teeth',label:'Brush Teeth',row:1,emoji:'🦷',desc:'Morning + evening brushing strengthens the tooth companion one consistency level at a time.'},
    {key:'household',label:'Household',row:2,emoji:'🧹',desc:'A real daily reset makes the household helper more capable, equipped and polished.'},
    {key:'gratitude',label:'Gratitude',row:3,emoji:'🙏',desc:'Daily gratitude grows the golden spirit from a tiny spark into a radiant Master form.'},
    {key:'good_deed',label:'Good Deed',row:4,emoji:'❤️',desc:'One deliberate act of kindness powers up the red heart hero.'},
    {key:'screen_time',label:'Screen Time',row:5,emoji:'📵',danger:true,desc:'Low levels are deliberately chaotic; consistency turns overload into calm, controlled screen use.'},
    {key:'cold_shower',label:'Cold Shower',row:6,emoji:'💧',desc:'The hesitant water droplet hardens into a crystalline cold-water guardian.'},
    {key:'weed_control',label:'No Weed',row:7,emoji:'🌿',danger:true,private:true,desc:'Low levels show loss of control; each consistent day restores clarity, strength and command.'},
    {key:'no_porn',label:'Discipline',row:8,emoji:'⚡',danger:true,private:true,desc:'Private discipline arc: chaotic devil energy gradually resolves into an angelic Master guardian.'},
    {key:'sleep',label:'Sleep',row:9,emoji:'😴',desc:'Better sleep turns a tired starter into the fully protected dream guardian.'},
    {key:'walking',label:'Steps',row:10,emoji:'👟',desc:'Daily steps make the teal runner faster, fitter and more electrically alive.'}
  ];

  /* Original WebP atlas is intentionally used here: it is more reliable in iOS PWAs
     than the newer AVIF/data-URL atlas that rendered as black cards on Joey's phone. */
  var ATLAS_PARTS=13;
  var atlasReady=false,atlasError=false,atlasObjectUrl=null;
  var grid,modal,focusArt,titleEl,metaEl,levelEl,stateEl,progressEl,descEl,actionEl,resetEl,prevEl,nextEl;
  var selected=null,preview=null,tries=0,pollId=null;

  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function dayKey(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function hostWindow(){
    try{
      if(window.parent&&window.parent!==window&&typeof window.parent.getHabits==='function')return window.parent;
    }catch(e){}
    return window;
  }
  function loadLog(){try{return JSON.parse(localStorage.getItem('rpg_habitlog_v1'))||{};}catch(e){return {};}}
  function saveLog(log){try{localStorage.setItem('rpg_habitlog_v1',JSON.stringify(log));}catch(e){}}
  function isDone(m){
    if(m&&m.private)return false;
    var log=loadLog(),d=dayKey(),key=typeof m==='string'?m:m.key;
    return !!(log[key]&&log[key][d]);
  }
  function setDone(key,value){var log=loadLog(),d=dayKey();log[key]=log[key]||{};if(value)log[key][d]=true;else delete log[key][d];saveLog(log);}

  function levelInfo(m){
    var w=hostWindow();
    if(m.private){
      try{
        var ch=(w.getCharacter&&w.getCharacter())||{};
        var xp=((((ch||{}).skills||{})[m.key]||{}).xp)||0;
        var raw=Number(w.getSkillLevel?w.getSkillLevel(m.key,xp):(w.xpToLevel?w.xpToLevel(xp):1));
        if(Number.isFinite(raw))return {raw:Math.max(0,Math.round(raw)),art:clamp(Math.round(raw)||1,1,10),source:'private-skill'};
      }catch(e){}
    }else{
      try{
        var habits=(w.getHabits&&w.getHabits())||{};
        var n=Number((habits[m.key]||{}).score);
        if(Number.isFinite(n))return {raw:clamp(Math.round(n),0,10),art:clamp(Math.round(n)||1,1,10),source:'habit'};
      }catch(e){}
      try{
        var local=JSON.parse(localStorage.getItem('rpg_habits_v1'))||{};
        var r=Number((local[m.key]||{}).score);
        if(Number.isFinite(r))return {raw:clamp(Math.round(r),0,10),art:clamp(Math.round(r)||1,1,10),source:'local-habit'};
      }catch(e){}
    }
    return {raw:0,art:1,source:'empty'};
  }
  function xPos(level){return (((clamp(Number(level)||1,1,10)-1)/9)*100).toFixed(4)+'%';}
  function yPos(row){return ((clamp(row,0,10)/10)*100).toFixed(4)+'%';}
  function state(level){
    level=Number(level)||0;
    if(level<=0)return 'Critical';
    if(level<=2)return 'Starter';
    if(level<=4)return 'Building';
    if(level<=6)return 'Advanced';
    if(level<=8)return 'Expert';
    if(level===9)return 'Elite';
    return 'Master';
  }
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

  function b64ToBlobUrl(b64,mime){
    var bin=atob(b64),len=bin.length,bytes=new Uint8Array(len);
    for(var i=0;i<len;i++)bytes[i]=bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes],{type:mime}));
  }
  function loadAtlas(){
    var jobs=[];
    document.body.classList.remove('p3-atlas-ready','p3-atlas-error');
    for(var i=1;i<=ATLAS_PARTS;i++){
      (function(n){
        var id=String(n).padStart(2,'0');
        jobs.push(fetch('img/lab/park3/atlas/part-'+id+'.txt?v=12.4',{cache:'no-cache'}).then(function(r){
          if(!r.ok)throw new Error('webp atlas '+id+' '+r.status);
          return r.text();
        }).then(function(t){return t.trim();}));
      })(i);
    }
    Promise.all(jobs).then(function(parts){
      var url=b64ToBlobUrl(parts.join(''),'image/webp');
      var probe=new Image();
      probe.onload=function(){
        if(atlasObjectUrl)try{URL.revokeObjectURL(atlasObjectUrl);}catch(e){}
        atlasObjectUrl=url;
        document.documentElement.style.setProperty('--p3-atlas','url("'+url+'")');
        atlasReady=true;atlasError=false;
        document.body.classList.add('p3-atlas-ready');
        document.body.classList.remove('p3-atlas-error');
        render(); if(selected)updateModal();
      };
      probe.onerror=function(){try{URL.revokeObjectURL(url);}catch(e){};atlasError=true;atlasReady=false;document.body.classList.add('p3-atlas-error');document.body.classList.remove('p3-atlas-ready');render();};
      probe.src=url;
    }).catch(function(err){
      atlasError=true;atlasReady=false;
      document.body.classList.add('p3-atlas-error');
      document.body.classList.remove('p3-atlas-ready');
      console.error('[Park 3.0] evolution atlas failed',err);
      render();
    });
  }

  function artHTML(m,artLevel,focus){
    var cls=focus?'p3-focus-art':'p3-art';
    return '<span class="'+cls+'" style="--p3-x:'+xPos(artLevel)+';--p3-y:'+yPos(m.row)+'">'
      +'<i class="p3-art-placeholder" aria-hidden="true">'+esc(m.emoji)+'</i></span>';
  }
  function levelLabel(info){return info.raw>10?'L'+info.raw+' · M':'L'+info.raw;}

  function card(m){
    var info=levelInfo(m),done=isDone(m);
    var cls='p3-card'+(done?' done':'')+(info.art===10?' master':'')+(info.raw===0?' is-zero':'')+(m.danger?' is-danger':'');
    return '<button class="'+cls+'" type="button" data-key="'+esc(m.key)+'">'
      +'<span class="p3-zero-tag">LV 0 · '+(m.danger?'ALERT':'START')+'</span>'
      +artHTML(m,info.art,false)
      +'<span class="p3-status"><span class="p3-name"><strong>'+esc(m.label)+'</strong><span>'+(done?'completed today':state(info.art))+'</span></span>'
      +'<span class="p3-level">'+esc(levelLabel(info))+'</span></span></button>';
  }

  function render(){
    if(!grid)return;
    grid.innerHTML=MISSIONS.map(card).join('');
    var infos=MISSIONS.map(levelInfo);
    var done=MISSIONS.filter(function(m){return isDone(m);}).length;
    var avg=infos.length?infos.reduce(function(a,b){return a+clamp(b.raw,0,10);},0)/infos.length:0;
    var doneEl=document.getElementById('p3Done'),avgEl=document.getElementById('p3Avg'),mastersEl=document.getElementById('p3Masters');
    if(doneEl)doneEl.textContent=done+'/'+MISSIONS.length;
    if(avgEl)avgEl.textContent=avg.toFixed(1);
    if(mastersEl)mastersEl.textContent=infos.filter(function(x){return x.art===10;}).length;
  }

  function mission(key){return MISSIONS.find(function(m){return m.key===key;})||null;}
  function open(key){selected=mission(key);preview=null;if(!selected)return;updateModal();modal.hidden=false;document.body.style.overflow='hidden';}
  function close(){modal.hidden=true;document.body.style.overflow='';selected=null;preview=null;}
  function shownLevel(){var info=levelInfo(selected);return preview==null?info.art:preview;}
  function updateModal(){
    if(!selected)return;
    var info=levelInfo(selected),shown=shownLevel(),done=isDone(selected);
    focusArt.style.setProperty('--p3-x',xPos(shown));
    focusArt.style.setProperty('--p3-y',yPos(selected.row));
    focusArt.innerHTML='<i class="p3-art-placeholder" aria-hidden="true">'+esc(selected.emoji)+'</i>';
    titleEl.textContent=selected.label;
    metaEl.textContent=preview==null?('LIVE LEVEL · '+info.raw):('PREVIEW '+shown+' · LIVE '+info.raw);
    levelEl.textContent='Level '+shown;
    stateEl.textContent=preview==null&&info.raw===0?'Level 0 uses Level 1 art':state(shown);
    progressEl.style.width=(clamp(preview==null?info.art:shown,0,10)*10)+'%';
    descEl.textContent=selected.desc;
    if(selected.private){
      actionEl.textContent='Open Today’s Missions';
      actionEl.classList.remove('done');
    }else{
      actionEl.textContent=done?'Undo today':'Complete today';
      actionEl.classList.toggle('done',done);
    }
    resetEl.disabled=preview==null;resetEl.style.opacity=preview==null?'.45':'1';
  }
  function stepPreview(delta){if(!selected)return;preview=clamp(shownLevel()+delta,1,10);updateModal();}
  function resetPreview(){preview=null;updateModal();}
  function fallbackRecompute(key){
    var habits;try{habits=JSON.parse(localStorage.getItem('rpg_habits_v1'))||{};}catch(e){habits={};}
    var old=habits[key]||{},done=!!(loadLog()[key]||{})[dayKey()],score=Number(old.score)||0;
    score=clamp(score+(done?1:-1),0,10);
    habits[key]=Object.assign({},old,{score:score,lastChecked:done?dayKey():old.lastChecked||null});
    try{localStorage.setItem('rpg_habits_v1',JSON.stringify(habits));}catch(e){}
  }
  function toggle(){
    if(!selected)return;
    if(selected.private){
      try{window.top.location.href='index.html#missionsCard';}catch(e){location.href='index.html#missionsCard';}
      return;
    }
    var was=isDone(selected);setDone(selected.key,!was);
    var w=hostWindow();
    if(typeof w.recomputeHabitFromLog==='function'){
      try{w.recomputeHabitFromLog(selected.key);}catch(e){fallbackRecompute(selected.key);}
    }else fallbackRecompute(selected.key);
    try{window.dispatchEvent(new CustomEvent('gamenfy:daily-mission-change',{detail:{key:selected.key,date:dayKey(),done:!was,source:'park3'}}));}catch(e){}
    try{if(w!==window)w.dispatchEvent(new CustomEvent('gamenfy:daily-mission-change',{detail:{key:selected.key,date:dayKey(),done:!was,source:'park3'}}));}catch(e){}
    preview=null;render();updateModal();
  }

  function refresh(){render();if(selected)updateModal();}
  function bind(){
    grid.addEventListener('click',function(e){var b=e.target.closest('[data-key]');if(b)open(b.dataset.key);});
    document.querySelectorAll('[data-p3-close]').forEach(function(b){b.addEventListener('click',close);});
    prevEl.addEventListener('click',function(){stepPreview(-1);});nextEl.addEventListener('click',function(){stepPreview(1);});
    resetEl.addEventListener('click',resetPreview);actionEl.addEventListener('click',toggle);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)close();});
    window.addEventListener('storage',function(e){if(!e.key||e.key==='rpg_habits_v1'||e.key==='rpg_habitlog_v1'||e.key==='rpg_character_v1')refresh();});
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
    grid=document.getElementById('p3Grid');modal=document.getElementById('p3Modal');focusArt=document.getElementById('p3FocusArt');
    titleEl=document.getElementById('p3Title');metaEl=document.getElementById('p3Meta');levelEl=document.getElementById('p3Level');stateEl=document.getElementById('p3State');
    progressEl=document.getElementById('p3Progress');descEl=document.getElementById('p3Desc');actionEl=document.getElementById('p3Action');resetEl=document.getElementById('p3Reset');prevEl=document.getElementById('p3Prev');nextEl=document.getElementById('p3Next');
    if(!grid||!modal)return;
    if(new URLSearchParams(location.search).get('embed')==='1')document.body.classList.add('p3-embedded');
    bind();render();loadAtlas();
    if(window.parent===window&&typeof window.initCloudSync==='function'&&window.supabase){
      try{window.initCloudSync({appKey:'rpg',syncedKeys:window.RPG_SYNC_KEYS,syncedPrefixes:window.RPG_SYNC_PREFIXES});}catch(e){}
    }
  }
  window.addEventListener('beforeunload',function(){if(pollId)clearInterval(pollId);if(atlasObjectUrl)try{URL.revokeObjectURL(atlasObjectUrl);}catch(e){}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();