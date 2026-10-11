/* ChatGPT · isolated demo: no persistent storage and no real habit engine. */
(function(){
  'use strict';
  const configs={gratitude:{dir:'gratitude',place:'THE GRATITUDE GARDEN',title:'Er groeit iets goeds.',button:'Gratitude gedaan',reward:'Je tuin krijgt er licht bij.',ground:'JOUW EIGEN STUKJE RUST'},household:{dir:'household',place:'THE LITTLE RESET ROOM',title:'Ruimte in je huis. Rust in je hoofd.',button:'Household gedaan',reward:'De kamer ademt weer.',ground:'EEN HUIS DAT MET JE MEEGROEIT'},walking:{dir:'steps',place:'THE EVERYDAY TRAIL',title:'Elke stap brengt je verder.',button:'10.000 stappen gehaald',reward:'Een nieuw stukje wereld bereikt.',ground:'VANDAAG EEN STUKJE VERDER'}};
  const $=id=>document.getElementById(id),world=$('world'),image=$('companion'),nextImage=$('nextCompanion');
  const levels={gratitude:1,household:1,walking:1};
  let habit='gratitude',mode='art',busy=false,token=0,last=null,rig=null,rigPromise=null,sound=false,audio=null;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function asset(h,l){return 'img/lab/park31/'+configs[h].dir+'/l'+String(l).padStart(2,'0')+'.webp';}
  function preload(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=src;});}
  function setPhase(phase){world.dataset.phase=phase;document.querySelectorAll('[data-beat]').forEach(b=>b.classList.toggle('on',b.dataset.beat===phase));if(rig)rig.phase(phase);}
  function update(){const c=configs[habit],level=levels[habit];world.dataset.habit=habit;world.classList.toggle('upgraded',level>1);$('place').textContent=c.place;$('worldTitle').textContent=c.title;$('groundLabel').textContent=c.ground;$('level').textContent=level;$('buttonText').textContent=level===10?'Laatste vorm · vier je winst':c.button;image.src=asset(habit,level);image.alt=c.place+' — vorm '+level;document.querySelectorAll('[data-habit]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.dataset.habit===habit));});$('flowers').querySelectorAll('i').forEach((f,i)=>f.classList.toggle('lit',i<level*2));if(rig)rig.setWorld(habit,level);}
  function lock(on){busy=on;document.querySelectorAll('.habits button,.mode button,#reset,#replay,#evolve,#slow').forEach(b=>b.disabled=on);}
  function note(){ $('modeNote').textContent=mode==='art'?'Bestaande karaktervormen, met een nieuwe onthulling en een reagerende wereld.':'Echte rig, 24 gewrichten, één renclip. Upgrade = fysieke reactie + wereldverandering; nog geen tien 3D-vormen.'; }
  function chime(){if(!sound||!audio)return;try{[392,494,587,784].forEach((hz,i)=>{const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+i*.08;osc.type='sine';osc.frequency.value=hz;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.055,t+.025);gain.gain.exponentialRampToValueAtTime(.001,t+.3);osc.connect(gain).connect(audio.destination);osc.start(t);osc.stop(t+.32);});}catch(e){}}
  function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
  async function evolve(replay){
    if(busy)return;const h=habit,from=replay&&last&&last.habit===h?last.from:levels[h],to=replay&&last&&last.habit===h?last.to:Math.min(from+1,10),id=++token;
    lock(true);$('loadStatus').textContent='';
    try{await Promise.race([preload(asset(h,to)),wait(8000).then(()=>{throw Error('timeout');})]);}catch(e){$('loadStatus').textContent='De volgende vorm kon niet laden. Probeer opnieuw.';lock(false);return;}
    if(id!==token)return;
    const speed=$('slow').checked?1.8:1;
    image.src=asset(h,from);nextImage.src=asset(h,to);$('reward').textContent='Een klein moment. Een echte stap.';
    world.classList.toggle('upgraded',from>1);
    if(!reduce){
      world.style.setProperty('--evolution-duration',(3200*speed)+'ms');
      world.style.setProperty('--beat',(800*speed)+'ms');
      world.classList.add('evolving');setPhase('gather');
      await wait(1700*speed);if(id!==token)return;
      setPhase('burst');await wait(800*speed);if(id!==token)return;
    }
    chime();
    setPhase('reveal');$('reward').textContent=to===from?'Je wereld blijft op volle kracht.':configs[h].reward;
    world.classList.toggle('upgraded',to>1);$('level').textContent=to;
    if(!reduce)await wait(700*speed);if(id!==token)return;
    levels[h]=to;update();world.classList.remove('evolving');
    setPhase('idle');last={habit:h,from,to};lock(false);
  }
  document.querySelectorAll('[data-habit]').forEach(b=>{if(b.tagName!=='BUTTON')return;b.addEventListener('click',()=>{if(busy)return;habit=b.dataset.habit;last=null;setPhase('idle');$('reward').textContent='Een klein begin telt.';update();});});
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',async()=>{
    if(busy)return;const requested=b.dataset.mode;
    if(requested==='rig'){
      lock(true);$('loadStatus').textContent='Bestaande 3D-rig laden…';
      try{if(!rigPromise)rigPromise=import('./lab-habit-evolution-3d.js?v=1').then(m=>m.createRig($('rigStage'),reduce));rig=await rigPromise;mode='rig';$('rigStage').hidden=false;world.classList.add('rig-active');rig.setWorld(habit,levels[habit]);rig.active(true);$('loadStatus').textContent='3D-rig geladen · dezelfde bron als de eerdere proeven.';}
      catch(e){mode='art';rigPromise=null;$('loadStatus').textContent='3D is hier niet beschikbaar. De evolutie met jouw afbeeldingen werkt wel.';}
      lock(false);
    }else{mode='art';$('rigStage').hidden=true;world.classList.remove('rig-active');if(rig)rig.active(false);$('loadStatus').textContent='';}
    document.querySelectorAll('[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));note();
  }));
  $('evolve').addEventListener('click',()=>evolve(false));$('replay').addEventListener('click',()=>evolve(true));
  $('reset').addEventListener('click',()=>{if(busy)return;levels[habit]=1;last=null;setPhase('idle');$('reward').textContent='Een klein begin telt.';update();});
  $('sound').addEventListener('click',async()=>{try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();await audio.resume();sound=!sound;$('sound').textContent=sound?'Geluid aan':'Geluid uit';$('sound').setAttribute('aria-pressed',String(sound));}catch(e){$('loadStatus').textContent='Geluid niet beschikbaar; de animatie werkt zonder geluid.';}});
  for(let i=0;i<18;i++){const f=document.createElement('i');f.textContent=i%2?'✦':'✿';f.style.cssText='--x:'+(6+(i*31)%87)+'%;--y:'+((i*17)%75)+'px;--s:'+(10+i%4*4)+'px';$('flowers').append(f);}
  for(let i=0;i<22;i++){const p=document.createElement('i'),angle=i*Math.PI*2/22;p.className='spark';p.style.cssText='--dx:'+Math.cos(angle)*145+'px;--dy:'+Math.sin(angle)*135+'px;--delay:'+(i%4*.02)+'s';$('particles').append(p);}
  document.addEventListener('visibilitychange',()=>{if(rig)rig.active(mode==='rig'&&!document.hidden);});
  window.addEventListener('pagehide',()=>{token++;if(rig)rig.dispose();if(audio)audio.close();});
  update();
})();
