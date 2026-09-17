(function(){
  'use strict';
  function node(tag,text){var e=document.createElement(tag);if(text)e.textContent=text;return e;}
  function dialog(title){var d=node('dialog');d.className='gw-dialog';var h=node('header');h.append(node('strong',title));var close=node('button','Sluiten');close.type='button';close.onclick=function(){d.close();};h.append(close);d.append(h);d.addEventListener('close',function(){d.remove();});document.body.append(d);return d;}
  document.querySelectorAll('[data-gw-frame]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var d=dialog(a.textContent),f=node('iframe');f.title=a.textContent;f.src=a.href;var link=node('a','Apart openen');link.href=a.href;link.target='_blank';link.rel='noopener';d.append(link,f);d.showModal();});});
  var steps=document.getElementById('gwSteps'),memory=document.getElementById('gwMemory');
  if(steps||memory)fetch('GAMENFY-WORKSPACE.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw Error();return r.json();}).then(function(data){
    if(steps){steps.textContent='';data.steps.forEach(function(s){var d=node('details');d.className='gw-step';d.append(node('summary',s.title),node('p',s.why),node('p',s.next),node('small',s.gate));steps.append(d);});}
    if(memory){memory.textContent='';[['Afspraken',data.agreements],['Feedback die open blijft',data.feedback]].forEach(function(group){var d=node('details');d.append(node('summary',group[0]));var list=node('ul');group[1].forEach(function(t){list.append(node('li',t));});d.append(list);memory.append(d);});}
  }).catch(function(){(steps||memory).textContent='Overzicht kon niet laden. Vernieuw deze pagina om opnieuw te proberen.';});
})();
