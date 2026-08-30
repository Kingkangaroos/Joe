/* Park 3.0 — Daily Mission Evolution Plaza
   Performed-by: ChatGPT (OpenAI)
   Uses the approved Level 1–10 evolution sheets as immutable art source.
   Live data: rpg_habits_v1 + rpg_habitlog_v1 (same source as Today's Missions).
*/
(function(){
  'use strict';

  var MISSIONS=[
    {key:'nutrition',label:'Nutrition',sprite:'img/lab/park3/nutrition.webp',desc:'Healthy daily choices build the stomach guardian from tiny starter to Master.'},
    {key:'teeth',label:'Brush Teeth',sprite:'img/lab/park3/teeth.webp',desc:'Morning + evening brushing strengthens the tooth companion one consistency level at a time.'},
    {key:'household',label:'Household',sprite:'img/lab/park3/household.webp',desc:'A real daily reset makes the household helper more capable, equipped and polished.'},
    {key:'gratitude',label:'Gratitude',sprite:'img/lab/park3/gratitude.webp',desc:'Daily gratitude grows the golden spirit from a tiny spark into a radiant Master form.'},
    {key:'good_deed',label:'Good Deed',sprite:'img/lab/park3/good_deed.webp',desc:'One deliberate act of kindness powers up the red heart hero.'},
    {key:'screen_time',label:'Screen Time',sprite:'img/lab/park3/screen_time.webp',danger:true,desc:'Low levels are deliberately chaotic; consistency turns overload into calm, controlled screen use.'},
    {key:'cold_shower',label:'Cold Shower',sprite:'img/lab/park3/cold_shower.webp',desc:'The hesitant water droplet hardens into a crystalline cold-water guardian.'},
    {key:'weed_control',label:'No Weed',sprite:'img/lab/park3/weed_control.webp',danger:true,desc:'Low levels show loss of control; each consistent day restores clarity, strength and command.'},
    {key:'no_porn',label:'Discipline',sprite:'img/lab/park3/discipline.webp',danger:true,private:true,desc:'Private discipline arc: chaotic devil energy gradually resolves into an angelic Master guardian.'},
    {key:'sleep',label:'Sleep',sprite:'img/lab/park3/sleep.webp',desc:'Better sleep turns a tired starter into the fully protected dream guardian.'},
    {key:'walking',label:'Steps',sprite:'img/lab/park3/walking.webp',desc:'Daily steps make the teal runner faster, fitter and more electrically alive.'}
  ];

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
  function pos(level){return (((visualLevel(level)-1)/9)*100).toFixed(4)+'%';}
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

  function card(m){
    var score=scoreOf(m.key),frame=visualLevel(score),done=isDone(m.key);
    var cls='p3-card'+(done?' done':'')+(score===10?' master':'')+(score===0?' is-zero':'')+(m.danger?' is-danger':'');
    return '<button class="'+cls+'" type="button" data-key="'+esc(m.key)+'">'
      +'<span class="p3-zero-tag">LV 0 · '+(m.danger?'ALERT':'START')+'</span>'
      +'<span class="p3-art" style="background-image:url(\''+esc(m.sprite)+'\');--p3-pos:'+pos(frame)+'"></span>'
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
    focusArt.style.backgroundImage="url('"+selected.sprite+"')";
    focusArt.style.setProperty('--p3-pos',pos(shown));
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
    if(!grid||!modal)return;bind();render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
