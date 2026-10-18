/* Life plan presentation · ChatGPT (OpenAI), 2026-10-18.
   Historical plan: GAMENFY-HISTORY-ARCHIVE.md, July 31 handoff.
   Recent user clarification: liquidity measures money, not hours or XP.
   Earlier assistant SMART proposals remain explicitly unconfirmed.
   Browsing never seeds storage or overwrites existing goals. */
(function () {
  'use strict';
  const categories = [
    {id:'love',label:'Liefde',icon:'♡',title:'Een relatie waarin ik helemaal mezelf kan zijn.',
      outcome:'Een gezonde relatie met verbinding, veel lachen, plezier en intimiteit.',
      measure:'Of de relatie bij me past en ik mezelf kan zijn. In het oorspronkelijke plan stond ook een actief seksleven, circa 100 keer per jaar; dat is een persoonlijke wens, geen automatische relatie-score.',
      timing:'Oorspronkelijk: rond mijn 27e / binnen één jaar. De exacte streefdatum is nog te bevestigen.',
      long:['31 jaar · Samenwonen met de partner met wie ik kinderen wil; plezier, intimiteit en avontuur behouden.','36 jaar · Kinderen of een gezin starten; een betrokken vader en partner zijn.','51 jaar · Een langdurige liefdevolle relatie en zelfstandiger wordende kinderen.','76 jaar · Sterke banden met partner, kinderen en kleinkinderen.','126 jaar · Een leven vol liefde; mijn waarden doorgeven.'],
      linkedSkills:['dating','social']},
    {id:'money',label:'Geld',icon:'€',title:'€50.000 liquide, volledig zelf verdiend.',
      outcome:'Beschikbaar geld uit eigen verdiensten, zonder financiële hulp van ouders. Daarnaast vermogen opbouwen via investeringen, ondernemerschap en eigenaarschap.',
      measure:'Het werkelijk beschikbare, zelf verdiende bedrag. Omzet, gewerkte uren, habits en XP verhogen deze geldvoortgang niet automatisch.',
      timing:'Eerder: 27 maart 2027. Recent opnieuw “binnen één jaar” genoemd. Kies de definitieve termijn bij het uitwerken.',
      long:['31 jaar · Oorspronkelijk plan: minimaal €250.000 nettovermogen en €25.000+ liquide.','36 jaar · Oorspronkelijk plan: richting €750.000 vermogen; meer inkomen uit assets en ondernemerschap.','51 jaar · Oorspronkelijk plan: minimaal €5 miljoen nettovermogen.','76 jaar · Oorspronkelijk plan: minimaal €100 miljoen vermogen; volgende generaties ondersteunen.','126 jaar · Billionaire family legacy: vermogen én kennis doorgeven.'],
      note:'De bedragen op lange termijn beschrijven het oude levensplan en zijn niet allemaal liquide geld. Ze vervangen het huidige €50.000-doel niet. €500.000 was recent een denkbeeldige vrijheidssituatie, geen nieuw bevestigd doel.',
      linkedSkills:['saving','investing','sales','marketing']},
    {id:'freedom',label:'Vrijheid',icon:'↗',title:'Minimaal drie maanden vanuit het buitenland kunnen leven en werken.',
      outcome:'Een inkomen of bedrijf dat voldoende locatie-onafhankelijk is om te reizen, te leren en te experimenteren.',
      measure:'De daadwerkelijke mogelijkheid om minstens drie maanden weg te kunnen, met passend werk en voldoende geld.',
      timing:'Oorspronkelijk: rond mijn 27e / binnen één jaar. Exacte reis- en werkplanning nog uitwerken.',
      long:['31 jaar · Meerdere maanden per jaar reizen; mogelijk meerdere verblijfplekken wereldwijd.','36 jaar · Mijn eigen agenda bepalen en reizen combineren met een gezin.','51 jaar · Veel tijd voor reizen, hobby’s en familie.','76 jaar · Financieel vrij, zelfstandig en actief blijven.','126 jaar · Zo lang mogelijk zelfstandigheid en eigen keuzes behouden.'],
      linkedSkills:['coding','ai_tools','sales']},
    {id:'happiness',label:'Blijheid',icon:'☀',title:'Comfort, rust, gezelligheid en een voldaan weekgevoel.',
      outcome:'Comfortabel zijn met wie ik ben, trots op mijn dagelijkse keuzes en een fijne balans tussen groeien, werken, ontspannen en plezier.',
      measure:'Mijn eigen ervaring en reflectie. Er is geen door mij bevestigd exact cijfer teruggevonden.',
      timing:'Een richting voor dagelijks leven en het komende jaar; exacte meetlat en termijn nog invullen.',
      proposal:'Eerdere SMART-uitwerking door de assistent: gemiddeld minstens 8/10 levenswaardering, wekelijks reflecteren en minstens drie energiegevende activiteiten per maand. Nog te bevestigen.',
      long:['31 jaar · Stabiliteit, weinig financiële stress en genieten van wat ik opbouw.','36 jaar · Geluk uit het gezin én ruimte voor mijn ontwikkeling.','51 jaar · Trots, gezond, energiek en nieuwsgierig.','76 jaar · Fit en actief voor mijn leeftijd; hobby’s, vrienden en verhalen.','126 jaar · Dankbaarheid, weinig spijt en maximaal van mijn tijd genoten.'],
      linkedSkills:['gratitude','meditation','journaling']},
    {id:'exploration',label:'Exploration',icon:'◎',title:'Alle routes uit mijn ANWB-wandelboek lopen en blijven ontdekken.',
      outcome:'Het hele wandelboek afronden. Nieuwe plekken, ervaringen, culturen en ideeën ontdekken vanuit nieuwsgierigheid. China, AI en zakelijke mogelijkheden blijven interesses.',
      measure:'Afgeronde routes uit mijn eigen boek / het werkelijke totaal. Aantal routes en actuele stand hier nog niet vastgesteld.',
      timing:'Geen exacte einddatum voor het wandelboek teruggevonden.',
      proposal:'Eerdere SMART-uitwerking door de assistent: minstens drie nieuwe ervaringen buiten de comfortzone binnen één jaar. Nog te bevestigen.',
      long:['31 jaar · Reizen en nieuwe ervaringen zijn een normaal onderdeel van mijn leven.','36 jaar · Samen met mijn gezin de wereld en nieuwe hobby’s ontdekken.','51 jaar · Meer reizen en verdiepen in natuur, cultuur en hobby’s.','76 jaar · Blijven reizen en nieuwsgierig blijven.','126 jaar · Het leven en de wereld zo diep mogelijk onderzocht.'],
      linkedSkills:['walking','learning','languages']}
  ];
  const extra = [
    {id:'body',category:'happiness',title:'Een sixpack, een gespierder uiterlijk en veel meer flexibiliteit.',why:'Thuis sterker en soepeler worden, met calisthenics en maximaal twintig minuten per dag.',measure:'De trainingsduur is een randvoorwaarde. Eindniveau, meetcriteria en deadline voor het lichamelijke resultaat zijn nog niet vastgelegd.',linkedSkills:['strength','calisthenics','stretching']},
    {id:'business',category:'money',title:'Ondernemer en investeerder worden bij meerdere bedrijven.',why:'Bedrijven helpen verbeteren, eigenaarschap opbouwen en uiteindelijk angel investor en adviseur worden.',measure:'Langetermijnrichting. Administratie, websites en bedrijfsverbetering zijn mogelijke routes; nog geen nieuwe vaste omzet- of klantdoelstelling.',linkedSkills:['sales','marketing','investing']},
    {id:'home',category:'happiness',title:'Mijn huis opknappen.',why:'Een fijn thuis maken en ideeën, wensen, taken en referenties overzichtelijk bijhouden.',measure:'Persoonlijk project; scope, budget en deadline nog bepalen. Het projectwerkboek staat bij Projects.',linkedSkills:[]}
  ];
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function categoryLabel(id) { return (categories.find(c=>c.id===id)||{}).label || ''; }
  function saved() { try { const g=JSON.parse(localStorage.getItem('rpg_goals_v1'));return Array.isArray(g)?g:[]; } catch (_) { return []; } }
  function seed(id) {
    const c=categories.find(c=>c.id===id), x=extra.find(c=>c.id===id);
    if(c) return {title:c.title,why:c.outcome,measure:c.measure,category:c.id,linkedSkills:c.linkedSkills.slice(),deadline:'',sourceId:'life-plan:'+c.id};
    if(x) { const {id,...fields}=x;return {...fields,deadline:'',linkedSkills:x.linkedSkills.slice(),sourceId:'life-plan:'+id}; }
    return null;
  }
  function render() {
    const host=document.getElementById('lifeGoalsOverview');if(!host)return;
    const open = Array.from(host.querySelectorAll('details[open][data-lg-category]')).map(d=>d.dataset.lgCategory);
    const own=saved();
    host.innerHTML='<header class="lg-heading"><span>MIJN LEVENSPLAN</span><h2>Your Goals</h2><p>Vijf richtingen. Wat ik wil bereiken, waarom het telt en hoe ik het meet.</p></header><div class="lg-categories">'+categories.map(c=>{
      const current=own.find(g=>g.sourceId==='life-plan:'+c.id&&!g.archived);
      return '<details class="lg-category" data-lg-category="'+c.id+'"'+(open.includes(c.id)?' open':'')+'><summary><span class="lg-icon" aria-hidden="true">'+c.icon+'</span><span><strong>'+c.label+'</strong><span class="lg-summary">'+esc(current?current.title:c.title)+'</span></span><span class="lg-arrow" aria-hidden="true">＋</span></summary><div class="lg-body">'+
        '<dl><dt>Gewenste uitkomst</dt><dd>'+esc(current?current.why:c.outcome)+'</dd><dt>Hoe ik het meet</dt><dd>'+esc(current&&current.measure?current.measure:c.measure)+'</dd><dt>Termijn</dt><dd>'+esc(current&&current.deadline?current.deadline:c.timing)+'</dd></dl>'+
        (c.proposal?'<p class="lg-proposal"><strong>Eerdere uitwerking · nog bevestigen</strong>'+esc(c.proposal)+'</p>':'')+
        '<details class="lg-long"><summary>Mijn langere termijn · 31 tot 126 jaar</summary><ul>'+c.long.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>'+(c.note?'<p>'+esc(c.note)+'</p>':'')+'</details>'+
        '<button type="button" data-lg-edit="'+c.id+'">'+(current?'Mijn doel aanpassen':'Uitwerken als doel')+'</button></div></details>';
    }).join('')+'</div><details class="lg-extras"><summary>Aanvullende doelen & projecten</summary>'+extra.map(x=>'<article><strong>'+esc(x.title)+'</strong><p>'+esc(x.why)+'</p><p>'+esc(x.measure)+'</p><button type="button" data-lg-edit="'+x.id+'">Uitwerken als doel</button></article>').join('')+'</details><p class="lg-footnote">Dit overzicht bewaart je teruggevonden basis en je oudere levensplan. Open termijnen en eerdere voorstellen blijven herkenbaar. Je eigen uitgewerkte doelen staan hieronder.</p>';
  }
  function init() {
    const host=document.getElementById('lifeGoalsOverview');if(!host)return;
    host.addEventListener('click',event=>{
      const button=event.target.closest('[data-lg-edit]');if(!button||typeof window.openGoalEditor!=='function')return;
      const data=seed(button.dataset.lgEdit);if(!data)return;
      const index=saved().findIndex(g=>g.sourceId===data.sourceId&&!g.archived);
      window.openGoalEditor(index<0?null:index,index<0?data:undefined);
    });
    render();
  }
  window.GamenfyLifeGoals=Object.freeze({categories:categories.map(c=>({id:c.id,label:c.label})),categoryLabel,render,seed});
  window.addEventListener('storage',event=>{if(!event.key||event.key==='rpg_goals_v1')render();});
  window.addEventListener('gamenfy:remote-state-applied',render);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
