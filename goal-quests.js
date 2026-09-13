/* Gamenfy Command Quests — one weekly win and one monthly boss.
   Storage is deliberately separate from daily habits: a busy day can be good
   while the user still steers a meaningful outcome across a longer horizon. */
(function(){
  'use strict';

  var KEY='rpg_goal_quests_v1';
  var rewards={weekly:120,monthly:350};
  var labels={weekly:'Weekly Win',monthly:'Monthly Boss'};

  function ymd(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
  function monday(date){var d=new Date(date.getFullYear(),date.getMonth(),date.getDate());var day=d.getDay()||7;d.setDate(d.getDate()-day+1);return d;}
  function period(type,date){date=date||new Date();return type==='weekly'?ymd(monday(date)):date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0');}
  function due(type,date){
    date=date||new Date();
    if(type==='weekly'){var end=monday(date);end.setDate(end.getDate()+6);return ymd(end);}
    return ymd(new Date(date.getFullYear(),date.getMonth()+1,0));
  }
  function uid(){return (window.crypto&&window.crypto.randomUUID)?window.crypto.randomUUID():'gq-'+Date.now()+'-'+Math.random().toString(36).slice(2);}
  function loadRaw(){try{var data=JSON.parse(localStorage.getItem(KEY));return data&&typeof data==='object'?data:{};}catch(e){return {};}}
  function save(data){localStorage.setItem(KEY,JSON.stringify(data));try{window.dispatchEvent(new CustomEvent('gamenfy:goal-quests-change'));}catch(e){}}
  function normalize(){
    var data=loadRaw(),changed=false;
    data.version=1;data.history=Array.isArray(data.history)?data.history:[];
    ['weekly','monthly'].forEach(function(type){
      var currentPeriod=period(type);
      if(!data[type]||data[type].period!==currentPeriod){
        if(data[type]&&data[type].title){data.history.unshift(data[type]);data.history=data.history.slice(0,24);}
        data[type]={period:currentPeriod,quest:null};changed=true;
      }
    });
    if(changed)save(data);
    return data;
  }
  function html(value){return String(value==null?'':value).replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];});}
  function goals(){try{return (JSON.parse(localStorage.getItem('rpg_goals_v1'))||[]).filter(function(g){return g&&!g.archived&&Number(g.pct||0)<100&&g.title;});}catch(e){return [];}}
  function goalRef(goal){return String(goal.createdDate||'')+'::'+String(goal.title||'');}
  function linkedGoal(ref){return goals().find(function(goal){return goalRef(goal)===ref;})||null;}
  function allDone(quest){return !!(quest&&quest.steps&&quest.steps.length&&quest.steps.every(function(step){return step.done;}));}
  function announce(message){if(typeof window.showToast==='function')window.showToast(message,3000);}
  function reconcileReward(type,quest,wasComplete){
    var complete=allDone(quest),amount=rewards[type];
    if(complete&&!wasComplete){
      quest.rewarded=true;quest.completedAt=new Date().toISOString();
      if(typeof window.addXP==='function')window.addXP('planning',amount,labels[type]+' completed');
      announce(labels[type]+' complete · +'+amount+' Planning XP');
    }else if(!complete&&wasComplete){
      quest.rewarded=false;delete quest.completedAt;
      if(typeof window.removeXP==='function')window.removeXP('planning',amount,labels[type]+' reopened');
      announce(labels[type]+' reopened');
    }
  }
  function periodCopy(type){
    var end=due(type),d=new Date(end+'T12:00:00');
    return type==='weekly'?'Due Sun '+d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'Due '+d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  }
  function renderCard(type,state){
    var quest=state[type].quest;
    if(!quest){
      return '<article class="gq-card gq-empty"><div><span class="gq-kicker">'+labels[type]+'</span><h3>'+(type==='weekly'?'Choose this week’s win':'Choose this month’s boss')+'</h3><p>'+(type==='weekly'?'One outcome, a few concrete moves.':'The larger result you want to own this month.')+'</p></div><button type="button" data-gq-edit="'+type+'">Set quest</button></article>';
    }
    var goal=linkedGoal(quest.goalRef),done=quest.steps.filter(function(step){return step.done;}).length;
    var pct=Math.round(done/Math.max(1,quest.steps.length)*100);
    return '<article class="gq-card'+(allDone(quest)?' is-complete':'')+'">'+
      '<div class="gq-top"><div><span class="gq-kicker">'+labels[type]+'</span><h3>'+html(quest.title)+'</h3></div><button class="gq-edit" type="button" data-gq-edit="'+type+'" aria-label="Edit '+labels[type]+'">Edit</button></div>'+
      (quest.outcome?'<p class="gq-outcome">'+html(quest.outcome)+'</p>':'')+
      (goal?'<a class="gq-goal" href="character.html#goals" onclick="event.stopPropagation()">🎯 '+html(goal.title)+'</a>':'')+
      '<div class="gq-steps">'+quest.steps.map(function(step,index){return '<button type="button" class="gq-step'+(step.done?' done':'')+'" data-gq-toggle="'+type+'" data-gq-index="'+index+'" aria-pressed="'+(step.done?'true':'false')+'"><i>'+(step.done?'✓':'')+'</i><span>'+html(step.text)+'</span></button>';}).join('')+'</div>'+
      '<div class="gq-foot"><span>'+done+'/'+quest.steps.length+' moves · '+periodCopy(type)+'</span><b>'+(allDone(quest)?'COMPLETE':'+'+rewards[type]+' XP')+'</b></div><div class="gq-track"><i style="width:'+pct+'%"></i></div>'+
    '</article>';
  }
  function render(){
    var host=document.getElementById('goalQuestCards');if(!host)return;
    var state=normalize();host.innerHTML=renderCard('weekly',state)+renderCard('monthly',state);
  }
  function closeEditor(){var node=document.getElementById('gqEditor');if(node)node.remove();}
  function openEditor(type){
    var data=normalize(),existing=data[type].quest||{},stepCount=type==='weekly'?3:4;
    closeEditor();
    var overlay=document.createElement('div');overlay.id='gqEditor';overlay.className='gq-overlay';
    overlay.innerHTML='<section class="gq-sheet" role="dialog" aria-modal="true" aria-labelledby="gqEditorTitle">'+
      '<div class="gq-handle"></div><div class="gq-editor-kicker">'+labels[type]+'</div><h2 id="gqEditorTitle">'+(existing.title?'Edit your quest':'Set your command quest')+'</h2>'+
      '<label>Result<input id="gqTitle" maxlength="100" placeholder="What will be true when you win?"></label>'+
      '<label>Why / success definition<textarea id="gqOutcome" maxlength="220" rows="2" placeholder="Make the finish line unambiguous"></textarea></label>'+
      '<label>Link to a goal<select id="gqGoal"><option value="">No linked goal</option></select></label>'+
      '<div class="gq-editor-label">Concrete moves</div><div id="gqStepFields"></div>'+
      '<button class="gq-save" type="button" id="gqSave">Save '+labels[type]+'</button><button class="gq-cancel" type="button" id="gqCancel">Cancel</button>'+
    '</section>';
    document.body.appendChild(overlay);
    var title=overlay.querySelector('#gqTitle'),outcome=overlay.querySelector('#gqOutcome'),select=overlay.querySelector('#gqGoal'),fields=overlay.querySelector('#gqStepFields');
    title.value=existing.title||'';outcome.value=existing.outcome||'';
    goals().forEach(function(goal){var option=document.createElement('option');option.value=goalRef(goal);option.textContent=goal.title;select.appendChild(option);});select.value=existing.goalRef||'';
    for(var i=0;i<stepCount;i++){
      var input=document.createElement('input');input.className='gq-step-input';input.maxLength=100;input.placeholder='Move '+(i+1);input.value=(existing.steps&&existing.steps[i]&&existing.steps[i].text)||'';fields.appendChild(input);
    }
    function submit(){
      var questTitle=title.value.trim(),moveInputs=Array.from(fields.querySelectorAll('input')),moveTexts=moveInputs.map(function(input){return input.value.trim();}).filter(Boolean);
      if(!questTitle){title.focus();announce('Give this quest a clear result');return;}
      if(!moveTexts.length){moveInputs[0].focus();announce('Add at least one concrete move');return;}
      var previous=data[type].quest,wasComplete=allDone(previous);
      var oldByText={};(previous&&previous.steps||[]).forEach(function(step){oldByText[step.text]=!!step.done;});
      var quest={id:(previous&&previous.id)||uid(),type:type,period:period(type),title:questTitle,outcome:outcome.value.trim(),goalRef:select.value,steps:moveTexts.map(function(text){return {id:uid(),text:text,done:!!oldByText[text]};}),createdAt:(previous&&previous.createdAt)||new Date().toISOString(),updatedAt:new Date().toISOString(),rewarded:!!(previous&&previous.rewarded)};
      reconcileReward(type,quest,wasComplete);data[type].quest=quest;save(data);closeEditor();render();
    }
    overlay.querySelector('#gqSave').addEventListener('click',submit);overlay.querySelector('#gqCancel').addEventListener('click',closeEditor);overlay.addEventListener('click',function(event){if(event.target===overlay)closeEditor();});
    setTimeout(function(){title.focus();},40);
  }
  function toggle(type,index){
    var data=normalize(),quest=data[type]&&data[type].quest;if(!quest||!quest.steps[index])return;
    var wasComplete=allDone(quest);quest.steps[index].done=!quest.steps[index].done;quest.updatedAt=new Date().toISOString();reconcileReward(type,quest,wasComplete);save(data);render();
  }
  function onClick(event){
    var edit=event.target.closest('[data-gq-edit]');if(edit){openEditor(edit.dataset.gqEdit);return;}
    var check=event.target.closest('[data-gq-toggle]');if(check)toggle(check.dataset.gqToggle,Number(check.dataset.gqIndex));
  }
  function init(){var host=document.getElementById('goalQuestCards');if(!host)return;host.addEventListener('click',onClick);render();}

  window.GamenfyGoalQuests={render:render,open:openEditor,period:period,due:due};
  window.addEventListener('storage',function(event){if(!event.key||event.key===KEY||event.key==='rpg_goals_v1')render();});
  window.addEventListener('gamenfy:remote-state-applied',render);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
