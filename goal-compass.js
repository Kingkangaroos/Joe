/* ChatGPT: goal direction and measured outcomes; never awards XP or changes balances. */
(function () {
  'use strict';
  const KEY = 'rpg_goal_compass_v1';
  const moneyId = 'freedom-money';
  const money = { id: moneyId, title: '€50.000 liquide, zelf verdiend', deadline: '', why: 'Vrijheid om te reizen, te ondernemen en te experimenteren. Uiteindelijk bedrijven helpen groeien en zelf investeren.' };
  let selected = moneyId;
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } }
  function state() { const s = read(KEY, {}); return s && !Array.isArray(s) && typeof s === 'object' ? s : {}; }
  function list() {
    const raw = read('rpg_goals_v1', []);
    return [money].concat((Array.isArray(raw) ? raw : []).filter(g => g && g.title && !g.archived).map(g => ({...g, id: 'goal:' + (g.id || (g.createdDate || '') + ':' + g.title)})));
  }
  function day() { return new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Amsterdam'}).format(new Date()); }
  function daysLeft(date) { const d = Date.parse(date + 'T00:00:00Z'); return Number.isFinite(d) ? Math.round((d - Date.parse(day() + 'T00:00:00Z')) / 86400000) : null; }
  const euros = n => new Intl.NumberFormat('nl-NL', {style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  function view() {
    const g = list().find(g => g.id === selected) || money;
    selected = g.id;
    const s = state()[selected] || {};
    const isMoney = selected === moneyId;
    const validAmount = typeof s.amount === 'number' && Number.isFinite(s.amount) && s.amount >= 0;
    const target = typeof s.target === 'number' && s.target > 0 ? s.target : 50000;
    const pct = isMoney ? (validAmount ? Math.min(100, s.amount / target * 100) : null) : Math.max(0, Math.min(100, Number(g.pct) || 0));
    return {g,s,isMoney,target,pct,validAmount,deadline:s.deadline === undefined ? g.deadline || '' : s.deadline};
  }
  function render() {
    const host = document.getElementById('goalCompass'); if (!host) return;
    if (host.querySelector('form')) return; // preserve an in-progress edit during cloud refresh
    const {g,s,isMoney,target,pct,validAmount,deadline} = view();
    const remaining = daysLeft(deadline);
    const count = remaining === null ? 'Geen einddatum' : remaining > 0 ? remaining + ' dagen over' : remaining === 0 ? 'Streefdatum vandaag' : 'Streefdatum verstreken · kies je vervolg';
    const why = s.why === undefined ? g.why || 'Wat maakt dit doel voor jou de moeite waard?' : s.why;
    const next = s.next === undefined ? (isMoney ? 'Beschrijf één administratieproef: welke werkzaamheden, voor wie en maximaal hoeveel uur per week. Gebruik dit om toestemming te bespreken.' : 'Kies één concrete stap die dit doel dichterbij brengt.') : s.next;
    const title = isMoney ? euros(target) + ' liquide, zelf verdiend' : g.title;
    host.innerHTML = '<div class="gc-top"><span class="gc-kicker">JOUW RICHTING</span><a href="character.html#goals">Alle doelen ↗</a></div>' +
      '<label class="gc-select-label">Kies je doel<select id="gcSelect">' + list().map(x => '<option value="' + esc(x.id) + '"' + (x.id === selected ? ' selected' : '') + '>' + esc(x.title) + '</option>').join('') + '</select></label>' +
      '<h2>' + esc(title) + '</h2><p class="gc-why">' + esc(why) + '</p>' +
      '<div class="gc-metrics"><strong>' + (pct === null ? 'Nog geen meting' : new Intl.NumberFormat('nl-NL',{maximumFractionDigits:1}).format(pct) + '%') + '</strong><button type="button" id="gcTimer" aria-pressed="' + !s.hideTimer + '">' + (s.hideTimer ? 'Toon dagen' : esc(count)) + '</button></div>' +
      (pct === null ? '' : '<div class="gc-track" role="progressbar" aria-label="Doelvoortgang" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><i style="width:'+pct+'%"></i></div>') +
      '<p class="gc-source">' + (isMoney ? (validAmount ? esc(euros(s.amount)) + ' van ' + esc(euros(target)) + ' · zelf opgegeven op ' + esc(s.measured || 'onbekende datum') : 'Vul je huidige beschikbare bedrag in. Onbekend is niet hetzelfde als 0%.') : 'Je handmatig bijgehouden voortgang uit Goals.') + '</p>' +
      '<div class="gc-next"><span class="gc-kicker">JE EERSTVOLGENDE STAP</span><p>' + esc(next) + '</p></div>' +
      '<div class="gc-actions"><button id="gcEdit" type="button">' + (isMoney ? 'Bedrag & richting bijwerken' : 'Richting bijwerken') + '</button><a href="character.html#goals">Doelen beheren</a></div>' +
      (isMoney ? '<details class="gc-route"><summary>Mijn route naar vrijheid</summary><p><b>Inkomstenbasis:</b> een kleine administratieproef met duidelijke afspraken over nevenwerkzaamheden. Tijd begrenzen zodat er ruimte blijft om te bouwen.</p><p><b>Verder onderzoeken:</b> websites verkopen en uitvoering leren overdragen; het bestaande barbershopmodel toepassen.</p><p><b>Barbershop:</b> benchmark → gesprek → diagnose → één experiment → meten → case study.</p><p><b>Lange termijn:</b> bedrijven verbeteren, belangen opbouwen en uiteindelijk angel investor worden.</p><p>Dit percentage meet beschikbaar geld uit eigen verdiensten. Neem geld dat je moet reserveren voor belasting of verplichtingen niet mee. Omzet, gewerkte uren en habits vullen deze balk niet automatisch.</p><p>De haalbaarheid staat nog open: daarvoor zijn je huidige bedrag en wat je werkelijk kunt overhouden nodig. Een datum is een richtpunt, geen oordeel.</p><a href="ventures-workspace.html">Verder in Ventures ↗</a></details>' : '') + '<p id="gcStatus" role="status" class="gc-source"></p>';
    host.querySelector('#gcSelect').onchange = e => {selected=e.target.value; render();};
    host.querySelector('#gcTimer').onclick = () => save({hideTimer:!s.hideTimer});
    host.querySelector('#gcEdit').onclick = edit;
  }
  function save(patch) {
    const all = state(); all[selected] = {...all[selected], ...patch};
    try { localStorage.setItem(KEY, JSON.stringify(all)); }
    catch (_) { const status=document.getElementById('gcStatus'); if(status)status.textContent='Opslaan lukte niet. Je invoer blijft staan; probeer opnieuw.'; return false; }
    return true;
  }
  function edit() {
    const host=document.getElementById('goalCompass');
    const {s,isMoney,target,validAmount,deadline,g}=view();
    const form=document.createElement('form'); form.className='gc-form';
    form.innerHTML=(isMoney ? '<label>Beschikbaar uit eigen verdiensten (€)<input name="amount" type="number" min="0" step="0.01" placeholder="Nog niet ingevuld" value="'+(validAmount?s.amount:'')+'"></label><small>Na reserveringen voor belasting en verplichtingen. Geen omzet of beleggingswaarde.</small><label>Doelbedrag (€)<input name="target" type="number" min="1" step="0.01" required value="'+target+'"></label>' : '')+
      '<label>Streefdatum<input name="deadline" type="date" value="'+esc(deadline)+'"></label><label>Waarom wil ik dit?<textarea name="why" maxlength="600" rows="3"></textarea></label><label>Eerstvolgende concrete stap<textarea name="next" maxlength="500" rows="3"></textarea></label><div class="gc-actions"><button type="submit">Opslaan</button><button type="button" id="gcCancel">Annuleren</button></div><p id="gcStatus" role="status"></p>';
    form.elements.why.value=s.why===undefined?g.why||'':s.why;
    form.elements.next.value=host.querySelector('.gc-next p').textContent;
    host.replaceChildren(form);
    form.querySelector('#gcCancel').onclick=()=>{form.remove();render();};
    form.onsubmit=e=>{e.preventDefault();const patch={why:form.elements.why.value.trim(),next:form.elements.next.value.trim(),deadline:form.elements.deadline.value};
      if(isMoney){patch.target=Number(form.elements.target.value);patch.amount=form.elements.amount.value===''?null:Number(form.elements.amount.value);patch.measured=day();if(!Number.isFinite(patch.target)||patch.target<=0||(patch.amount!==null&&(!Number.isFinite(patch.amount)||patch.amount<0)))return;}
      if(save(patch)){form.remove();render();document.getElementById('gcStatus').textContent='Opgeslagen. Je geldvoortgang verandert alleen als je het bedrag bijwerkt.';}
    };
    form.querySelector('input,textarea').focus();
  }
  function init(){render();const host=document.getElementById('goalCompass');if(host)host.addEventListener('click',e=>{if(e.target.id==='gcTimer')render();});}
  window.addEventListener('storage',e=>{if(!e.key||e.key===KEY||e.key==='rpg_goals_v1')render();});
  window.addEventListener('gamenfy:remote-state-applied',render);
  window.addEventListener('cloud-sync-ready',render);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
