/* Personal workbook scaffold · ChatGPT (OpenAI), 2026-10-18.
   Empty user-authored notes only. No assessment, diagnosis, AI request or XP writes. */
(function () {
  'use strict';
  var chapters = [
    ['starting-point','Mijn startpunt','Wat wil ik onderzoeken? Wat hoop ik dat er verandert?'],
    ['patterns','Patronen & situaties','Welke situaties wil ik bespreken? Wat valt me op als ik erop terugkijk?'],
    ['thoughts-feelings','Gedachten & gevoelens','Wat ging er door me heen? Wat voelde of merkte ik op?'],
    ['needs-boundaries','Behoeften & grenzen','Wat heb ik nodig? Welke wensen of grenzen wil ik onderzoeken?'],
    ['research','Onderzoeken & bespreken','Welke vragen, onderwerpen of bronnen wil ik met de andere chat bespreken?'],
    ['experiments','Proberen & terugkijken','Wat wil ik uitproberen? Wat heb ik daarna opgemerkt of geleerd?']
  ];
  var skills = {journaling:'Journaling',meditation:'Meditation',gratitude:'Gratitude'};
  function esc(value) { return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function template() {
    return {id:'mental-health',kind:'workbook',icon:'📓',name:'Mental health',subtitle:'Zelfonderzoek & reflectie',status:'active',summary:'Een persoonlijk werkboek om mijn vragen, gedachten, onderzoek en volgende stappen bij elkaar te houden.',goalCategory:'happiness',focus:'',nextDiscussion:'',linkedSkills:['journaling','meditation','gratitude'],chapters:chapters.map(function(c){return {id:c[0],title:c[1],prompt:c[2],notes:'',reviewed:false};}),areas:[],tasks:[],ideas:[],shopping:[],moodboard:[],notes:'',createdAt:new Date().toISOString()};
  }
  function exportText(p) {
    return '# '+p.name+'\n\nDoel en bedoeling:\n'+(p.focus||'Nog in te vullen')+'\n\n'+(p.chapters||[]).map(function(c){return '## '+c.title+'\n'+(c.notes||'(Nog geen notities)');}).join('\n\n')+'\n\n## Voor mijn volgende gesprek\n'+(p.nextDiscussion||'Nog in te vullen')+'\n\n## Vrije notities\n'+(p.notes||'(Leeg)');
  }
  function render(p) {
    var list=p.chapters||[], reviewed=list.filter(function(c){return c.reviewed;}).length;
    return '<section class="project-hero workbook-hero"><div class="project-kicker">Persoonlijk werkboek · Blijheid</div><h1 class="project-name">📓 '+esc(p.name)+'</h1><p class="project-summary">'+esc(p.summary)+'</p><p class="wb-count">'+list.length+' hoofdstukken · '+reviewed+' verkend</p><p class="wb-explainer">De hoofdstukken zijn een startstructuur. Vul ze samen met je gesprekspartner in en voeg je eigen onderwerpen toe.</p></section>'+
      '<section class="card wb-intro"><label for="workbookFocus"><h2>Doel & bedoeling</h2></label><p class="card-sub">Waar wil ik aan werken, en waarom is dit belangrijk voor mij?</p><textarea id="workbookFocus" class="notes" data-workbook-field="focus" placeholder="Dit wil ik onderzoeken of veranderen…">'+esc(p.focus)+'</textarea><div class="wb-skills"><span>Ondersteunende skills · optioneel</span>'+(p.linkedSkills||[]).filter(function(k){return skills[k];}).map(function(k){return '<a href="character.html#skill='+k+'">'+skills[k]+' ↗</a>';}).join('')+'</div><a class="wb-goals-link" href="character.html#goals">Terug naar mijn doelen ↗</a></section>'+
      '<section class="wb-chapters" aria-label="Hoofdstukken">'+list.map(function(c,i){return '<details class="card wb-chapter"><summary><span class="wb-chapter-number">'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(c.title)+'</strong><span class="wb-chapter-status">'+(c.reviewed?'Verkend':'Open')+'</span></summary><p class="card-sub">'+esc(c.prompt)+'</p><label class="wb-label" for="wb-'+esc(c.id)+'">Mijn notities</label><textarea class="notes" id="wb-'+esc(c.id)+'" data-chapter-notes="'+esc(c.id)+'" placeholder="Schrijf hier wat je wilt bewaren of bespreken…">'+esc(c.notes)+'</textarea><label class="wb-reviewed"><input type="checkbox" data-chapter-reviewed="'+esc(c.id)+'"'+(c.reviewed?' checked':'')+'> Dit hoofdstuk heb ik verkend</label></details>';}).join('')+'</section>'+
      '<form class="add-row wb-add" data-form="chapter"><input name="title" autocomplete="off" aria-label="Nieuw hoofdstuk" placeholder="Eigen hoofdstuk toevoegen…" required><button type="submit" aria-label="Hoofdstuk toevoegen">+</button></form>'+
      '<section class="card wb-conversation"><label for="workbookDiscussion"><h2>Voor mijn volgende gesprek</h2></label><p class="card-sub">Vragen en punten die ik mee wil nemen naar de andere chat.</p><textarea id="workbookDiscussion" class="notes" data-workbook-field="nextDiscussion" placeholder="Hier wil ik verder over sparren…">'+esc(p.nextDiscussion)+'</textarea><button class="btn" type="button" data-action="copy-workbook">Kopieer voor mijn andere chat</button><p class="wb-copy-hint">Er wordt niets automatisch naar een andere chat verstuurd. Je kiest zelf wat je plakt.</p></section>'+
      '<section class="card"><label for="projectNotes"><h2>Vrije notities</h2></label><textarea id="projectNotes" class="notes" placeholder="Losse gedachten, links of ideeën…">'+esc(p.notes)+'</textarea><button class="btn" type="button" data-action="save-workbook">Nu opslaan</button><div id="saveState" class="save-state" role="status" aria-live="polite">Notities worden tijdens het typen bewaard</div></section>';
  }
  window.GamenfyMentalWorkbook=Object.freeze({template:template,render:render,exportText:exportText});
})();
