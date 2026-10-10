(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const base = 'website-ventures-assets/credit-sprint-20261007/';
  const projects = [
    { title: 'Website Ventures', short: 'A stronger\nfirst impression.', world: 'agency', image: '01', demo: 'website-ventures-agency-scroll-hero-lab.html?from=ventures', description: 'Product A als eigen agency-beeldwereld. Een zwart-glazen tablet op één ruwe steen, met ruimte voor echte website-inhoud.', points: ['Hero die de agency introduceert.', 'Materiaal-detail en een aparte mobiele compositie.', 'De coded agency-proef blijft de huidige referentie.'] },
    { title: 'Aurel / vakbedrijf', short: 'Good work.\nNo guesswork.', world: 'plumbing', image: '08', demo: 'site-plumbing-flagship-v1.html?from=ventures', description: 'Een fictief vakbedrijf, met een rustige contactroute en een samenhangende beeldidentiteit. Niet de indruk wekken dat dit echte medewerkers of klanten zijn.', points: ['Diensten en regio komen vóór het visuele effect.', 'Eén terugkerende fictieve monteur.', 'Echt klantwerk vraagt echte bedrijfsfoto’s en juiste gegevens.'] },
    { title: 'Architectural Luxury', short: 'Room for\nsomething better.', world: 'renovation', image: '04', demo: 'site-klus-scroll-1-2.html?from=ventures', description: 'Een architecturale ontwerpstudie waarin materiaal, ruimte en licht het verhaal vertellen. Het interieur is niet als opgeleverd project gepresenteerd.', points: ['Een helder materiaalverhaal.', 'Rust als contrast met de performance-wereld.', 'De bestaande scroll-proef blijft apart te openen.'] },
    { title: 'Performance', short: 'Your next\nstrong move.', world: 'performance', image: '05', demo: 'site-pt.html?from=ventures', description: 'Een donkerder, energiek personal-trainingconcept. Een menselijk eerste beeld, zonder verzonnen transformaties, diploma’s of resultaatclaims.', points: ['Eigen navy/lime identiteit.', 'Een laagdrempelige kennismaking als volgende stap.', 'Geen trainingsadvies of gegarandeerd lichamelijk resultaat.'] },
    { title: 'Product Motion', short: 'One product.\nAll the attention.', world: 'product', image: '06', demo: 'website-ventures-credit-rescue-lab.html?world=product', description: 'Een fictieve cream/sage fles als product-filmconcept. Bekijk de eerder gemaakte verticale film in het Credit Atelier.', points: ['Materiaal, belichting en een gecontroleerde reveal.', 'Een mogelijke aanvullende agency-dienst.', 'Geen echt merk of bewijs van advertentieprestaties.'] }
  ];
  const book = $('book'), sheets = [], faces = [];
  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  let index = 0, reading = false, busy = false, gesture = null, timer = 0, previousFocus = null;
  const count = projects.length + 1;
  if (new URLSearchParams(location.search).get('embed') === '1') document.body.classList.add('folio-embedded');
  function el(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }
  function button(text, action, cls) { const b = el('button', text, cls); b.type = 'button'; b.addEventListener('click', action); return b; }
  function image(p) { const im = el('img'); im.src = base + p.image + '-480.webp'; im.srcset = im.src + ' 480w, ' + base + p.image + '-1280.webp 1280w'; im.sizes = '(max-width:600px) 48vw, 430px'; im.alt = p.title + ' · fictieve ontwerpstudie'; im.draggable = false; return im; }
  function detail(p, n) {
    previousFocus = document.activeElement;
    $('caseTitle').textContent = p.title; $('caseNumber').textContent = 'CASE ' + String(n).padStart(2, '0') + ' / WEBSITE VENTURES';
    $('caseDescription').textContent = p.description; $('caseImage').src = base + p.image + '-1280.webp'; $('caseImage').alt = p.title + ' · conceptbeeld';
    $('casePoints').replaceChildren(...p.points.map(t => el('li', t)));
    $('caseDemo').href = p.demo; $('caseAssets').href = 'website-ventures-credit-rescue-lab.html?world=' + p.world;
    if ($('caseDialog').showModal) $('caseDialog').showModal(); else $('caseDialog').setAttribute('open', '');
  }
  function accessible(face, visible) {
    face.inert = !visible; face.setAttribute('aria-hidden', String(!visible));
    face.querySelectorAll('button,a').forEach(control => control.tabIndex = visible ? 0 : -1);
  }
  function sync() {
    book.classList.toggle('is-closed', index === 0);
    sheets.forEach((s, n) => { s.classList.toggle('turned', n < index); s.style.zIndex = n < index ? n + 1 : count - n; accessible(faces[n].front, n === index); accessible(faces[n].back, n === index - 1); });
    accessible($('finalPage'), index === count);
    $('openBook').hidden = index !== 0 || reading;
    $('previousPage').disabled = index === 0 || busy; $('nextPage').disabled = index === count || busy;
    $('chapterJump').value = String(index);
    $('pageCounter').textContent = String(index).padStart(2, '0') + ' / ' + String(count).padStart(2, '0');
    const title = index === 0 ? 'De cover · het boek is nog dicht.' : index === count ? 'Het volgende hoofdstuk · einde van het portfolio.' : 'Hoofdstuk ' + index + ' · ' + projects[index - 1].title;
    $('bookStatus').textContent = title; book.setAttribute('aria-label', title + ' Gebruik de linker- en rechterpijl om te bladeren.');
  }
  function go(value) {
    const target = Math.max(0, Math.min(count, Number(value)));
    if (!Number.isInteger(target) || target === index) return;
    clearTimeout(timer); busy = false;
    sheets.forEach(s => s.classList.remove('flipping', 'dragging'));
    if (!reduced && Math.abs(target - index) === 1 && !reading) {
      const leaf = sheets[target > index ? index : index - 1];
      leaf.classList.add('flipping'); busy = true;
      timer = setTimeout(() => { leaf.classList.remove('flipping'); busy = false; sync(); }, 870);
    }
    index = target; sync();
  }
  function setReading(value) {
    reading = value; $('deskStage').hidden = value; $('readingView').hidden = !value;
    $('readingToggle').setAttribute('aria-pressed', String(value)); $('readingToggle').textContent = value ? 'Terug naar het boek' : 'Leesmodus';
    $('viewToggle').disabled = value; sync();
  }
  for (let n = 0; n < count; n++) {
    const sheet = el('div', undefined, 'leaf'); sheet.dataset.leaf = n;
    const front = el('section', undefined, 'page-face page-front'), back = el('section', undefined, 'page-face page-back page-copy');
    if (n === 0) {
      front.classList.add('page-cover');
      front.append(el('span', 'WEBSITE VENTURES', 'cover-brand'), el('span', '', 'cover-mark'), el('div', 'Selected\nWork.', 'cover-title'), button('Begin het verhaal ↗', () => go(1), 'cover-open'));
      const bottom = el('div', undefined, 'cover-bottom'); bottom.append(el('span', 'DESIGN STUDIES'), el('span', 'VOL. 01')); front.append(bottom);
      back.append(el('small', 'THE STUDIO / 01', 'page-kicker'), el('h2', 'Goed werk\nverdient aandacht.'), el('p', 'Vijf verschillende beeldwerelden. Duidelijke diensten, een herkenbaar verhaal en een logische volgende stap.'), el('span', 'Een portfolio-proef. Geen echte klantcases.', 'page-number'));
    } else {
      const p = projects[n - 1]; front.classList.add('page-project'); if (p.world === 'product') front.classList.add('product');
      front.append(image(p)); const caption = el('div', undefined, 'image-caption'); caption.append(el('small', 'CASE ' + String(n).padStart(2, '0')), el('h2', p.short), button('Bekijk de case ↗', () => detail(p, n))); front.append(caption);
      back.append(el('small', p.title + ' / CONCEPT', 'page-kicker'), el('h2', p.short), el('p', p.points[0]), button('Inhoud & coded demo ↗', () => detail(p, n)), el('span', String(n).padStart(2, '0') + ' / SELECTED WORK', 'page-number'));
    }
    sheet.append(front, back); book.append(sheet); sheets.push(sheet); faces.push({ front, back });
  }
  projects.forEach((p, n) => {
    const card = el('article', undefined, 'reading-card'), body = el('div');
    body.append(el('small', 'CASE ' + String(n + 1).padStart(2, '0')), el('h3', p.title), el('p', p.description), button('Bekijk de case ↗', () => detail(p, n + 1)));
    card.append(image(p), body); $('readingProjects').append(card);
  });
  $('nextPage').addEventListener('click', () => { if (!busy) go(index + 1); });
  $('previousPage').addEventListener('click', () => { if (!busy) go(index - 1); });
  $('openBook').addEventListener('click', () => go(1)); $('restartBook').addEventListener('click', () => go(0));
  $('chapterJump').addEventListener('change', e => go(e.target.value));
  $('readingToggle').addEventListener('click', () => setReading(!reading));
  $('viewToggle').addEventListener('click', () => { const flat = book.classList.toggle('is-top'); $('viewToggle').setAttribute('aria-pressed', String(flat)); $('viewToggle').textContent = flat ? 'Perspectief' : 'Bovenaanzicht'; });
  book.addEventListener('keydown', e => {
    if (e.target !== book || $('caseDialog').open || busy) return;
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault(); go(e.key === 'Home' ? 0 : e.key === 'End' ? count : index + (e.key === 'ArrowRight' ? 1 : -1));
  });
  book.addEventListener('pointerdown', e => {
    if (busy || reading || (e.button !== undefined && e.button !== 0) || e.target.closest('button,a,input,select,textarea')) return;
    gesture = { x: e.clientX, y: e.clientY, id: e.pointerId, progress: 0, leaf: null, direction: 0 };
  });
  book.addEventListener('pointermove', e => {
    if (!gesture || gesture.id !== e.pointerId) return;
    const dx = e.clientX - gesture.x, dy = e.clientY - gesture.y;
    if (!gesture.leaf) {
      if (Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) { gesture = null; return; }
      if (Math.abs(dx) < 16 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      gesture.direction = dx < 0 ? 1 : -1;
      const n = gesture.direction === 1 ? index : index - 1;
      if (!sheets[n]) { gesture = null; return; }
      gesture.leaf = sheets[n]; gesture.leaf.classList.add('dragging');
      if (book.setPointerCapture) book.setPointerCapture(e.pointerId);
    }
    e.preventDefault();
    const travel = gesture.direction === 1 ? -dx : dx;
    gesture.progress = Math.min(1, Math.max(0, travel / (book.getBoundingClientRect().width * .5)));
    gesture.leaf.style.transform = 'rotateY(' + (gesture.direction === 1 ? -180 * gesture.progress : -180 + 180 * gesture.progress) + 'deg)';
    gesture.leaf.style.zIndex = count + 2;
  }, { passive: false });
  function finishGesture(e, cancelled) {
    if (!gesture || (e.pointerId !== undefined && gesture.id !== e.pointerId)) return;
    const g = gesture; gesture = null;
    if (g.leaf) { g.leaf.classList.remove('dragging'); g.leaf.style.removeProperty('transform'); if (!cancelled && g.progress > .24) go(index + g.direction); else sync(); }
    if (book.hasPointerCapture && book.hasPointerCapture(g.id)) book.releasePointerCapture(g.id);
  }
  book.addEventListener('pointerup', e => finishGesture(e, false)); book.addEventListener('pointercancel', e => finishGesture(e, true));
  $('closeCase').addEventListener('click', () => { if ($('caseDialog').close) $('caseDialog').close(); else $('caseDialog').removeAttribute('open'); });
  $('caseDialog').addEventListener('close', () => { if (previousFocus && previousFocus.focus) previousFocus.focus(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && gesture) finishGesture({}, true); });
  sync();
  if (typeof CSS !== 'undefined' && CSS.supports && !CSS.supports('transform-style', 'preserve-3d')) setReading(true);
}());
