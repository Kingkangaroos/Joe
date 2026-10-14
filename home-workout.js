/* Home training plan · ChatGPT (OpenAI) · 2026-10-14.
   Presentation only. The existing mission button owns completion, XP and history.
   Training week is chosen explicitly; habit score never prescribes exercise load. */
(function () {
  'use strict';
  function dayType(date) {
    var parts = String(date || '').split('-').map(Number);
    var d = parts.length === 3 && parts.every(Number.isFinite)
      ? new Date(parts[0], parts[1] - 1, parts[2], 12) : new Date();
    return [1, 3, 5].includes(d.getDay()) ? 'strength' : 'mobility';
  }
  function plan(config) {
    config = config || {};
    var week = Math.max(1, Math.min(4, Number(config.week) || 1));
    var extended = config.mode === 'extended';
    var second = extended && week >= 2;
    var fullSecond = extended && week >= 4;
    var gear = config.gear === 'dumbbell';
    var exercises = [
      ['Push-up', '6–12 herhalingen', 'Houd je lichaam als één lijn. Begin op je knieën als nodig; laat je rustig zakken.', 'Knieën → gewone push-up → moeilijkere variant', second ? 2 : 1],
      ['Split squat', '6–10 per been', 'Voeten in een spreidstand op de vloer. Zak recht naar beneden, alleen zo diep als comfortabel.', 'Meer nette herhalingen → grotere comfortabele diepte', fullSecond ? 2 : 1],
      ['Glute bridge', '10–15 herhalingen', 'Lig met gebogen knieën en voeten op de vloer. Til je heupen op zonder je onderrug hol te trekken.', 'Twee benen → één been als dat beheerst lukt', fullSecond ? 2 : 1],
      ['Reverse crunch', '8–12 herhalingen', 'Knieën gebogen. Rol je bekken een klein stukje van het matje; zwaai niet met je benen.', 'Meer gecontroleerde herhalingen → langzamer terug', second ? 2 : 1],
      gear
        ? ['Dumbbell row', '8–12 per arm', 'Buig vanuit je heupen, steun je vrije hand op je bovenbeen. Trek naar je heup, houd je rug stabiel. Begin licht.', 'Meer herhalingen → klein beetje meer gewicht', extended && week >= 3 ? 2 : 1]
        : ['W-raise op je buik', '8–12 rustige herhalingen', 'Armen in een W. Til handen en ellebogen licht op; houd je nek ontspannen. Dit traint vooral controle.', 'Rustig bewegen; vervangt roeien of optrekken niet', 1]
    ];
    return { week: week, extended: extended, gear: gear, exercises: exercises };
  }
  var stretches = [
    ['Hamstrings', '30 sec per been', 'Op je rug: houd achter je bovenbeen vast en strek je knie rustig zover als comfortabel. Nek blijft ontspannen.'],
    ['Heupbuigers', '30 sec per kant', 'Eén knie op het matje, andere voet voor. Span de achterste bil aan en schuif voorzichtig vooruit.'],
    ['Butterfly', '30 sec', 'Zit met voetzolen tegen elkaar. Laat je knieën ontspannen zakken; duw ze niet omlaag.'],
    ['Open book', '30 sec per kant', 'Op je zij, knieën gebogen op elkaar. Open je bovenste arm en draai je borst rustig mee.']
  ];
  var weeks = [
    'Week 1 · Eén set per oefening. Vind een variant waarbij je nog ongeveer drie nette herhalingen over hebt.',
    'Week 2 · Voeg waar het makkelijk wordt één herhaling toe. In de langere variant krijgen push-ups en reverse crunches een tweede set.',
    'Week 3 · Herhaal week 2. Met dumbbell mag roeien in de langere variant een tweede set krijgen, als tijd en herstel dat toelaten.',
    'Week 4 · De langere variant mag twee sets per krachtoefening krijgen. De W-raise blijft één lichte set. De korte variant blijft één set.'
  ];
  function exerciseHTML(e, i) {
    return '<li class="hw-step"><span class="hw-number" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span><div>' +
      '<div class="hw-step-head"><strong>' + e[0] + '</strong><span>' + e[4] + ' set' + (e[4] === 1 ? '' : 's') + ' · ' + e[1] + '</span></div>' +
      '<p>' + e[2] + '</p><small>Opbouw: ' + e[3] + '</small></div></li>';
  }
  function content(config) {
    var p = plan(config), mobility = config.kind === 'mobility';
    var duration = mobility ? '8–12 min' : p.extended ? 'max. 20 min' : p.gear ? '12–15 min' : '10–12 min';
    return '<div class="hw-banner"><small>JOUW HOME ROUTINE</small><h3>' + (mobility ? 'Soepeler bewegen.' : 'Sterker worden.') + '</h3>' +
      '<p>' + duration + ' · ' + (mobility ? 'rustig rekken en bewegen' : p.gear ? 'calisthenics + één dumbbell' : 'alleen je matje') + '</p></div>' +
      '<p class="hw-rhythm">Ma / wo / vr: kracht + korte mobility. Andere dagen: rustige mobility. Verschuif kracht rond zware tennisdagen.</p>' +
      (mobility ? '' : '<div class="hw-block"><strong>01 · Warm worden</strong><span>2 min</span></div><p class="hw-copy">Rustig lopen op de plaats, armcirkels, enkele makkelijke squats en heupbuigingen. De eerste set begint rustig.</p>' +
        '<div class="hw-block"><strong>02 · Kracht</strong><span>' + (p.extended ? 'tot 15 min' : p.gear ? 'tot 10 min' : 'tot 7 min') + '</span></div>' +
        '<p class="hw-copy">Doe één set van iedere oefening in volgorde; daarna eventuele tweede sets. Rust 45–60 sec, langer als nodig. Houd 2–3 nette herhalingen over en blijf ademen.</p>' +
        '<ol class="hw-exercises">' + p.exercises.map(exerciseHTML).join('') + '</ol>' +
        '<p class="hw-note">' + (p.gear ? 'Eén dumbbell is genoeg: train links en rechts. Controleer de sluitingen en kies gewicht op techniek, niet op ambitie.' : 'Matje-only heeft een beperking: W-raises belasten rug en biceps niet zoals roeien of optrekken. Een verstelbare dumbbell maakt deze routine completer.') + '</p>') +
      '<div class="hw-block"><strong>' + (mobility ? 'Mobility' : '03 · Mobility') + '</strong><span>' + (mobility ? '8–12 min totaal' : '3 min') + '</span></div>' +
      '<p class="hw-copy">' + (mobility ? 'Beweeg eerst een paar minuten rustig. Doe daarna alle vier de oefeningen één of twee keer, binnen je tijd.' : 'Na kracht: doe de eerste drie stretches één keer. Wisselen tussen houdingen is inbegrepen.') + ' Lichte rek is genoeg; geen pijn, veren of geforceerde nekbuiging.</p>' +
      '<ol class="hw-stretches">' + stretches.slice(0, mobility ? 4 : 3).map(function (s) {
        return '<li><div><strong>' + s[0] + '</strong><span>' + s[1] + '</span></div><p>' + s[2] + '</p></li>';
      }).join('') + '</ol>' +
      '<details class="hw-details"><summary>Je opbouw · week ' + p.week + '</summary><p>' + weeks[p.week - 1] + '</p>' +
      '<p>Een week herhalen mag. Haal je tweemaal de hoogste herhalingen met goede techniek en kracht over? Maak één onderdeel iets moeilijker. Voeg bij mobility eerst een ronde toe; forceer geen extra diepte.</p>' +
      '<p>Je habit-level meet regelmaat, niet spiermassa of trainingszwaarte. Kies je trainingsweek zelf.</p></details>' +
      '<details class="hw-details"><summary>Energie & herstel</summary><p>Lang niets gegeten? Neem eerst iets kleins, bijvoorbeeld een banaan of boterham, en drink wat. Train pas als je je goed voelt. Eet daarna je normale maaltijd met eiwit en koolhydraten.</p>' +
      '<p>Duizelig, slap of pijn? Stop. Herhaald bijna flauwvallen: bespreek het met je huisarts. Flauwvallen tijdens inspanning vraagt directe medische beoordeling.</p></details>' +
      '<p class="hw-note">Een uitgevoerde workout of mobility-sessie telt voor deze ene habit. Vink pas af na je sessie. Geen extra XP per oefening. Twintig minuten is de bovengrens; sla zo nodig een extra set over om rustig af te sluiten.</p>';
  }
  function shell(date) {
    return '<section class="hw-plan" aria-label="Workout en mobility routine"><div class="hw-controls">' +
      '<label>Sessie<select data-hw="kind"><option value="strength"' + (dayType(date) === 'strength' ? ' selected' : '') + '>Kracht + mobility</option><option value="mobility"' + (dayType(date) === 'mobility' ? ' selected' : '') + '>Alleen mobility</option></select></label>' +
      '<label>Tijd<select data-hw="mode"><option value="short">Kort · één set</option><option value="extended">Meer · max. 20 min</option></select></label>' +
      '<label>Materiaal<select data-hw="gear"><option value="mat">Alleen matje</option><option value="dumbbell">Matje + dumbbell</option></select></label>' +
      '<label>Trainingsweek<select data-hw="week"><option value="1">Week 1</option><option value="2">Week 2</option><option value="3">Week 3</option><option value="4">Week 4+</option></select></label></div>' +
      '<div class="hw-content" aria-live="polite">' + content({ kind: dayType(date) }) + '</div></section>';
  }
  function refresh(root) {
    var config = {};
    root.querySelectorAll('[data-hw]').forEach(function (select) { config[select.dataset.hw] = select.value; });
    root.querySelector('.hw-content').innerHTML = content(config);
    root.querySelector('[data-hw="mode"]').disabled = config.kind === 'mobility';
    root.querySelector('[data-hw="gear"]').disabled = config.kind === 'mobility';
  }
  function bind(host) {
    var root = host.querySelector('.hw-plan');
    if (!root || root.dataset.bound) return;
    root.dataset.bound = 'true';
    root.addEventListener('change', function (e) { if (e.target.matches('[data-hw]')) refresh(root); });
    refresh(root);
  }
  window.GamenfyHomeWorkout = Object.freeze({ shell: shell, bind: bind, plan: plan, dayType: dayType });
})();
