(() => {
 const day = () => { const d=new Date(); return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000 };
 window.mountDisciplineChallenge = anchor => {
 if(!anchor)return;
 const box=document.createElement('section');anchor.after(box);
 box.style.cssText='border:1px solid #8886;border-radius:16px;padding:16px;margin:12px 0;text-align:left';
 const key='discipline_study_challenge_v1';let selected=null;
 function draw(){box.replaceChildren();const add=(tag,t)=>{let e=document.createElement(tag);e.textContent=t;box.append(e);return e};
 const btn=(t,fn)=>{let b=add('button',t);b.type='button';b.style.cssText='padding:9px;margin:3px;border:1px solid #8888;border-radius:9px;cursor:pointer';b.onclick=fn;return b};
 let s;try{s=JSON.parse(localStorage.getItem(key));}catch{add('p','Je opgeslagen uitdaging kan niet worden gelezen.');return}
 function save(v){try{localStorage.setItem(key,JSON.stringify(v));draw()}catch{add('p','Opslaan op dit apparaat is niet gelukt.')}}
 add('small','DISCIPLINE · 30 DAGEN');add('h3',s?s.goal:'Jouw uitdaging');
 if(!s){add('p','Wat wil je elke dag oefenen?');let input=add('input','');input.value='Nederlands studeren';input.maxLength=80;input.setAttribute('aria-label','Jouw dagelijkse doel');btn('Start 30 dagen',()=>{if(input.value.trim())save({goal:input.value.trim(),start:day(),log:{}})});return}
 const elapsed=Math.max(0,day()-s.start),last=Math.min(29,elapsed),done=Object.values(s.log).filter(x=>x===1).length;
 add('b',elapsed>=30?'Uitdaging afgerond':'Dag '+(last+1)+' van 30 · '+(29-last)+' dagen na vandaag');
 let p=add('progress','');p.max=30;p.value=done;p.style.cssText='display:block;width:100%;margin:10px 0';p.setAttribute('aria-label','Gedane dagen');
 add('p',done+' / 30 dagen gedaan · '+Object.values(s.log).filter(x=>x===0).length+' niet gedaan');
 add('p',done>=30?'30 keer geoefend. Kijk terug: wat gaat je nu gemakkelijker af?':done>=14?'Je hebt al twee weken aan oefendagen verzameld. Vergelijk je werk eens met dag één.':done>=7?'Zeven oefendagen bereikt. Welke aanpak wil je volgende week herhalen?':done?'Je hebt de eerste stap gezet. Herhaal morgen iets van vandaag.':'Begin klein: vijf minuten oefenen telt ook.');
 add('p','Kies een dag om bij te werken. Een gemiste dag wist je voortgang niet.');
 let grid=add('div','');grid.style.cssText='display:grid;grid-template-columns:repeat(6,1fr);gap:3px';
 selected=selected===null?last:Math.min(selected,last);
 for(let i=0;i<30;i++){let v=s.log[i],b=btn((i+1)+(v===1?' ✓':v===0?' ×':''),()=>{selected=i;draw()});grid.append(b);b.disabled=i>last;b.setAttribute('aria-label','Dag '+(i+1)+': '+(v===1?'gedaan':v===0?'niet gedaan':'open'));b.setAttribute('aria-pressed',String(i===selected));if(i===selected)b.style.outline='2px solid #b79032'}
 add('p','Dag '+(selected+1)+' · '+(s.log[selected]===1?'Gedaan':s.log[selected]===0?'Niet gedaan':'Nog open'));
 for(const [t,v] of [['✓ Gedaan',1],['× Niet gedaan',0]])btn(t,()=>{s.log[selected]=v;save(s)});
 add('small',' Opgeslagen op dit apparaat.');
 }draw();
 };})();