/* ChatGPT (OpenAI), 2026-10-18. Salary-cycle budgeting, 22nd → 21st.
   All durable records use Finance's existing nw:* sync scope. Viewing/rollover
   never writes, deletes history, edits account balances or awards habit XP. */
(function (root) {
  'use strict';
  const CONFIG = 'nw:budget:settings:v1', PREFIX = 'nw:budget:period:', DAY = 86400000;
  const esc = v => String(v == null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function today(now = new Date()) { return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Amsterdam'}).format(now); }
  function dayNumber(s) { return Date.parse(s+'T00:00:00Z')/DAY; }
  function dateKey(y,m,d) { return new Date(Date.UTC(y,m,d)).toISOString().slice(0,10); }
  function validDay(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s||'') && Number.isFinite(dayNumber(s)) && new Date(dayNumber(s)*DAY).toISOString().slice(0,10)===s; }
  function cycle(date) {
    if (!validDay(date)) throw new Error('Ongeldige datum');
    const [y,m,d]=date.split('-').map(Number), month=m-1-(d<22?1:0);
    const start=dateKey(y,month,22), end=dateKey(y,month+1,22);
    return {start,end,last:dateKey(y,month+1,21),days:dayNumber(end)-dayNumber(start)};
  }
  // Accept Dutch decimal commas and grouped amounts; reject ambiguous input,
  // excess precision, Infinity and negatives before converting to integer cents.
  function cents(input) {
    let s=String(input).trim().replace(/[€\s]/g,'');
    if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(s)) s=s.replace(/\./g,'').replace(',','.');
    else if (/^\d+(?:[.,]\d{1,2})?$/.test(s)) s=s.replace(',','.');
    else return null;
    const result=Math.round(Number(s)*100);
    return Number.isSafeInteger(result)&&result>=0&&result<=1e12?result:null;
  }
  function budgetAt(config,start) {
    const changes=Array.isArray(config&&config.changes)?config.changes:[];
    const applicable=changes.filter(x=>validDay(x.from)&&x.from<=start&&Number.isSafeInteger(x.cents)&&x.cents>=0).sort((a,b)=>a.from.localeCompare(b.from));
    return applicable.length?applicable[applicable.length-1].cents:null;
  }
  function entries(record) { return Array.isArray(record&&record.entries)?record.entries.filter(e=>e&&Number.isSafeInteger(e.cents)&&validDay(e.date)):[]; }
  function spent(record) { return entries(record).reduce((sum,e)=>sum+e.cents,0); }
  function metrics(config,record,date) {
    const p=cycle(date), budget=budgetAt(config,p.start), used=spent(record);
    const daysLeft=dayNumber(p.end)-dayNumber(date), available=budget===null?null:budget-used;
    return {...p,budget,used,available,daysLeft,over:available===null?0:Math.max(0,-available),
      daily:available===null?null:Math.floor(Math.max(0,available)/daysLeft),
      nextDays:Math.min(7,daysLeft),
      nextWeek:available===null?null:Math.floor(Math.max(0,available)*Math.min(7,daysLeft)/daysLeft),
      baselineWeek:budget===null?null:Math.floor(budget*7/p.days)};
  }
  function periods(config,date) {
    const changes=(Array.isArray(config&&config.changes)?config.changes:[]).filter(x=>validDay(x.from)).sort((a,b)=>a.from.localeCompare(b.from));
    if(!changes.length)return [];
    const current=cycle(date).start, result=[];
    for(let start=changes[0].from;start<current&&result.length<1200;start=cycle(cycle(start).end).start)result.push(cycle(start));
    return result.reverse();
  }
  const api={CONFIG,PREFIX,today,cycle,cents,budgetAt,entries,spent,metrics,periods};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(!root||typeof document==='undefined')return;
  root.GamenfyBudget=Object.freeze(api);
  const euro=n=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(n/100);
  const fmt=d=>new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
  let host, budgetDirty=false, undo=null;
  function read(key,fallback) {
    const raw=localStorage.getItem(key); if(raw===null)return fallback;
    const value=JSON.parse(raw);
    if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Onleesbare budgetgegevens');
    return value;
  }
  function config() { return read(CONFIG,{changes:[]}); }
  function record(start) { return read(PREFIX+start,{entries:[]}); }
  function write(key,value) { localStorage.setItem(key,JSON.stringify(value)); }
  function status(message,error=false) { const el=host.querySelector('#fbStatus');el.textContent=message;el.dataset.error=String(error); }
  function safe(action) { try { action(); } catch(error) { status('Opslaan of laden lukt nu niet. Je invoer blijft staan. Probeer opnieuw.',true);console.error('Budget:',error); } }
  function render() {
    if(!host)return;
    const openHistory=Array.from(host.querySelectorAll('[data-fb-history][open]'),el=>el.dataset.fbHistory);
    const date=today(), cfg=config(), m=metrics(cfg,record(cycle(date).start),date);
    host.querySelector('#fbPeriod').textContent=fmt(m.start)+' – '+fmt(m.last);
    host.querySelector('#fbRemaining').textContent=m.available===null?'Nog instellen':euro(m.available);
    host.querySelector('#fbRemaining').classList.toggle('fb-over',m.over>0);
    host.querySelector('#fbHeadline').textContent=m.over>0?'Over je budget':'Over deze periode';
    host.querySelector('#fbTime').textContent=m.days+' dagen in deze periode · '+Math.floor(m.days/7)+' weken'+(m.days%7?' en '+m.days%7+' dagen':'')+'. Nog '+m.daysLeft+' dagen tot de 22ste.';
    host.querySelector('#fbMetrics').innerHTML=[['Maandbudget',m.budget],['Besteed',m.used],['Ruimte komende '+m.nextDays+' dagen',m.nextWeek],['Per dag over',m.daily]].map(([label,value])=>'<div><span>'+label+'</span><strong>'+(value===null?'—':euro(value))+'</strong></div>').join('');
    host.querySelector('#fbPace').textContent=m.budget===null?'Vul je vrij besteedbare maandbudget in om te beginnen.':m.over>0?'Je zit '+euro(m.over)+' over budget. Dit blijft zichtbaar in je historie; de volgende periode begint met je ingestelde maandbudget.':'Startverdeling: '+euro(m.baselineWeek)+' per volle week. Je actuele ruimte wordt verdeeld over de resterende dagen, inclusief vandaag.';
    const track=host.querySelector('#fbTrack');
    track.style.width=(m.budget===null?0:m.budget===0?(m.used>0?100:0):Math.min(100,Math.max(0,m.used/m.budget*100)))+'%';
    track.classList.toggle('fb-overfill',m.over>0);
    if(!budgetDirty)host.querySelector('#fbBudget').value=m.budget===null?'':(m.budget/100).toFixed(2).replace('.',',');
    const expenseDate=host.querySelector('#fbDate');expenseDate.max=date;
    const changes=Array.isArray(cfg.changes)?cfg.changes:[];
    const first=changes.map(x=>x.from).filter(validDay).sort()[0];
    expenseDate.min=first||m.start;
    host.querySelector('#fbExpenseFields').disabled=m.budget===null;
    host.querySelector('#fbTotalFields').disabled=m.budget===null;
    const list=entries(record(m.start)).slice().reverse();
    host.querySelector('#fbEntries').innerHTML=list.length?list.map(e=>'<li><div><strong>'+esc(e.label||'Uitgave')+'</strong><span>'+esc(fmt(e.date))+(e.kind==='adjustment'?' · totaalcorrectie':'')+'</span></div><b>'+esc(euro(e.cents))+'</b><button type="button" data-fb-delete="'+esc(e.id)+'" aria-label="Verwijder '+esc(e.label||'uitgave')+'">×</button></li>').join(''):'<li class="fb-empty">Nog geen uitgaven geregistreerd. Boek ook wat je eerder deze periode al uitgaf.</li>';
    host.querySelector('#fbUndo').hidden=!undo;
    const past=periods(cfg,date);
    host.querySelector('#fbHistory').innerHTML=past.length?past.map(p=>{
      const r=record(p.start), items=entries(r), budget=budgetAt(cfg,p.start), used=spent(r), diff=budget===null?null:budget-used;
      return '<details class="fb-history-row" data-fb-history="'+p.start+'"'+(openHistory.includes(p.start)?' open':'')+'><summary><span>'+esc(fmt(p.start)+' – '+fmt(p.last))+'</span><strong class="'+(diff<0?'fb-over':'')+'">'+(items.length?(diff<0?euro(-diff)+' over':euro(diff)+' overgehouden'):'Geen uitgaven geboekt')+'</strong></summary><p>Budget '+(budget===null?'onbekend':euro(budget))+' · Geregistreerd '+euro(used)+'. '+(items.length?'Op basis van je handmatige registratie.':'Deze periode is automatisch bewaard. Geen registratie betekent niet dat je niets uitgaf.')+'</p><ul>'+items.map(e=>'<li><div><strong>'+esc(e.label||'Uitgave')+'</strong><span>'+esc(fmt(e.date))+'</span></div><b>'+esc(euro(e.cents))+'</b><button type="button" data-fb-period="'+p.start+'" data-fb-delete="'+esc(e.id)+'" aria-label="Verwijder '+esc(e.label||'uitgave')+'">×</button></li>').join('')+'</ul></details>';
    }).join(''):'<p class="fb-empty">Vanaf de volgende 22ste staat je vorige periode hier, met budget, bestedingen en overschrijding.</p>';
    preview();
  }
  function preview() {
    const value=cents(host.querySelector('#fbBudget').value), el=host.querySelector('#fbPreview');
    if(value===null){el.textContent='Vul een bedrag in, bijvoorbeeld 1400 of 1.400,50.';return;}
    const date=today(), cfg=config(), p=cycle(date);
    const draft={changes:[...(cfg.changes||[]).filter(x=>x.from!==p.start),{from:p.start,cents:value}]};
    const m=metrics(draft,record(p.start),date);
    el.textContent='Na opslaan: '+(m.over>0?euro(m.over)+' over budget':euro(m.available)+' over')+' · '+euro(m.nextWeek)+' voor de komende '+m.nextDays+' dagen. Dit bedrag geldt ook voor volgende perioden.';
  }
  function id() { return root.crypto.randomUUID(); }
  function init() {
    host=document.getElementById('financeBudget');if(!host)return;
    host.innerHTML='<header class="fb-heading"><span>MIJN GELD, MIJN RUIMTE</span><h1>Budget</h1><p>Van de 22ste tot en met de 21ste. Elke uitgave maakt je resterende ruimte meteen duidelijk.</p></header>'+
      '<section class="fb-hero"><span id="fbPeriod"></span><p id="fbHeadline">Over deze periode</p><strong id="fbRemaining">—</strong><div class="fb-track"><i id="fbTrack"></i></div><p id="fbTime"></p></section><div id="fbMetrics" class="fb-metrics"></div><p id="fbPace" class="fb-note"></p>'+
      '<form id="fbBudgetForm" class="fb-card"><label for="fbBudget">Vrij besteedbaar maandbudget (€)</label><p>Het bedrag voor je variabele uitgaven, nadat je vaste lasten en gewenste reserveringen eraf zijn. Maandlasten en bankrekeningen worden hier niet automatisch mee verrekend.</p><div class="fb-input-row"><input id="fbBudget" type="text" inputmode="decimal" autocomplete="off" required placeholder="Bijv. 1400"><button type="submit">Opslaan</button></div><p id="fbPreview" aria-live="polite"></p></form>'+
      '<section class="fb-card"><h2>Uitgave boeken</h2><form id="fbExpenseForm"><fieldset id="fbExpenseFields"><div class="fb-form-grid"><label>Bedrag (€)<input id="fbAmount" type="text" inputmode="decimal" required placeholder="0,00"></label><label>Datum<input id="fbDate" type="date" required value="'+today()+'"></label></div><label>Waarvoor? <span class="fb-optional">optioneel</span><input id="fbLabel" type="text" maxlength="100" placeholder="Boodschappen, lunch, onderweg…"></label><button type="submit">+ Uitgave</button></fieldset></form><details class="fb-total"><summary>Alleen mijn bestede totaal bijwerken</summary><form id="fbTotalForm"><fieldset id="fbTotalFields"><label>Deze periode in totaal besteed (€)<input id="fbTotal" type="text" inputmode="decimal" required placeholder="Bijv. 325,50"></label><p>Voegt alleen het verschil als correctie toe. Het totaal vervangt dus geen eerder geboekte uitgaven dubbel.</p><button type="submit">Totaal bijwerken</button></fieldset></form></details></section>'+
      '<p id="fbStatus" role="status" aria-live="polite"></p><button id="fbUndo" type="button" hidden>Verwijdering herstellen</button><section class="fb-card"><h2>Deze periode</h2><ul id="fbEntries" class="fb-entries"></ul></section><section class="fb-history"><h2>Vorige perioden</h2><p>Op de 22ste begint automatisch een nieuwe periode. Je historie blijft hieronder staan, ook als je de app een tijdje niet opent.</p><div id="fbHistory"></div></section>';
    host.querySelector('#fbBudget').addEventListener('input',()=>{budgetDirty=true;safe(preview);});
    host.querySelector('#fbBudgetForm').onsubmit=event=>{event.preventDefault();safe(()=>{
      const value=cents(host.querySelector('#fbBudget').value);if(value===null){status('Vul een geldig maandbudget in, vanaf €0 en met maximaal twee decimalen.',true);return;}
      const cfg=config(), start=cycle(today()).start;
      const changes=(cfg.changes||[]).filter(x=>x.from!==start);changes.push({from:start,cents:value});changes.sort((a,b)=>a.from.localeCompare(b.from));
      write(CONFIG,{...cfg,changes});budgetDirty=false;render();status('Maandbudget opgeslagen. Je resterende ruimte is bijgewerkt.');
    });};
    host.querySelector('#fbExpenseForm').onsubmit=event=>{event.preventDefault();safe(()=>{
      const amount=cents(host.querySelector('#fbAmount').value), date=host.querySelector('#fbDate').value, cfg=config();
      const first=(cfg.changes||[]).map(x=>x.from).filter(validDay).sort()[0];
      if(amount===null||amount===0||!validDay(date)||date>today()||!first||date<first){status('Gebruik een positief bedrag en een datum binnen je budgethistorie, uiterlijk vandaag.',true);return;}
      const p=cycle(date), r=record(p.start);if(budgetAt(cfg,p.start)===null)return;
      const entry={id:id(),date,cents:amount,label:host.querySelector('#fbLabel').value.trim(),kind:'expense'};
      write(PREFIX+p.start,{...r,entries:[...entries(r),entry]});
      host.querySelector('#fbAmount').value='';host.querySelector('#fbLabel').value='';render();status('Uitgave opgeslagen'+(p.start!==cycle(today()).start?' in je vorige periode':'')+'.');
    });};
    host.querySelector('#fbTotalForm').onsubmit=event=>{event.preventDefault();safe(()=>{
      const total=cents(host.querySelector('#fbTotal').value), date=today(), p=cycle(date), r=record(p.start);
      if(total===null||budgetAt(config(),p.start)===null){status('Vul een geldig besteed totaal in.',true);return;}
      const difference=total-spent(r);
      if(difference!==0)write(PREFIX+p.start,{...r,entries:[...entries(r),{id:id(),date,cents:difference,label:'Besteed totaal bijgewerkt',kind:'adjustment'}]});
      host.querySelector('#fbTotal').value='';render();status('Besteed totaal bijgewerkt naar '+euro(total)+'.');
    });};
    host.addEventListener('click',event=>{const button=event.target.closest('[data-fb-delete]');if(!button)return;safe(()=>{
      const start=button.dataset.fbPeriod||cycle(today()).start,r=record(start),entry=entries(r).find(x=>x.id===button.dataset.fbDelete);if(!entry)return;
      const remaining=entries(r).filter(x=>x.id!==entry.id);
      if(remaining.reduce((sum,x)=>sum+x.cents,0)<0){status('Verwijder eerst de totaalcorrectie die bij deze uitgave hoort.',true);return;}
      write(PREFIX+start,{...r,entries:remaining});undo={start,entry};render();status('Boeking verwijderd. Je kunt dit hieronder herstellen.');
    });});
    host.querySelector('#fbUndo').onclick=()=>safe(()=>{if(!undo)return;const r=record(undo.start);if(!entries(r).some(e=>e.id===undo.entry.id))write(PREFIX+undo.start,{...r,entries:[...entries(r),undo.entry]});undo=null;render();status('Boeking hersteld.');});
    safe(render);
    // Repaint values on date/remote changes without replacing draft form inputs.
    root.addEventListener('storage',event=>{if(!event.key||event.key.startsWith('nw:budget:'))safe(render);});
    root.addEventListener('gamenfy:remote-state-applied',()=>safe(render));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)safe(render);});
    setInterval(()=>safe(render),60000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(typeof window!=='undefined'?window:null);
