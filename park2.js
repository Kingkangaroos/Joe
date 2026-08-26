(function () {
  'use strict';

  var CHARACTERS = [
    { key:'ai_tools', label:'AI Tools', image:'img/lab/park2/ai-tools.png', type:'skill', home:[.17,.43], pace:.48,
      states:['Scant het park','Bouwt een nieuw systeem','Analyseert patronen'], copy:'Wordt scherper, sneller en uitgebreider naarmate je meer met AI bouwt.' },
    { key:'tennis', label:'Tennis', image:'img/lab/park2/tennis.png', type:'skill', home:[.78,.46], pace:.88,
      states:['Oefent de backhand','Jaagt op de bal','Neemt een korte adempauze'], copy:'Techniek en houding groeien mee: van oefenen naar wedstrijdklaar.' },
    { key:'piano', label:'Piano', image:'img/lab/park2/piano.png', type:'skill', home:[.68,.71], pace:.28,
      states:['Speelt een kleine frase','Luistert naar de stilte','Oefent dezelfde maat opnieuw'], copy:'Klank, expressie en podiumuitstraling worden rijker bij ieder nieuw niveau.' },
    { key:'good_deed', label:'Good Deed', image:'img/lab/park2/good-deed.png', type:'habit', home:[.42,.40], pace:.52,
      states:['Helpt een parkgenoot','Laat het hart opladen','Kijkt wie iets nodig heeft'], copy:'Je dagelijkse goede daden houden zijn hart warm en zijn handen krachtig.' },
    { key:'budgeting', label:'Budgeting', image:'img/lab/park2/budgeting.png', type:'habit', home:[.34,.72], pace:.38,
      states:['Telt de voorraad','Plant nieuwe groei','Zet alles netjes op een rij'], copy:'Consistent plannen laat de muntvoorraad én de tuin rondom hem groeien.' }
  ];

  var TIERS = [
    { at:0, name:'Ontwakend', description:'De basisvorm is wakker en begint te leren.' },
    { at:25, name:'In training', description:'Nieuwe details en zelfvertrouwen worden zichtbaar.' },
    { at:50, name:'Gevorderd', description:'De skill heeft een sterke, herkenbare eigen stijl.' },
    { at:75, name:'Meesterschap', description:'Aura, materialen en beweging staan op topniveau.' }
  ];

  var root, stage, agentsEl, rosterEl, detailEl, gardenEl, motionButton;
  var agents = [], width = 520, height = 430, running = true, last = 0;

  function skillData(key) {
    var defaults = window.RPG_DEFAULT_SKILLS || {};
    var def = defaults[key] || {};
    var character = (window.getCharacter && window.getCharacter()) || { skills:{} };
    var saved = (character.skills || {})[key] || {};
    var raw = window.getSkillLevel ? window.getSkillLevel(key, saved.xp || 0)
      : (window.xpToLevel ? window.xpToLevel(saved.xp || 0) : 1);
    var habit = !!def.isHabit;
    var visual = Math.max(1, Math.min(100, habit ? raw * 10 : raw));
    return { def:def, display:raw, visual:visual, habit:habit };
  }

  function tierFor(level) {
    var tier = TIERS[0];
    for (var i=0;i<TIERS.length;i++) if (level >= TIERS[i].at) tier = TIERS[i];
    return tier;
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
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'p2-agent';
    button.dataset.skill = config.key;
    button.setAttribute('aria-label', config.label + ', ' + (data.habit ? 'score ' : 'level ') + data.display);
    button.style.setProperty('--mastery', (data.visual/100).toFixed(2));
    button.style.setProperty('--breath', (3.1 - data.visual/100).toFixed(2) + 's');
    button.innerHTML = '<img src="'+config.image+'" alt="" draggable="false">'
      + '<span class="p2-effect" aria-hidden="true"></span>'
      + '<span class="p2-badge"><span class="p2-agent-name">'+config.label+'</span><strong>'+(data.habit ? data.display+'/10' : 'L'+data.display)+'</strong></span>';
    agentsEl.appendChild(button);

    var roster = document.createElement('button');
    roster.type = 'button'; roster.textContent = config.label;
    rosterEl.appendChild(roster);

    var a = {
      config:config, data:data, el:button, roster:roster,
      x:config.home[0]*width, y:config.home[1]*height,
      targetX:config.home[0]*width, targetY:config.home[1]*height,
      pause:70 + index*22, stateIndex:index%config.states.length, moving:false
    };
    button.onclick = roster.onclick = function () { selectAgent(a, true); };
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
    var tier = tierFor(agent.data.visual);
    var levelText = agent.data.habit ? 'Score '+agent.data.display+'/10' : 'Level '+agent.data.display;
    detailEl.innerHTML = '<div class="park2-detail-head"><div><div class="park2-detail-name">'+agent.config.label+'</div>'
      + '<div class="park2-detail-copy"><b>'+agent.config.states[agent.stateIndex]+'.</b> '+agent.config.copy+'</div></div>'
      + '<div class="park2-detail-state">'+tier.name+'</div></div>'
      + '<div class="park2-detail-copy">'+levelText+' · '+tier.description+'</div>'
      + '<div class="park2-progress" style="--progress:'+agent.data.visual+'%"><i></i></div>';
  }

  function newTarget(a) {
    var roam = a.config.key === 'piano' ? .11 : .2;
    var x = a.config.home[0] + (Math.random()-.5)*roam*2;
    var y = a.config.home[1] + (Math.random()-.5)*roam*1.25;
    a.targetX = Math.max(55, Math.min(width-55, x*width));
    a.targetY = Math.max(215, Math.min(height-43, y*height));
    a.pause = 80 + Math.random()*210;
    a.stateIndex = Math.floor(Math.random()*a.config.states.length);
  }

  function updateAgent(a, delta) {
    if (a.pause > 0) { a.pause -= delta*.06; a.moving = false; }
    else {
      var dx = a.targetX-a.x, dy = a.targetY-a.y;
      var dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < 3) { newTarget(a); a.moving = false; }
      else {
        var speed = (.016 + a.config.pace*.018) * delta;
        a.x += dx/dist*speed; a.y += dy/dist*speed; a.moving = true;
      }
    }
    var perspective = .82 + (a.y/height)*.23;
    var levelScale = .92 + a.data.visual/100*.13;
    a.el.style.setProperty('--x', a.x.toFixed(1)+'px');
    a.el.style.setProperty('--y', a.y.toFixed(1)+'px');
    a.el.style.setProperty('--scale', (perspective*levelScale).toFixed(3));
    a.el.style.zIndex = Math.round(a.y);
    a.el.classList.toggle('is-moving', a.moving);
    var image = a.el.querySelector('img');
    if (image) image.style.scale = (a.moving && a.targetX<a.x) ? '-1 1' : '1 1';
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
