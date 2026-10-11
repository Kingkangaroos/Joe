/* ChatGPT: presentation only. Habit state and XP stay in the existing engine. */
(function(){
  'use strict';
  var active=null,version=0,timer=null;
  function cancel(key){if(key&&active&&active.key!==key)return;version++;clearTimeout(timer);if(active)active.node.remove();active=null;}
  function play(options){
    cancel();var id=version,box=document.createElement('section');
    box.className='home-habit-evolution';box.setAttribute('aria-label',options.label+' voltooid');
    var card=document.createElement('div');card.className='he-card';
    var title=document.createElement('h2');title.textContent=options.label;
    var status=document.createElement('p');status.className='he-status';status.setAttribute('role','status');
    status.textContent=options.from<options.to?'LEVEL '+options.from+' → '+options.to:'Vandaag voltooid';
    var actor=document.createElement('div');actor.className='he-actor';
    var oldArt=document.createElement('img'),newArt=document.createElement('img');
    oldArt.className='he-old';newArt.className='he-new';oldArt.alt='';newArt.alt='';
    var close=document.createElement('button');close.className='he-close';close.type='button';close.textContent='×';close.setAttribute('aria-label','Sluit evolutie');close.addEventListener('click',function(){cancel();});
    actor.append(oldArt,newArt);card.append(close,title,actor,status);box.append(card);active={node:box,key:options.key};
    var loaded=0,started=false;
    function start(){
      if(id!==version||started)return;started=true;clearTimeout(timer);
      document.getElementById('celBg')?.remove();document.body.appendChild(box);
      var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(!reduced&&options.from<options.to&&options.key!=='workout')box.classList.add('he-running');
      else{oldArt.style.opacity='0';newArt.style.opacity='1';}
      timer=setTimeout(function(){if(id===version)cancel();},2800);
    }
    function ready(){loaded++;if(loaded===2)start();}
    oldArt.onload=ready;newArt.onload=ready;
    oldArt.onerror=newArt.onerror=function(){if(id!==version)return;oldArt.hidden=true;newArt.hidden=true;start();};
    oldArt.src=options.oldSrc;newArt.src=options.newSrc;
    timer=setTimeout(function(){if(id===version){oldArt.hidden=true;newArt.hidden=true;start();}},2500);
  }
  window.GamenfyHabitEvolution={play:play,cancel:cancel};
  window.addEventListener('pagehide',function(){cancel();});
})();
