/* Park 3.0 — Daily Mission Evolution Plaza
   Performed-by: ChatGPT (OpenAI)
   Source of truth: approved 11 x 10 companion evolution atlas.
   Live data: rpg_habits_v1 + rpg_habitlog_v1 (same source as Today's Missions).
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
    {key:'weed_control',label:'No Weed',row:7,emoji:'🌿',danger:true,desc:'Low levels show loss of control; each consistent day restores clarity, strength and command.'},
    {key:'no_porn',label:'Discipline',row:8,emoji:'⚡',danger:true,private:true,desc:'Private discipline arc: chaotic devil energy gradually resolves into an angelic Master guardian.'},
    {key:'sleep',label:'Sleep',row:9,emoji:'😴',desc:'Better sleep turns a tired starter into the fully protected dream guardian.'},
    {key:'walking',label:'Steps',row:10,emoji:'👟',desc:'Daily steps make the teal runner faster, fitter and more electrically alive.'}
  ];

  /* Crisp 1200px atlas: ~120 source pixels per evolution frame instead of ~55px. */
  var ATLAS_PARTS=5;
  var atlasReady=false,atlasError=false;
  var grid,modal,focusArt,titleEl,metaEl,levelEl,stateEl,progressEl,descEl,actionEl,resetEl,prevEl,nextEl;
  var selected=null,preview=null,tries=0;

  function dayKey(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function loadLog(){try{return JSON.parse(localStorage.getItem('rpg_habitlog_v1'))||{};}catch(e){return {};}}
  function saveLog(log){try{localStorage.setItem('rpg_habitlog_v1',JSON.stringify(log));}catch(e){}}
  function isDone(key){var log=loadLog(),d=dayKey();return !!(log[key]&&log[key][d]);}
  function setDone(key,value){var log=loadLog(),d=dayKey();log[key]=log[key]||{};if(value)log[key][d]=true;else delete log[key][d];saveLog(log);}
  function scoreOf(key){
    try{
      var h=(window.getHabits&&window.getHabits())||{};
      var n=Number((h[key]||{}).score);
      if(Number.isFinite(n))return Math.max(0,Math.min(10,n));
    }catch(e){}
    try{
      var raw=JSON.parse(localStorage.getItem('rpg_habits_v1'))||{};
      var r=Number((raw[key]||{}).score);
      return Number.isFinite(r)?Math.max(0,Math.min(10,r)):0;
    }catch(e){return 0;}
  }
  function visualLevel(score){return Math.max(1,Math.min(10,Number(score)||0));}
  function xPos(level){return (((visualLevel(level)-1)/9)*100).toFixed(4)+'%';}
  function yPos(row){return ((Math.max(0,Math.min(10,row))/10)*100).toFixed(4)+'%';}
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

  function loadAtlas(){
    var jobs=[];
    for(var i=1;i<=ATLAS_PARTS;i++){
      (function(n){
        var id=String(n).padStart(2,'0');
        jobs.push(fetch('img/lab/park3/atlas-crisp/part-'+id+'.txt?v=12.3',{cache:'force-cache'}).then(function(r){
          if(!r.ok)throw new Error('crisp atlas '+id+' '+r.status);
          return r.text();
        }).then(function(t){return t.trim();}));
      })(i);
    }
    return Promise.all(jobs).then(function(parts){
      var data='data:image/avif;base64,'+parts.join('');
      document.documentElement.style.setProperty('--p3-atlas','url("'+data+'")');
      atlasReady=true;atlasError=false;
      document.body.classList.add('p3-atlas-ready');
      document.body.classList.remove('p3-atlas-error');
      render();
      if(selected)updateModal();
    }).catch(function(err){
      atlasError=true;atlasReady=false;
      document.body.classList.add('p3-atlas-error');
      console.error('[Park 3.0] crisp evolution atlas failed',err);
      render();
    });
  }

  function artHTML(m,score,focus){
    var frame=visualLevel(score);
    var cls=focus?'p3-focus-art':'p3-art';
    return '<span class="'+cls+'" style="--p3-x:'+xPos(frame)+';--p3-y:'+yPos(m.row)+'">'
      +'<i class="p3-art-placeholder" aria-hidden="true">'+esc(m.emoji)+'</i></span>';
  }

  function card(m){
    var score=scoreOf(m.key),done=isDone(m.key);
    var cls='p3-card'+(done?' done':'')+(score===10?' master':'')+(score===0?' is-zero':'')+(m.danger?' is-danger':'');
    return '<button class="'+cls+'" type="button" data-key="'+esc(m.key)+'">'
      +'<span class="p3-zero-tag">LV 0 · '+(m.danger?'ALERT':'START')+'</span>'
      +artHTML(m,score,false)
      +'<span class="p3-status"><span class="p3-name"><strong>'+esc(m.label)+'</strong><span>'+(done?'completed today':state(score))+'</span></span>'
      +'<span class="p3-level">L'+score+'</span></span></button>';
  }

  function render(){
    if(!grid)return;
    grid.innerHTML=MISSIONS.map(card).join('');
    var scores=MISSIONS.map(function(m){return scoreOf(m.key);});
    var done=MISSIONS.filter(function(m){return isDone(m.key);}).length;
    var avg=scores.length?scores.reduce(function(a,b){return a+b;},0)/scores.length:0;
    document.getElementById('p3Done').textContent=done+'/'+MISSIONS.length;
    document.getElementById('p3Avg').textContent=avg.toFixed(1);
    document.getElementById('p3Masters').textContent=scores.filter(function(n){return n===10;}).length;
  }

  function mission(key){return MISSIONS.find(function(m){return m.key===key;})||null;}
  function open(key){selected=mission(key);preview=null;if(!selected)return;updateModal();modal.hidden=false;document.body.style.overflow='hidden';}
  function close(){modal.hidden=true;document.body.style.overflow='';selected=null;preview=null;}
  function shownLevel(){var live=scoreOf(selected.key);return preview==null?visualLevel(live):preview;}
  function updateModal(){
    if(!selected)return;
    var live=scoreOf(selected.key),shown=shownLevel(),done=isDone(selected.key);
    focusArt.style.setProperty('--p3-x',xPos(shown));
    focusArt.style.setProperty('--p3-y',yPos(selected.row));
    focusArt.innerHTML='<i class="p3-art-placeholder" aria-hidden="true">'+esc(selected.emoji)+'</i>';
    titleEl.textContent=selected.label;
    metaEl.textContent=preview==null?('LIVE SCORE · '+live+'/10'):('PREVIEW · LIVE '+live+'/10');
    levelEl.textContent='Level '+shown;
    stateEl.textContent=preview==null&&live===0?'Level 0 uses Level 1 art':state(shown);
    progressEl.style.width=(Math.max(0,Math.min(10,preview==null?live:shown))*10)+'%';
    descEl.textContent=selected.desc;
    actionEl.textContent=done?'Undo today':'Complete today';actionEl.classList.toggle('done',done);
    resetEl.disabled=preview==null;resetEl.style.opacity=preview==null?'.45':'1';
  }
  function stepPreview(delta){if(!selected)return;var current=shownLevel();preview=Math.max(1,Math.min(10,current+delta));updateModal();}
  function resetPreview(){preview=null;updateModal();}
  function fallbackRecompute(key){
    var habits;try{habits=JSON.parse(localStorage.getItem('rpg_habits_v1'))||{};}catch(e){habits={};}
    var old=habits[key]||{},done=isDone(key),score=Number(old.score)||0;
    score=Math.max(0,Math.min(10,score+(done?1:-1)));
    habits[key]=Object.assign({},old,{score:score,lastChecked:done?dayKey():old.lastChecked||null});
    try{localStorage.setItem('rpg_habits_v1',JSON.stringify(habits));}catch(e){}
  }
  function toggle(){
    if(!selected)return;
    var was=isDone(selected.key);setDone(selected.key,!was);
    if(typeof window.recomputeHabitFromLog==='function'){
      try{window.recomputeHabitFromLog(selected.key);}catch(e){fallbackRecompute(selected.key);}
    }else fallbackRecompute(selected.key);
    try{window.dispatchEvent(new CustomEvent('gamenfy:daily-mission-change',{detail:{key:selected.key,date:dayKey(),done:!was,source:'park3'}}));}catch(e){}
    preview=null;render();updateModal();
  }

  function bind(){
    grid.addEventListener('click',function(e){var b=e.target.closest('[data-key]');if(b)open(b.dataset.key);});
    document.querySelectorAll('[data-p3-close]').forEach(function(b){b.addEventListener('click',close);});
    prevEl.addEventListener('click',function(){stepPreview(-1);});nextEl.addEventListener('click',function(){stepPreview(1);});
    resetEl.addEventListener('click',resetPreview);actionEl.addEventListener('click',toggle);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)close();});
    window.addEventListener('storage',function(e){if(!e.key||e.key==='rpg_habits_v1'||e.key==='rpg_habitlog_v1')render();});
    window.addEventListener('gamenfy:daily-mission-change',function(){render();if(selected)updateModal();});
    window.addEventListener('gamenfy:remote-state-applied',function(){render();if(selected)updateModal();});
    window.addEventListener('focus',render);
    document.addEventListener('visibilitychange',function(){if(!document.hidden)render();});
  }

  function init(){
    tries++;
    if(typeof window.getHabits!=='function'&&tries<80){setTimeout(init,75);return;}
    grid=document.getElementById('p3Grid');modal=document.getElementById('p3Modal');focusArt=document.getElementById('p3FocusArt');
    titleEl=document.getElementById('p3Title');metaEl=document.getElementById('p3Meta');levelEl=document.getElementById('p3Level');stateEl=document.getElementById('p3State');
    progressEl=document.getElementById('p3Progress');descEl=document.getElementById('p3Desc');actionEl=document.getElementById('p3Action');resetEl=document.getElementById('p3Reset');prevEl=document.getElementById('p3Prev');nextEl=document.getElementById('p3Next');
    if(!grid||!modal)return;
    if(new URLSearchParams(location.search).get('embed')==='1')document.body.classList.add('p3-embedded');
    bind();render();loadAtlas();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();