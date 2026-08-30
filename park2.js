(function () {
  'use strict';

  var CHARACTERS = [
    { key:'ai_tools', label:'AI Tools', image:'img/lab/park2/ai-tools.png', type:'skill', home:[.17,.43], pace:.48, motion:'hover', roam:.21,
      rig:{ body:'polygon(0 0,100% 0,100% 78%,78% 78%,70% 59%,31% 59%,23% 78%,0 78%)', left:'polygon(20% 54%,51% 54%,55% 96%,17% 96%)', right:'polygon(48% 54%,82% 54%,86% 96%,45% 96%)', leftOrigin:'37% 59%', rightOrigin:'63% 59%', swing:'11deg', lift:'-2.5px' },
      states:['Scant het park','Bouwt een nieuw systeem','Analyseert patronen'], copy:'Wordt scherper, sneller en uitgebreider naarmate je meer met AI bouwt.' },
    { key:'tennis', label:'Tennis', image:'img/lab/park2/tennis.png', type:'skill', home:[.78,.46], pace:.88, motion:'dash', roam:.27,
      rig:{ body:'polygon(0 0,100% 0,100% 75%,80% 75%,70% 55%,31% 55%,21% 75%,0 75%)', left:'polygon(17% 51%,58% 51%,60% 98%,14% 98%)', right:'polygon(54% 51%,100% 51%,100% 98%,50% 98%)', leftOrigin:'39% 57%', rightOrigin:'67% 57%', swing:'19deg', lift:'-5px' },
      states:['Oefent de backhand','Jaagt op de bal','Neemt een korte adempauze'], copy:'Techniek en houding groeien mee: van oefenen naar wedstrijdklaar.' },
    { key:'piano', label:'Piano', image:'img/lab/park2/piano.png', type:'skill', home:[.68,.71], pace:.28, motion:'stately', roam:.11,
      rig:{ body:'polygon(0 0,100% 0,100% 82%,82% 82%,75% 67%,27% 67%,20% 82%,0 82%)', left:'polygon(17% 63%,48% 63%,48% 98%,14% 98%)', right:'polygon(61% 63%,92% 63%,96% 98%,59% 98%)', leftOrigin:'34% 68%', rightOrigin:'75% 68%', swing:'6deg', lift:'-1.5px' },
      states:['Speelt een kleine frase','Luistert naar de stilte','Oefent dezelfde maat opnieuw'], copy:'Klank, expressie en podiumuitstraling worden rijker bij ieder nieuw niveau.' },
    { key:'good_deed', label:'Good Deed', image:'img/lab/park2/good-deed.png', type:'habit', home:[.42,.40], pace:.52, motion:'gentle', roam:.20,
      rig:{ body:'polygon(0 0,100% 0,100% 83%,81% 83%,70% 61%,30% 61%,20% 83%,0 83%)', left:'polygon(22% 58%,54% 58%,56% 98%,18% 98%)', right:'polygon(47% 58%,82% 58%,86% 98%,45% 98%)', leftOrigin:'38% 64%', rightOrigin:'63% 64%', swing:'12deg', lift:'-3px' },
      states:['Helpt een parkgenoot','Laat het hart opladen','Kijkt wie iets nodig heeft'], copy:'Je dagelijkse goede daden houden zijn hart warm en zijn handen krachtig.' },
    { key:'budgeting', label:'Budgeting', image:'img/lab/park2/budgeting.png', type:'habit', home:[.34,.72], pace:.38, motion:'shuffle', roam:.16,
      rig:{ body:'polygon(0 0,100% 0,100% 82%,78% 82%,69% 61%,31% 61%,22% 82%,0 82%)', left:'polygon(22% 58%,53% 58%,55% 98%,18% 98%)', right:'polygon(47% 58%,80% 58%,84% 98%,45% 98%)', leftOrigin:'38% 64%', rightOrigin:'62% 64%', swing:'8deg', lift:'-2px' },
      states:['Telt de voorraad','Plant nieuwe groei','Zet alles netjes op een rij'], copy:'Consistent plannen laat de muntvoorraad én de tuin rondom hem groeien.' },
    { key:'sleep', label:'Sleep', image:'img/lab/park2/sleep.png', type:'habit', home:[.12,.76], pace:.22, motion:'float', roam:.13,
      rig:{ body:'polygon(0 0,100% 0,100% 86%,79% 86%,69% 62%,31% 62%,21% 86%,0 86%)', left:'polygon(24% 58%,54% 58%,56% 98%,20% 98%)', right:'polygon(47% 58%,77% 58%,82% 98%,45% 98%)', leftOrigin:'39% 65%', rightOrigin:'61% 65%', swing:'7deg', lift:'-2px' },
      states:['Vangt een droomster','Maakt het kussen zacht','Laadt op onder de maan'], copy:'Rustige nachten vullen haar sterrenlicht en maken haar wolken steeds krachtiger.' },
    { key:'walking', label:'10k Steps', image:'img/lab/park2/walking.png', type:'habit', home:[.87,.72], pace:1, motion:'stride', roam:.31,
      rig:{ body:'polygon(0 0,100% 0,100% 82%,85% 82%,71% 58%,29% 58%,15% 82%,0 82%)', left:'polygon(10% 53%,61% 53%,63% 100%,7% 100%)', right:'polygon(47% 53%,93% 53%,97% 100%,44% 100%)', leftOrigin:'37% 61%', rightOrigin:'65% 61%', swing:'22deg', lift:'-5.5px' },
      states:['Verkent een nieuwe route','Telt iedere stap','Zet de vaart erin'], copy:'Elke actieve dag geeft deze verkenner meer uithoudingsvermogen, uitrusting en bereik.' },
    { key:'meditation', label:'Meditation', image:'img/lab/park2/meditation.png', type:'habit', home:[.55,.58], pace:.16, motion:'float', roam:.09,
      states:['Zoekt de stilte','Laat de kristallen ademen','Brengt het park tot rust'], copy:'Consistente meditatie opent nieuwe lotusblaadjes en versterkt haar kalme aura.' }
  ];

  var EVOLUTION_STAGES = [
    { key:'starter', name:'Starter', skillAt:1, habitAt:0, description:'De basisvorm is wakker en begint te leren.' },
    { key:'apprentice', name:'Leerling', skillAt:10, habitAt:3, description:'Nieuwe details en zelfvertrouwen worden zichtbaar.' },
    { key:'advanced', name:'Gevorderd', skillAt:25, habitAt:5, description:'De companion heeft een sterke, herkenbare eigen stijl.' },
    { key:'expert', name:'Expert', skillAt:50, habitAt:7, description:'Techniek, houding en uitrusting groeien samen.' },
    { key:'mastery', name:'Meesterschap', skillAt:75, habitAt:9, description:'Aura, materialen en beweging staan op topniveau.' }
  ];

  // Only request evolution files that physically exist. This avoids a 404
  // probe on every missing starter/apprentice/expert asset. Expert currently
  // reuses the real advanced form for the three companions that have it.
  var KNOWN_EVOLUTION_ART={
    sleep:{advanced:'img/lab/park2/sleep/advanced.png',expert:'img/lab/park2/sleep/advanced.png',mastery:'img/lab/park2/sleep/mastery.png'},
    walking:{advanced:'img/lab/park2/walking/advanced.png',expert:'img/lab/park2/walking/advanced.png',mastery:'img/lab/park2/walking/mastery.png'},
    meditation:{advanced:'img/lab/park2/meditation/advanced.png',expert:'img/lab/park2/meditation/advanced.png',mastery:'img/lab/park2/meditation/mastery.png'}
  };

  var root, stage, agentsEl, rosterEl, detailEl, gardenEl, motionButton;
  var agents = [], width = 520, height = 430, running = true, last = 0, focusedAgent = null;

  function skillData(key) {
    var defaults = window.RPG_DEFAULT_SKILLS || {};
    var def = defaults[key] || {};
    var character = (window.getCharacter && window.getCharacter()) || { skills:{} };
    var saved = (character.skills || {})[key] || {};
    var raw = window.getSkillLevel ? window.getSkillLevel(key, saved.xp || 0)
      : (window.xpToLevel ? window.xpToLevel(saved.xp || 0) : 1);
    var habit = !!def.isHabit;
    if (habit && window.getHabits) {
      var habitRecord = (window.getHabits() || {})[key] || {};
      raw = Number(habitRecord.score);
      if (!Number.isFinite(raw)) raw = 0;
      raw = Math.max(0, Math.min(10, raw));
    }
    var visual = Math.max(habit ? 0 : 1, Math.min(100, habit ? raw * 10 : raw));
    return { def:def, display:raw, visual:visual, habit:habit };
  }

  function evolutionFor(data) {
    var stageIndex = 0;
    for (var i=0;i<EVOLUTION_STAGES.length;i++) {
      var threshold = data.habit ? EVOLUTION_STAGES[i].habitAt : EVOLUTION_STAGES[i].skillAt;
      if (data.display >= threshold) stageIndex = i;
    }
    var stage = EVOLUTION_STAGES[stageIndex];
    var next = EVOLUTION_STAGES[stageIndex+1] || null;
    var currentAt = data.habit ? stage.habitAt : stage.skillAt;
    var nextAt = next ? (data.habit ? next.habitAt : next.skillAt) : (data.habit ? 10 : 100);
    var band = Math.max(1, nextAt-currentAt);
    var progress = next ? Math.max(0,Math.min(100,(data.display-currentAt)/band*100)) : 100;
    return { stage:stage, index:stageIndex, next:next, nextAt:nextAt, progress:progress, prestige:!data.habit&&data.display>=100 };
  }

  function setCharacterArt(owner, src) {
    if (!owner) return;
    var artwork = owner.querySelectorAll ? owner.querySelectorAll('[data-character-art]') : [];
    if (!artwork.length) {
      var fallback = owner.querySelector && owner.querySelector('img');
      if (fallback) fallback.src = src;
      return;
    }
    Array.prototype.forEach.call(artwork,function(image){ image.src=src; });
  }

  function loadEvolutionImage(img,config,evolution,owner) {
    var known=KNOWN_EVOLUTION_ART[config.assetKey||config.key]||{};
    var candidate=known[evolution.stage.key];
    if(!candidate){
      img.dataset.evolutionAsset='fallback';
      if(owner) owner.classList.add('uses-evolution-fallback');
      return;
    }
    setCharacterArt(owner,candidate);
    img.dataset.evolutionAsset='true';
    if(owner) owner.classList.add('has-evolution-art');
  }

  function createPlants(avg) {
    gardenEl.innerHTML = '';
    var count = 12 + Math.round(avg / 5);
    var colors = ['#7fb65d','#b1cf66','#5b9453','#d4bd58','#9dc975'];
    for (var i=0;i<count;i++) {
      var plant = document.createElement('i');
      plant.className = 'park2-plant';
      plant.style.setProperty('--px', (4 + ((i*37)%92)) + '%');
      plant.style.setProperty('--py', (20 + ((i*29)%105)) + 'px');
      plant.style.setProperty('--ph', (11 + ((i*13)%20)) + 'px');
      plant.style.setProperty('--pd', (2.1 + (i%5)*.34) + 's');
      plant.style.setProperty('--pc', colors[i%colors.length]);
      gardenEl.appendChild(plant);
    }
  }

  function createAgent(config, index) {
    var data = skillData(config.key);
    var evolution = evolutionFor(data);
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'p2-agent p2-motion-'+(config.motion||'gentle')+' p2-form-'+(evolution.index+1)+(config.rig?' has-puppet-rig':'')+(evolution.prestige?' is-prestige':'');
    button.dataset.skill = config.key;
    button.dataset.evolution = evolution.stage.key;
    button.setAttribute('aria-label', config.label + ', ' + (data.habit ? 'score ' : 'level ') + data.display);
    button.style.setProperty('--mastery', (data.visual/100).toFixed(2));
    button.style.setProperty('--breath', (3.1 - data.visual/100).toFixed(2) + 's');
    if (config.rig) {
      button.style.setProperty('--rig-body-clip',config.rig.body);
      button.style.setProperty('--rig-left-clip',config.rig.left);
      button.style.setProperty('--rig-right-clip',config.rig.right);
      button.style.setProperty('--rig-left-origin',config.rig.leftOrigin);
      button.style.setProperty('--rig-right-origin',config.rig.rightOrigin);
      button.style.setProperty('--rig-forward',config.rig.swing);
      button.style.setProperty('--rig-back','-'+config.rig.swing);
      button.style.setProperty('--rig-lift',config.rig.lift);
    }
    var puppet = config.rig
      ? '<span class="p2-puppet" aria-hidden="true">'
        + '<span class="p2-rig-part p2-rig-leg p2-rig-leg-left"><img data-character-art src="'+config.image+'" alt="" draggable="false"></span>'
        + '<span class="p2-rig-part p2-rig-leg p2-rig-leg-right"><img data-character-art src="'+config.image+'" alt="" draggable="false"></span>'
        + '<span class="p2-rig-part p2-rig-body"><img data-character-art src="'+config.image+'" alt="" draggable="false"></span>'
        + '</span>'
      : '';
    button.innerHTML = '<span class="p2-sprite"><img class="p2-art" data-character-art src="'+config.image+'" alt="" draggable="false">'+puppet+'</span>'
      + '<span class="p2-effect" aria-hidden="true"></span>'
      + '<span class="p2-badge"><span class="p2-agent-name">'+config.label+'</span><strong>'+(data.habit ? data.display+'/10' : 'L'+data.display)+'</strong></span>';
    agentsEl.appendChild(button);
    loadEvolutionImage(button.querySelector('img'),config,evolution,button);

    var roster = document.createElement('button');
    roster.type = 'button'; roster.textContent = config.label;
    rosterEl.appendChild(roster);

    var a = {
      config:config, data:data, evolution:evolution, el:button, roster:roster,
      x:config.home[0]*width, y:config.home[1]*height,
      targetX:config.home[0]*width, targetY:config.home[1]*height,
      pause:720 + index*145, stateIndex:index%config.states.length, moving:false,
      vx:0, vy:0, facing:index%2 ? -1 : 1, wander:Math.random()*Math.PI*2
    };
    button.onclick = roster.onclick = function () {
      if (focusedAgent) setFocus(a, true);
      selectAgent(a, true);
    };
    return a;
  }

  function selectAgent(agent, react) {
    agents.forEach(function (a) {
      a.el.classList.toggle('is-selected', a===agent);
      a.roster.classList.toggle('on', a===agent);
    });
    if (react) {
      agent.el.classList.remove('is-reacting');
      void agent.el.offsetWidth;
      agent.el.classList.add('is-reacting');
      setTimeout(function(){ agent.el.classList.remove('is-reacting'); }, 620);
      agent.stateIndex = (agent.stateIndex + 1) % agent.config.states.length;
    }
    var evolution = agent.evolution;
    var levelText = agent.data.habit ? 'Score '+agent.data.display+'/10' : 'Level '+agent.data.display;
    var nextText = evolution.next
      ? 'Nog '+Math.max(0,evolution.nextAt-agent.data.display)+' '+(agent.data.habit?'punten':'levels')+' tot '+evolution.next.name
      : (evolution.prestige ? 'Prestige bereikt' : 'Hoogste hoofdvorm bereikt');
    var dots = EVOLUTION_STAGES.map(function(stage,i){
      return '<i class="'+(i<evolution.index?'done ':i===evolution.index?'current ':'')+'" title="'+stage.name+'"></i>';
    }).join('');
    detailEl.innerHTML = '<div class="park2-detail-head"><div><div class="park2-detail-name">'+agent.config.label+'</div>'
      + '<div class="park2-detail-copy"><b>'+agent.config.states[agent.stateIndex]+'.</b> '+agent.config.copy+'</div></div>'
      + '<div class="park2-detail-state">Vorm '+(evolution.index+1)+'/5 · '+evolution.stage.name+'</div></div>'
      + '<div class="park2-detail-copy">'+levelText+' · '+evolution.stage.description+'</div>'
      + '<div class="park2-evolution-track" aria-label="Evolutie '+(evolution.index+1)+' van 5">'+dots+'<span>'+nextText+'</span></div>'
      + '<div class="park2-progress" style="--progress:'+evolution.progress+'%"><i></i></div>'
      + '<button class="park2-focus-toggle" id="park2FocusToggle" type="button">'
      + (focusedAgent===agent ? 'Laat weer vrij rondlopen' : 'Focus op '+agent.config.label)+'</button>';
    document.getElementById('park2FocusToggle').onclick = function () {
      setFocus(agent, focusedAgent!==agent);
      selectAgent(agent, false);
    };
  }

  function setFocus(agent, enable) {
    focusedAgent = enable ? agent : null;
    root.classList.toggle('is-focus-mode', !!focusedAgent);
    agents.forEach(function(a, index){
      a.el.classList.toggle('is-focus-lead', a===focusedAgent);
      a.el.classList.toggle('is-focus-support', !!focusedAgent && a!==focusedAgent);
      if (focusedAgent) {
        if (a===focusedAgent) {
          a.targetX=width*.52; a.targetY=height*.79; a.pause=0;
        } else {
          var supportSlots=[[.09,.56],[.22,.74],[.36,.54],[.51,.45],[.66,.54],[.80,.74],[.93,.56]];
          var others=agents.filter(function(x){return x!==focusedAgent;});
          var slot=supportSlots[others.indexOf(a)] || [.1+(index%6)*.16,.62];
          a.targetX=Math.max(48,Math.min(width-48,width*slot[0]));
          a.targetY=Math.max(205,Math.min(height-42,height*slot[1])); a.pause=0;
        }
      } else newTarget(a);
    });
    var time=document.getElementById('park2Time');
    if (time) time.textContent=focusedAgent ? 'Focus · '+focusedAgent.config.label : '';
    if (!focusedAgent) setTime();
  }

  function newTarget(a) {
    if (focusedAgent) return;
    var roam = a.config.roam || .2;
    var x = a.config.home[0] + (Math.random()-.5)*roam*2;
    var y = a.config.home[1] + (Math.random()-.5)*roam*1.25;
    a.targetX = Math.max(55, Math.min(width-55, x*width));
    a.targetY = Math.max(215, Math.min(height-43, y*height));
    a.pause = 0;
    a.stateIndex = Math.floor(Math.random()*a.config.states.length);
  }

  function restDuration(a) {
    if (a.config.motion==='dash' || a.config.motion==='stride') return 520 + Math.random()*1250;
    if (a.config.motion==='float') return 1500 + Math.random()*2600;
    if (a.config.motion==='stately') return 1250 + Math.random()*2100;
    return 850 + Math.random()*1900;
  }

  function separation(a) {
    if (focusedAgent) return { x:0, y:0 };
    var pushX=0, pushY=0;
    agents.forEach(function(other){
      if (other===a) return;
      var dx=a.x-other.x, dy=(a.y-other.y)*1.35;
      var distance=Math.sqrt(dx*dx+dy*dy);
      if (!distance || distance>=72) return;
      var strength=(72-distance)/72*18;
      pushX+=dx/distance*strength;
      pushY+=dy/distance*strength*.55;
    });
    return { x:pushX, y:pushY };
  }

  function updateAgent(a, delta) {
    var dt=Math.max(.001,Math.min(50,delta)/1000);
    var dx=a.targetX-a.x, dy=a.targetY-a.y;
    var dist=Math.sqrt(dx*dx+dy*dy);
    var desiredX=0, desiredY=0;
    if (!focusedAgent && a.pause>0) {
      a.pause-=delta;
      if (a.pause<=0) newTarget(a);
    } else if (dist<5) {
      if (!focusedAgent && a.pause<=0) a.pause=restDuration(a);
    } else {
      var maxSpeed=18+a.config.pace*42;
      var arrival=Math.max(46,76-a.config.pace*18);
      var desiredSpeed=maxSpeed*Math.min(1,dist/arrival);
      desiredX=dx/dist*desiredSpeed;
      desiredY=dy/dist*desiredSpeed;
      if (!focusedAgent) {
        var avoid=separation(a);
        a.wander+=dt*(.7+a.config.pace*.55);
        desiredX+=avoid.x+Math.cos(a.wander)*1.4;
        desiredY+=avoid.y+Math.sin(a.wander*.73)*.9;
      }
    }
    var accelerating=Math.abs(desiredX)+Math.abs(desiredY)>1;
    var response=accelerating ? 3.2+a.config.pace*2.8 : 5.6;
    var blend=Math.min(1,response*dt);
    a.vx+=(desiredX-a.vx)*blend;
    a.vy+=(desiredY-a.vy)*blend;
    if (!accelerating && Math.abs(a.vx)<.35) a.vx=0;
    if (!accelerating && Math.abs(a.vy)<.35) a.vy=0;
    a.x+=a.vx*dt; a.y+=a.vy*dt;
    a.x=Math.max(48,Math.min(width-48,a.x));
    a.y=Math.max(205,Math.min(height-40,a.y));
    var speed=Math.sqrt(a.vx*a.vx+a.vy*a.vy);
    a.moving=speed>3.2 && dist>4;
    if (Math.abs(a.vx)>2.4) a.facing=a.vx<0 ? -1 : 1;
    var perspective = .82 + (a.y/height)*.23;
    var levelScale = .92 + a.data.visual/100*.13;
    var lean=a.moving ? Math.max(-4,Math.min(4,a.vx/(18+a.config.pace*42)*4)) : 0;
    var stepRate=Math.max(.34,.72-speed/145);
    a.el.style.setProperty('--x', a.x.toFixed(1)+'px');
    a.el.style.setProperty('--y', a.y.toFixed(1)+'px');
    a.el.style.setProperty('--scale', (perspective*levelScale).toFixed(3));
    a.el.style.setProperty('--facing', a.facing);
    a.el.style.setProperty('--lean', lean.toFixed(2)+'deg');
    a.el.style.setProperty('--step-rate', stepRate.toFixed(2)+'s');
    a.el.style.setProperty('--ground-scale', (.9+Math.min(.18,speed/250)).toFixed(2));
    a.el.style.zIndex = Math.round(a.y);
    a.el.classList.toggle('is-moving', a.moving);
    a.el.classList.toggle('is-settling', !a.moving && speed>.6);
  }

  function loop(now) {
    var delta = Math.min(40, now-(last||now)); last=now;
    if (running) agents.forEach(function(a){ updateAgent(a,delta); });
    requestAnimationFrame(loop);
  }

  function resize() {
    width = stage.clientWidth || 520; height = stage.clientHeight || 430;
    agents.forEach(function(a){
      a.x = Math.max(48,Math.min(width-48,a.x)); a.y = Math.max(210,Math.min(height-40,a.y));
      a.targetX = Math.max(48,Math.min(width-48,a.targetX)); a.targetY = Math.max(210,Math.min(height-40,a.targetY));
    });
    if (focusedAgent) setFocus(focusedAgent,true);
  }

  function setTime() {
    var hour = new Date().getHours();
    var label = hour < 7 ? 'Nacht in het park' : hour < 12 ? 'Ochtend in het park' : hour < 18 ? 'Middag in het park' : 'Avond in het park';
    document.getElementById('park2Time').textContent = label;
  }

  function start() {
    root=document.getElementById('park2'); stage=document.getElementById('park2Stage');
    agentsEl=document.getElementById('park2Agents'); rosterEl=document.getElementById('park2Roster');
    detailEl=document.getElementById('park2Detail'); gardenEl=document.getElementById('park2Garden');
    motionButton=document.getElementById('park2Motion');
    if (!root || !stage) return;
    if (!window.RPG_DEFAULT_SKILLS || !window.getCharacter) { setTimeout(start,80); return; }
    resize();
    CHARACTERS.forEach(function(c,i){ agents.push(createAgent(c,i)); });
    var avg = agents.reduce(function(sum,a){return sum+a.data.visual;},0)/agents.length;
    createPlants(avg); setTime(); selectAgent(agents[0],false);
    motionButton.onclick=function(){
      running=!running; root.classList.toggle('paused',!running);
      motionButton.textContent=running?'Pauzeer':'Laat leven'; motionButton.setAttribute('aria-pressed',String(!running));
    };
    window.addEventListener('resize',resize);
    requestAnimationFrame(loop);
  }

  start();
})();
