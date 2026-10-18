(function(){
'use strict';

var KEY='gamenfy_projects_v1';
var SEED={
  v:2,
  activeId:'house-upgrade',
  projects:[{
    id:'house-upgrade',
    icon:'🏠',
    name:'House Upgrade',
    subtitle:'Huis opknappen',
    status:'active',
    summary:'Mijn open loft stap voor stap mooier, rustiger en functioneler maken — zonder ideeën, beelden en losse klusjes kwijt te raken.',
    source:'House 1.0 · geïmporteerd uit eerdere ChatGPT-gesprekken',
    layout:['Entree','Keuken / bar','Eetgedeelte + bank','Badkamer','Woonkamer','Slaapkamer'],
    constraints:[
      'Groene bank blijft',
      'TV-meubel blijft',
      'Grote TV blijft',
      'Nieuw bed blijft',
      'Grote kast links blijft op zijn plek',
      'Doorgangen en looproute blijven open',
      'Grijze bank is optioneel'
    ],
    styleDirection:'Rustig luxe · warm modern / Japandi / hotel-chic light. Weinig spullen, geen showroomgevoel. Groen, hout, zwart en beige-wit als basis met warme 2700K-verlichting.',
    areas:['Entree','Keuken / bar','Eetgedeelte','Badkamer','Woonkamer','Slaapkamer'],
    tasks:[
      {id:'task-moodboard',title:'Moodboard verzamelen en beste beelden kiezen',area:'Hele huis',done:false},
      {id:'task-room-plan',title:'Per ruimte bepalen: houden / weg / kopen',area:'Hele huis',done:false},
      {id:'task-kitchen',title:'Keukenindeling definitief maken',area:'Keuken / bar',done:false},
      {id:'task-house1-images',title:'Oude House 1.0 beelden opnieuw koppelen zodra de bestanden beschikbaar zijn',area:'Hele huis',done:false}
    ],
    ideas:[
      {id:'idea-before-after',title:'Voor- en nafoto per ruimte bewaren'},
      {id:'idea-priority',title:'Werk per ruimte met één duidelijke volgende stap'},
      {id:'idea-kitchen-calm',title:'Keuken: bestaande groene kastjes + hout behouden; koelkast visueel rustiger integreren en accessoires reduceren'},
      {id:'idea-zones',title:'Open loft zoneren met licht, vloerkleden en meubelplaatsing zonder doorgangen dicht te zetten'},
      {id:'idea-living',title:'Woonkamer: groene bank als eyecatcher; grote bank niet kleiner maken; stoel schuin tegenover de bank kan de zone afmaken'},
      {id:'idea-lighting',title:'Warme verlichting rond 2700K als vaste basis voor de hele woning'}
    ],
    shopping:[],
    moodboard:[],
    notes:'HOUSE 1.0 IMPORT — 11 oktober 2026\n\nIndeling: open loft zonder muren. Entree → keuken/bar → eetgedeelte met bank → badkamer → woonkamer → slaapkamer.\n\nVaste uitgangspunten: groene bank, TV-meubel, grote TV en nieuw bed blijven. Grote kast links staat vast. Doorgangen moeten open blijven. Grijze bank mag blijven of weg.\n\nStijlrichting uit eerdere sessies: rustig luxe, warm modern/Japandi/hotel-chic light. Weinig losse spullen, geen fantasy/thema en geen showroomgevoel. Materialen/kleuren: groen, hout, beige/crème, zwart, eventueel messing/amber glas/natuursteen als kleine accenten.\n\nKeuken: matte groene kastjes + warm houten werkblad/vloer en bestaande structuur als basis. Rustiger stylen, koelkast visueel integreren, declutteren, warme 2700K-verlichting.\n\nWoonkamer/open ruimte: zones duidelijker maken zonder muren; bank 20–30 cm van de muur kan lucht geven als de looproute dat toelaat. Een stoel schuin tegenover de bank is eerder als optie genoemd.\n\nOude gegenereerde House 1.0-beelden horen in Moodboard zodra de originele bestanden weer beschikbaar zijn.',
    createdAt:'2026-10-11T00:00:00.000Z',
    updatedAt:'2026-10-11T00:00:00.000Z'
  }]
};

var state=null;
var saveTimer=null;
var projectsCloudReady=false;
var workbookRequested=location.hash==='#mental-health';

function clone(obj){return JSON.parse(JSON.stringify(obj));}
function uid(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);}
function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch];});}
function safeUrl(value){
  var s=String(value||'').trim();
  if(!s)return '';
  try{
    var u=new URL(s,location.href);
    if(u.protocol==='http:'||u.protocol==='https:')return u.href;
  }catch(e){}
  return '';
}
function money(value){
  var n=Number(value)||0;
  return new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
}
function normalizeProject(p){
  p=p&&typeof p==='object'?p:{};
  p.id=p.id||uid('project');
  p.icon=p.icon||'📌';
  p.name=p.name||'Nieuw project';
  p.subtitle=p.subtitle||'Persoonlijk project';
  p.status=p.status||'active';
  p.summary=p.summary||'Maak het concreet en houd hier alles bij elkaar.';
  p.source=typeof p.source==='string'?p.source:'';
  p.layout=Array.isArray(p.layout)?p.layout:[];
  p.constraints=Array.isArray(p.constraints)?p.constraints:[];
  p.styleDirection=typeof p.styleDirection==='string'?p.styleDirection:'';
  p.areas=Array.isArray(p.areas)?p.areas:[];
  p.tasks=Array.isArray(p.tasks)?p.tasks:[];
  p.ideas=Array.isArray(p.ideas)?p.ideas:[];
  p.shopping=Array.isArray(p.shopping)?p.shopping:[];
  p.moodboard=Array.isArray(p.moodboard)?p.moodboard:[];
  p.notes=typeof p.notes==='string'?p.notes:'';
  if(p.kind==='workbook'){
    p.focus=typeof p.focus==='string'?p.focus:'';
    p.nextDiscussion=typeof p.nextDiscussion==='string'?p.nextDiscussion:'';
    p.linkedSkills=Array.isArray(p.linkedSkills)?p.linkedSkills:[];
    p.chapters=Array.isArray(p.chapters)?p.chapters:[];
  }
  return p;
}
function mergeUniqueById(target, additions){
  var seen={};
  (target||[]).forEach(function(x){if(x&&x.id)seen[x.id]=true;});
  (additions||[]).forEach(function(x){if(x&&x.id&&!seen[x.id]){target.push(clone(x));seen[x.id]=true;}});
}
function migrate(raw){
  if(!raw||!Array.isArray(raw.projects))return raw;
  raw.projects=raw.projects.map(normalizeProject);
  var house=raw.projects.find(function(p){return p.id==='house-upgrade';});
  var template=SEED.projects[0];
  var changed=false;
  if(house){
    if((raw.v||1)<2){
      if(!house.source){house.source=template.source;changed=true;}
      if(!house.layout.length){house.layout=clone(template.layout);changed=true;}
      if(!house.constraints.length){house.constraints=clone(template.constraints);changed=true;}
      if(!house.styleDirection){house.styleDirection=template.styleDirection;changed=true;}
      mergeUniqueById(house.tasks,template.tasks);
      mergeUniqueById(house.ideas,template.ideas);
      if(house.notes.indexOf('HOUSE 1.0 IMPORT')===-1){
        house.notes=(house.notes?house.notes+'\n\n':'')+template.notes;
        changed=true;
      }
      raw.v=2;changed=true;
    }
  }
  if(!raw.activeId&&raw.projects[0])raw.activeId=raw.projects[0].id;
  if(changed){
    try{localStorage.setItem(KEY,JSON.stringify(raw));}catch(e){}
  }
  return raw;
}
function load(){
  try{
    var raw=JSON.parse(localStorage.getItem(KEY));
    if(raw&&Array.isArray(raw.projects))return migrate(raw);
  }catch(e){}
  var seeded=clone(SEED);
  try{localStorage.setItem(KEY,JSON.stringify(seeded));}catch(e){}
  return seeded;
}
function save(message){
  if(!state)return;
  state.updatedAt=new Date().toISOString();
  var p=current();
  if(p)p.updatedAt=state.updatedAt;
  try{
    localStorage.setItem(KEY,JSON.stringify(state));
    showSave(message||'Opgeslagen');
    return true;
  }catch(e){showSave('Opslaan mislukt. Je invoer staat nog in dit venster; probeer Nu opslaan.');return false;}
}
function saveSoon(message){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(function(){save(message);},260);
}
function showSave(message){
  var el=document.getElementById('saveState');
  if(!el)return;
  el.textContent=message||'';
  clearTimeout(showSave.timer);
  if(String(message||'').indexOf('mislukt')!==-1)return;
  showSave.timer=setTimeout(function(){if(el)el.textContent='Autosave actief';},1400);
}
function current(){
  if(!state||!state.projects)return null;
  return state.projects.find(function(p){return p.id===state.activeId;})||state.projects[0]||null;
}
function projectProgress(p){
  var tasks=p.tasks||[];
  if(!tasks.length)return 0;
  return Math.round(tasks.filter(function(t){return !!t.done;}).length/tasks.length*100);
}
function nextTask(p){
  return (p.tasks||[]).find(function(t){return !t.done;})||null;
}
function shoppingTotal(p){
  return (p.shopping||[]).reduce(function(sum,item){return sum+(Number(item.price)||0);},0);
}
function renderStats(){
  var active=state.projects.filter(function(p){return p.status!=='archived';}).length;
  var open=state.projects.reduce(function(sum,p){return sum+(p.tasks||[]).filter(function(t){return !t.done;}).length;},0);
  var spend=state.projects.reduce(function(sum,p){return sum+shoppingTotal(p);},0);
  document.getElementById('statActive').textContent=active;
  document.getElementById('statOpen').textContent=open;
  document.getElementById('statSpend').textContent=money(spend);
}
function renderList(){
  var root=document.getElementById('projectList');
  if(!state.projects.length){root.innerHTML='<div class="empty">Nog geen projecten.</div>';return;}
  root.innerHTML=state.projects.map(function(p){
    var pct=projectProgress(p);
    return '<button type="button" class="project-chip'+(p.id===state.activeId?' active':'')+'" data-action="select" data-id="'+esc(p.id)+'">'+
      '<div class="project-chip-top"><span class="project-chip-name">'+esc(p.icon)+' '+esc(p.name)+'</span><span>'+(p.kind==='workbook'?'Werkboek':pct+'%')+'</span></div>'+
      '<div class="project-chip-meta">'+esc(p.subtitle||p.status)+'</div>'+
      (p.kind==='workbook'?'':'<div class="mini-bar"><i style="width:'+pct+'%"></i></div>')+
    '</button>';
  }).join('');
}
function itemList(items,type){
  if(!items.length)return '<div class="empty">Nog niets toegevoegd.</div>';
  return '<div class="stack">'+items.map(function(item){
    if(type==='task'){
      return '<div class="item'+(item.done?' done':'')+'"><button class="check'+(item.done?' done':'')+'" data-action="toggle-task" data-id="'+esc(item.id)+'">'+(item.done?'✓':'')+'</button>'+
        '<div class="item-main"><div class="item-title">'+esc(item.title)+'</div><div class="item-meta">'+esc(item.area||'Algemeen')+'</div></div>'+
        '<button class="icon-btn" data-action="remove-task" data-id="'+esc(item.id)+'" aria-label="Verwijder">×</button></div>';
    }
    if(type==='idea'){
      return '<div class="item"><div class="item-main"><div class="item-title">'+esc(item.title)+'</div></div><button class="icon-btn" data-action="remove-idea" data-id="'+esc(item.id)+'">×</button></div>';
    }
    var link=safeUrl(item.url);
    return '<div class="item"><div class="item-main"><div class="item-title">'+(link?'<a href="'+esc(link)+'" target="_blank" rel="noopener">'+esc(item.title)+'</a>':esc(item.title))+'</div><div class="item-meta">'+esc(item.note||'Wishlist')+'</div></div><div class="shop-price">'+money(item.price)+'</div><button class="icon-btn" data-action="remove-shop" data-id="'+esc(item.id)+'">×</button></div>';
  }).join('')+'</div>';
}
function moodboard(p){
  if(!p.moodboard.length)return '<div class="mood-empty">Nog geen beelden. Plak hieronder een directe afbeeldingslink + korte notitie.</div>';
  return p.moodboard.map(function(item){
    var url=safeUrl(item.url);
    if(!url)return '';
    return '<figure class="mood"><img src="'+esc(url)+'" alt="'+esc(item.title||'Moodboard')+'" loading="lazy"><figcaption class="mood-body"><div class="mood-title">'+esc(item.title||'Inspiratie')+'</div><button class="icon-btn" data-action="remove-mood" data-id="'+esc(item.id)+'">Verwijder</button></figcaption></figure>';
  }).join('');
}
function renderDetail(){
  var root=document.getElementById('projectDetail');
  var p=current();
  if(!p){root.innerHTML='';return;}
  if(p.kind==='workbook'&&window.GamenfyMentalWorkbook){root.innerHTML=window.GamenfyMentalWorkbook.render(p);return;}
  var pct=projectProgress(p);
  var next=nextTask(p);
  root.innerHTML=
    '<section class="project-hero">'+
      '<div class="project-hero-top"><div><div class="project-kicker">'+esc(p.subtitle||'Project')+'</div><div class="project-name">'+esc(p.icon)+' '+esc(p.name)+'</div><div class="project-summary">'+esc(p.summary)+'</div></div><div class="project-progress">'+pct+'%</div></div>'+
      '<div class="progress-bar"><i style="width:'+pct+'%"></i></div>'+
      '<div class="next-move">NEXT MOVE<b>'+(next?esc(next.title):'Alles afgevinkt — kies de volgende fase.')+'</b></div>'+
    '</section>'+
    '<div class="grid">'+
      (p.layout.length?'<section class="card wide house-map"><h2>House map</h2><div class="card-sub">'+esc(p.source||'Vaste woningindeling')+'</div><div class="house-flow">'+p.layout.map(function(a,i){return '<span>'+esc(a)+'</span>'+(i<p.layout.length-1?'<b>→</b>':'');}).join('')+'</div></section>':'')+
      (p.constraints.length?'<section class="card"><h2>Blijft staan</h2><div class="card-sub">Harde randvoorwaarden uit House 1.0.</div><div class="constraint-list">'+p.constraints.map(function(x){return '<div class="constraint">✓ '+esc(x)+'</div>';}).join('')+'</div></section>':'')+
      (p.styleDirection?'<section class="card"><h2>Design direction</h2><div class="card-sub">De rode draad uit de eerdere interieurgesprekken.</div><div class="style-copy">'+esc(p.styleDirection)+'</div></section>':'')+
      '<section class="card wide"><h2>Ruimtes / areas</h2><div class="card-sub">Gebruik dit als je vaste kapstok. Geen losse chats meer nodig om te onthouden waar je mee bezig was.</div><div class="area-row">'+
        p.areas.map(function(a){return '<span class="area">'+esc(a)+'</span>';}).join('')+
      '</div></section>'+
      '<section class="card"><h2>Taken</h2><div class="card-sub">Voortgang wordt automatisch uit deze lijst berekend.</div>'+itemList(p.tasks,'task')+
        '<form class="add-row" data-form="task"><input name="title" autocomplete="off" placeholder="Nieuwe taak…" required><button type="submit">+</button></form></section>'+
      '<section class="card"><h2>Ideeën</h2><div class="card-sub">Parkeer gedachten zonder ze meteen een verplichting te maken.</div>'+itemList(p.ideas,'idea')+
        '<form class="add-row" data-form="idea"><input name="title" autocomplete="off" placeholder="Nieuw idee…" required><button type="submit">+</button></form></section>'+
      '<section class="card wide"><h2>Moodboard / images</h2><div class="card-sub">Je gegenereerde beelden en referenties bij elkaar. Gebruik een directe http(s)-afbeeldingslink; zware image-data wordt bewust niet in je Supabase JSON gepropt.</div><div class="mood-grid">'+moodboard(p)+'</div>'+
        '<form class="field-grid" data-form="mood"><input name="url" inputmode="url" placeholder="https://… afbeelding" required><input name="title" placeholder="Bijv. keuken optie 2"><button class="btn primary" type="submit">Afbeelding toevoegen</button></form></section>'+
      '<section class="card wide"><h2>Shopping</h2><div class="card-sub">Wishlist + indicatiebudget. Totaal: <strong>'+money(shoppingTotal(p))+'</strong></div>'+itemList(p.shopping,'shop')+
        '<form class="field-grid" data-form="shop"><input name="title" placeholder="Item" required><input name="price" inputmode="decimal" placeholder="€"><input name="url" inputmode="url" placeholder="Link (optioneel)"><button class="btn primary" type="submit">Toevoegen</button></form></section>'+
      '<section class="card wide"><h2>Project notes / brain dump</h2><div class="card-sub">Alles wat anders in je hoofd blijft rondzingen. Dit veld autosavet.</div><textarea id="projectNotes" class="notes" placeholder="Dump hier kleuren, maten, links, twijfels en beslissingen…">'+esc(p.notes)+'</textarea><div id="saveState" class="save-state">Autosave actief</div></section>'+
    '</div>';
}
function render(){
  state=load();
  if(!state.projects.some(function(p){return p.id===state.activeId;})&&state.projects[0])state.activeId=state.projects[0].id;
  renderStats();renderList();renderDetail();
}

function openMentalWorkbook(){
  workbookRequested=true;
  if(!projectsCloudReady||!window.gamenfyUserId)return;
  if(!window.GamenfyMentalWorkbook)return;
  // Read the current merged state before adding a single empty workbook.
  state=load();
  if(!state.projects.some(function(p){return p.id==='mental-health';}))state.projects.push(normalizeProject(window.GamenfyMentalWorkbook.template()));
  state.activeId='mental-health';
  workbookRequested=false;
  save('Werkboek geopend');render();
}
function markProjectsReady(e){
  if(!e.detail||e.detail.appKey!=='projects'||!window.gamenfyUserId)return;
  projectsCloudReady=true;
  var btn=document.getElementById('openMentalWorkbookBtn');
  if(btn){btn.disabled=false;btn.textContent='Open mijn werkboek';}
  if(workbookRequested)openMentalWorkbook();
}
var workbookButton=document.getElementById('openMentalWorkbookBtn');
if(workbookButton)workbookButton.addEventListener('click',openMentalWorkbook);
window.addEventListener('gamenfy:cloud-sync-ready',markProjectsReady);
window.addEventListener('hashchange',function(){if(location.hash==='#mental-health')openMentalWorkbook();});

document.addEventListener('click',function(e){
  var btn=e.target.closest('[data-action]');
  if(!btn)return;
  var p=current();
  var id=btn.getAttribute('data-id');
  var action=btn.getAttribute('data-action');
  if(action==='select'){state.activeId=id;save('Project geopend');render();return;}
  if(!p)return;
  if(action==='save-workbook'&&p.kind==='workbook'){
    if(projectsCloudReady&&window.gamenfyUserId)save('Werkboek opgeslagen');
    return;
  }
  if(action==='copy-workbook'&&p.kind==='workbook'){
    if(!projectsCloudReady||!window.gamenfyUserId)return;
    if(navigator.clipboard&&window.GamenfyMentalWorkbook){navigator.clipboard.writeText(window.GamenfyMentalWorkbook.exportText(p)).then(function(){showSave('Werkboek gekopieerd');},function(){showSave('Kopiëren lukt niet; selecteer je notities handmatig');});}
    else showSave('Kopiëren lukt niet; selecteer je notities handmatig');
    return;
  }
  if(action==='toggle-task'){
    var task=p.tasks.find(function(x){return x.id===id;});
    if(task){task.done=!task.done;save(task.done?'Taak afgerond':'Taak heropend');render();}
  }else if(action==='remove-task'){p.tasks=p.tasks.filter(function(x){return x.id!==id;});save();render();}
  else if(action==='remove-idea'){p.ideas=p.ideas.filter(function(x){return x.id!==id;});save();render();}
  else if(action==='remove-shop'){p.shopping=p.shopping.filter(function(x){return x.id!==id;});save();render();}
  else if(action==='remove-mood'){p.moodboard=p.moodboard.filter(function(x){return x.id!==id;});save();render();}
});

document.addEventListener('submit',function(e){
  var form=e.target.closest('[data-form]');
  if(!form)return;
  e.preventDefault();
  var p=current();if(!p)return;
  if(p.kind==='workbook'&&(!projectsCloudReady||!window.gamenfyUserId))return;
  var data=new FormData(form);
  var kind=form.getAttribute('data-form');
  var title=String(data.get('title')||'').trim();
  if(kind==='chapter'&&title&&p.kind==='workbook')p.chapters.push({id:uid('chapter'),title:title,prompt:'Mijn eigen onderwerp om te onderzoeken of te bespreken.',notes:'',reviewed:false});
  if(kind==='task'&&title)p.tasks.push({id:uid('task'),title:title,area:'Algemeen',done:false});
  if(kind==='idea'&&title)p.ideas.push({id:uid('idea'),title:title});
  if(kind==='shop'&&title)p.shopping.push({id:uid('shop'),title:title,price:Number(String(data.get('price')||'').replace(',','.'))||0,url:safeUrl(data.get('url')),note:'Wishlist'});
  if(kind==='mood'){
    var url=safeUrl(data.get('url'));
    if(url)p.moodboard.push({id:uid('mood'),url:url,title:title||'Inspiratie'});
  }
  save('Toegevoegd');render();
});

document.addEventListener('input',function(e){
  var p=current();
  if(p&&p.kind==='workbook'){
    if(!projectsCloudReady||!window.gamenfyUserId)return;
    var chapterId=e.target&&e.target.getAttribute('data-chapter-notes');
    if(chapterId){var chapter=p.chapters.find(function(c){return c.id===chapterId;});if(chapter){chapter.notes=e.target.value;save('Notities opgeslagen');}return;}
    var field=e.target&&e.target.getAttribute('data-workbook-field');
    if(field==='focus'||field==='nextDiscussion'){p[field]=e.target.value;save('Notities opgeslagen');return;}
  }
  if(e.target&&e.target.id==='projectNotes'){
    if(!p)return;
    p.notes=e.target.value;
    if(p.kind==='workbook')save('Notities opgeslagen');else saveSoon('Notities opgeslagen');
  }
});
document.addEventListener('change',function(e){
  var id=e.target&&e.target.getAttribute('data-chapter-reviewed'),p=current();
  if(!id||!p||p.kind!=='workbook'||!projectsCloudReady||!window.gamenfyUserId)return;
  var chapter=p.chapters.find(function(c){return c.id===id;});
  if(chapter){chapter.reviewed=!!e.target.checked;save('Hoofdstuk bijgewerkt');var label=e.target.closest('details').querySelector('.wb-chapter-status');if(label)label.textContent=chapter.reviewed?'Verkend':'Open';var count=document.querySelector('.wb-count');if(count)count.textContent=p.chapters.length+' hoofdstukken · '+p.chapters.filter(function(c){return c.reviewed;}).length+' verkend';}
});

document.getElementById('newProjectBtn').addEventListener('click',function(){
  var name=prompt('Naam van het nieuwe project?');
  if(!name||!name.trim())return;
  var p=normalizeProject({id:uid('project'),icon:'📌',name:name.trim(),subtitle:'Persoonlijk project',status:'active',summary:'Alles voor dit project op één plek.',areas:[],tasks:[],ideas:[],shopping:[],moodboard:[],notes:'',createdAt:new Date().toISOString()});
  state.projects.push(p);state.activeId=p.id;save('Nieuw project aangemaakt');render();
});

window.addEventListener('storage',function(e){if(!e.key||e.key===KEY)render();});
window.addEventListener('gamenfy:remote-state-applied',function(e){if(e.detail&&e.detail.appKey==='projects')render();});

document.addEventListener('DOMContentLoaded',function(){
  if(typeof window.initCloudSync==='function'){
    window.initCloudSync({appKey:'projects',syncedKeys:[KEY],syncedPrefixes:[],onApplied:render});
  }
  render();
});
})();
