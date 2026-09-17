(function(root){
  'use strict';
  function key(owner){return 'gamenfy_updates_seen_v1:'+encodeURIComponent(owner);}
  function read(storage,owner){try{var x=JSON.parse(storage.getItem(key(owner))||'[]');return Array.isArray(x)?x.filter(function(v){return typeof v==='string';}):[];}catch(e){return [];}}
  function relevant(releases,surface){return releases.filter(function(r){return surface==='lab'||r.surfaces.indexOf(surface)!==-1;});}
  function unread(releases,seen){return releases.filter(function(r){return seen.indexOf(r.id)===-1;});}
  function acknowledge(storage,owner,ids){if(!owner)return false;try{storage.setItem(key(owner),JSON.stringify(Array.from(new Set(read(storage,owner).concat(ids)))));return true;}catch(e){return false;}}
  var api={key:key,read:read,relevant:relevant,unread:unread,acknowledge:acknowledge};
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  var box=document.getElementById('gamenfyUpdates');if(!box)return;
  var releases=[],loaded=false,surface=document.body.dataset.updatesSurface||'lab';
  function storage(){try{return root.localStorage;}catch(e){return null;}}
  function node(tag,text){var el=document.createElement(tag);if(text)el.textContent=text;return el;}
  function button(text,action){var b=node('button',text);b.className='gw-button';b.type='button';b.onclick=action;return b;}
  function render(){if(!loaded||!root.gamenfyUserId)return;var list=relevant(releases,surface),pending=unread(list,read(storage(),root.gamenfyUserId));box.textContent='';box.append(node('strong',pending.length?'Nieuw voor jou · '+pending.length+' update(s)':'Wat is er nieuw?'));if(surface==='lab'&&list[0])box.append(node('p',list[0].title));box.append(node('p',pending.length?'Je hoeft niets uit de chat te onthouden. Hier staat wat er is uitgevoerd.':'Alle eerdere updates blijven in het log staan.'),button(pending.length?'Bekijk wijzigingen':'Bekijk het log',open));}
  function open(){
    var owner=root.gamenfyUserId;if(!owner)return;var d=node('dialog');d.className='gw-dialog';d.setAttribute('aria-label','Wijzigingslog');var h=node('header');h.append(node('strong','Uitgevoerd door ChatGPT'),button('Sluiten',function(){d.close();}));d.append(h,node('p','Gezien-status geldt voor dit account op dit apparaat. Sluiten markeert niets als gelezen; gezien is geen ontwerpgoedkeuring.'));
    releases.forEach(function(r){var a=node('article');a.append(node('small',r.date),node('h2',r.title),node('p',r.why));var ul=node('ul');r.changes.forEach(function(t){ul.append(node('li',t));});a.append(ul,node('p','Probeer: '+r.try),node('p','Nog open: '+r.remaining));d.append(a);});
    var error=node('p');error.setAttribute('role','status');d.append(button('Deze updates gezien',function(){if(root.gamenfyUserId!==owner){error.textContent='Je account is gewijzigd. Sluit dit venster en open het opnieuw.';return;}if(acknowledge(storage(),owner,releases.map(function(r){return r.id;}))){render();d.close();}else error.textContent='Opslaan lukte niet; de updates blijven als nieuw staan.';}),error);d.addEventListener('close',function(){d.remove();});document.body.append(d);d.showModal();
  }
  root.addEventListener('gamenfy-auth-ready',render);root.addEventListener('storage',render);
  fetch('GAMENFY-RELEASES.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw Error();return r.json();}).then(function(data){releases=data.releases;loaded=true;render();}).catch(function(){box.textContent='Wijzigingslog kon niet laden. Vernieuw om opnieuw te proberen.';});
})(typeof window!=='undefined'?window:globalThis);
