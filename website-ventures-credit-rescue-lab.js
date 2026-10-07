(function () {
  'use strict';
  if (new URLSearchParams(location.search).get('embed') === '1') document.body.classList.add('atelier-embedded');
  const $ = id => document.getElementById(id);
  const base = 'website-ventures-assets/credit-sprint-20261007/';
  const worldInfo = {
    agency: { label: '01 / Agency', brand: 'WEBSITE VENTURES', title: 'Goed in je vak.\nLaat het zien.', copy: 'Een sterke eerste indruk. Een heldere volgende stap. Ontdek welke website bij jouw bedrijf past.', hero: 1, mobile: 7, demo: 'website-ventures-agency-scroll-hero-lab.html', note: 'Product A · schoon glas, één steen en aparte mobiele compositie. Motion blijft optioneel.' },
    plumbing: { label: '02 / Vakbedrijf', brand: 'AUREL / DEMO', title: 'Eerst rust.\nDan een oplossing.', copy: 'Je diensten, regio en contactroute staan voorop. Beeld ondersteunt het verhaal; het vervangt geen echte bedrijfsfoto’s.', hero: 8, mobile: 14, demo: 'site-plumbing-flagship-v1.html', note: 'Dezelfde fictieve monteur in portret, werkbeeld en detail. Geen echte medewerker of klantcase.' },
    renovation: { label: '03 / Renovatie', brand: 'ARCHITECTURAL / DEMO', title: 'Ruimte voor\nvakmanschap.', copy: 'Een rustige presentatie waarin materiaal, licht en afwerking het verhaal vertellen.', hero: 4, mobile: 4, demo: 'site-klus-scroll-1-2.html', note: 'Architecturale hero + materiaal-detail. Een fictief interieur, geen opgeleverd project.' },
    performance: { label: '04 / Performance', brand: 'PERFORMANCE / DEMO', title: 'Jouw volgende\nsterke stap.', copy: 'Een menselijk, energiek verhaal. Van eerste indruk naar een laagdrempelige kennismaking.', hero: 5, mobile: 11, demo: 'site-pt.html', note: 'Eigen navy/lime beeldwereld. Fictieve trainer; geen resultaat-, diploma- of transformatieclaim.' },
    product: { label: '05 / Productfilm', brand: 'PRODUCT MOTION / CONCEPT', title: 'Eén product.\nAlle aandacht.', copy: 'Materiaal, licht en een heldere reveal. Een verticale launchfilm als aanvullende dienst voor je agency.', hero: 6, mobile: 6, demo: null, note: 'Een fictieve cream/sage fles. Geen echte merkcampagne of geclaimde advertentieresultaten.' },
    gamenfy: { label: '06 / Gamenfy', brand: 'GAMENFY / MOTION QA', title: '', copy: '', hero: 13, mobile: 13, demo: 'lab-3d-test-6.html', note: 'Articulatieproef, niet de live rigged 3D-route.' }
  };
  let manifest, activeWorld = 'agency', activeKind = 'all', walkVideo, moving = false, raf = 0;
  // Session-only review: no storage, auth, cloud writes or automatic acceptance.
  const reviews = new Map();
  const votes = { yes: 'Ja', maybe: 'Misschien', no: 'Nee' };
  const safePath = value => typeof value === 'string' && value.startsWith(base) && !value.includes('..') && /^[a-zA-Z0-9_./-]+$/.test(value);
  function element(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }
  function link(text, href, download) { const e = element('a', text); e.href = href; if (download) e.download = ''; else { e.target = '_blank'; e.rel = 'noopener'; } return e; }
  function updateReviewSummary() {
    const selected = manifest.assets.filter(a => { const r = reviews.get(a.index); return r && (r.vote || r.note.trim()); });
    const judged = selected.filter(a => reviews.get(a.index).vote).length;
    $('reviewCount').textContent = judged + ' / ' + manifest.assets.length + ' beoordeeld · ' + selected.length + ' assets in je feedbacklijst.';
    $('reviewExport').value = selected.length ? ['Credit Atelier · feedback van de gebruiker', 'Productieset: ' + manifest.id, 'Dit is feedback, geen automatische publicatie of productiegoedkeuring.', '', ...selected.map(a => {
      const r = reviews.get(a.index);
      return 'Asset ' + a.index + ' · ' + a.title + '\nOordeel: ' + (votes[r.vote] || 'Nog niet gekozen') + '\nToepassing: ' + a.purpose + '\nBestand: ' + a.webPath + (r.note.trim() ? '\nNotitie: ' + r.note.trim() : '');
    })].join('\n\n') : '';
    $('copyReview').disabled = !selected.length;
    $('copyStatus').textContent = '';
  }
  function reviewControls(a) {
    const box = element('fieldset', undefined, 'asset-review');
    box.append(element('legend', 'Jouw oordeel over asset ' + a.index));
    const row = element('div', undefined, 'review-votes');
    Object.entries(votes).forEach(([vote, title]) => {
      const b = element('button', title); b.type = 'button'; b.dataset.vote = vote;
      b.setAttribute('aria-pressed', String(reviews.get(a.index)?.vote === vote));
      b.addEventListener('click', () => {
        const previous = reviews.get(a.index) || { vote: null, note: '' };
        reviews.set(a.index, { ...previous, vote: previous.vote === vote ? null : vote });
        row.children && Array.from(row.children).forEach(x => x.setAttribute('aria-pressed', String(x.dataset.vote === reviews.get(a.index).vote)));
        updateReviewSummary();
      }); row.append(b);
    });
    const label = element('label', 'Korte notitie (optioneel)'); label.htmlFor = 'reviewNote' + a.index;
    const note = element('textarea'); note.id = 'reviewNote' + a.index; note.rows = 2; note.maxLength = 500;
    note.value = reviews.get(a.index)?.note || ''; note.placeholder = 'Bijvoorbeeld: rustiger beeld, betere voeten, geschikt voor hero…';
    note.addEventListener('input', () => {
      const previous = reviews.get(a.index) || { vote: null, note: '' };
      reviews.set(a.index, { ...previous, note: note.value.slice(0, 500) }); updateReviewSummary();
    });
    box.append(row, label, note); return box;
  }
  function chooseWorld(world) {
    if (!worldInfo[world]) return;
    activeWorld = world;
    document.querySelectorAll('[data-world]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.world === world)));
    const w = worldInfo[world], isGame = world === 'gamenfy';
    $('showroom').hidden = isGame; $('gamenfy').hidden = !isGame; $('showroom').dataset.world = world;
    $('stageImage').src = base + String(w.hero).padStart(2, '0') + '-1280.webp';
    $('stageImage').alt = manifest.assets.find(a => a.index === w.hero)?.title || 'Demo asset';
    $('stageMobile').srcset = base + String(w.mobile).padStart(2, '0') + '-1280.webp';
    $('stageBrand').textContent = w.brand; $('stageTitle').textContent = w.title; $('stageCopy').textContent = w.copy; $('stageNote').textContent = w.note;
    $('demoLink').hidden = !w.demo; if (w.demo) $('demoLink').href = w.demo;
    if (!isGame && walkVideo) stopWalk();
    renderAssets();
  }
  function renderAssets() {
    document.querySelectorAll('#assetGrid video').forEach(v => v.pause());
    const grid = $('assetGrid'); grid.replaceChildren();
    const assets = manifest.assets.filter(a => a.world === activeWorld && (activeKind === 'all' || a.type === activeKind));
    $('assetStatus').textContent = assets.length + ' assets in deze wereld · modeloutput is Lab-materiaal, niet automatisch goedgekeurd.';
    assets.forEach(a => {
      const card = element('article', undefined, 'asset'); card.dataset.asset = a.index;
      const frame = element('div', undefined, 'asset-media');
      if (a.type === 'video') {
        const v = element('video'); v.controls = true; v.playsInline = true; v.preload = 'none';
        if (safePath(a.poster)) v.poster = a.poster;
        if (safePath(a.webPath)) v.src = a.webPath;
        v.setAttribute('aria-label', a.title); v.addEventListener('play', () => document.querySelectorAll('#assetGrid video').forEach(other => { if (other !== v) other.pause(); })); frame.append(v);
      } else { const im = element('img'); im.loading = 'lazy'; im.alt = a.title; if (safePath(a.previewPath)) { im.src = base + String(a.index).padStart(2, '0') + '-480.webp'; im.srcset = im.src + ' 480w, ' + a.previewPath + ' 1280w'; im.sizes = '(max-width:600px) 100vw, (max-width:900px) 50vw, 33vw'; } frame.append(im); }
      const body = element('div', undefined, 'asset-body');
      body.append(element('small', 'ASSET ' + a.index + ' / ' + a.modelLabel + ' / ' + a.credits + ' CREDITS'));
      body.append(element('h3', a.title), element('p', a.purpose), element('p', a.qa));
      const links = element('div', undefined, 'links');
      if (safePath(a.webPath)) links.append(link('Webbestand ↓', a.webPath, true));
      if (safePath(a.originalPath)) links.append(link('Origineel ↓', a.originalPath, true));
      else if (a.resultUrl && /^https:\/\/d8j0ntlcm91z4\.cloudfront\.net\//.test(a.resultUrl)) links.append(link('Originele generatie ↗', a.resultUrl, false));
      body.append(links);
      const details = element('details'); details.append(element('summary', 'Prompt, bron & status'), element('p', 'Job: ' + a.jobId + '\nBron: ' + a.sourceDescription + '\nStatus: ' + a.status + '\n\n' + a.prompt)); body.append(details);
      body.append(reviewControls(a));
      card.append(frame, body); grid.append(card);
    });
  }
  function stopWalk() { if (walkVideo) walkVideo.pause(); cancelAnimationFrame(raf); $('walkPlay').textContent = 'Start loopproef'; }
  function drawWalk() {
    if (!walkVideo || walkVideo.paused || walkVideo.ended) return;
    const c = $('walkCanvas'), ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, c.width, c.height);
    const shift = moving ? Math.sin(walkVideo.currentTime * 1.1) * 34 : 0;
    ctx.drawImage(walkVideo, 35 + shift, 0, c.width - 70, c.height);
    try {
      const frame = ctx.getImageData(0, 0, c.width, c.height), d = frame.data;
      for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2]; if (g > 90 && g - r > 35 && g - b > 35) d[i + 3] = 0; }
      ctx.putImageData(frame, 0, 0);
    } catch (_) { $('walkStatus').textContent = 'Chroma-key niet beschikbaar; open de bronvideo hieronder.'; stopWalk(); return; }
    raf = requestAnimationFrame(drawWalk);
  }
  function prepareWalk() {
    const a = manifest.assets.find(a => a.index === 28);
    if (!a || !safePath(a.webPath)) { $('walkStatus').textContent = 'Loopproef nog niet beschikbaar; kijk bij de bronassets.'; $('walkPlay').disabled = true; return; }
    $('walkCanvas').width = 256; $('walkCanvas').height = 340;
    walkVideo = document.createElement('video'); walkVideo.src = a.webPath; walkVideo.preload = 'none'; walkVideo.muted = true; walkVideo.loop = true; walkVideo.playsInline = true;
    $('walkStatus').textContent = a.qa + ' · Start is altijd handmatig.';
    $('walkPlay').addEventListener('click', async () => {
      if (!walkVideo.paused) { stopWalk(); return; }
      try { await walkVideo.play(); $('walkPlay').textContent = 'Pauzeer loopproef'; cancelAnimationFrame(raf); drawWalk(); }
      catch (_) { $('walkStatus').textContent = 'Afspelen geblokkeerd. Gebruik de bronvideo met bediening hieronder.'; }
    });
    $('walkMove').addEventListener('click', () => { moving = !moving; $('walkMove').textContent = moving ? 'Blijf op één plek' : 'Beweeg door het vlak'; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopWalk(); });
  }
  document.querySelectorAll('[data-kind]').forEach(b => b.addEventListener('click', () => { activeKind = b.dataset.kind; document.querySelectorAll('[data-kind]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); if (manifest) renderAssets(); }));
  $('copyReview').addEventListener('click', async () => {
    if (!$('reviewExport').value) return;
    try { await navigator.clipboard.writeText($('reviewExport').value); $('copyStatus').textContent = 'Gekopieerd. Plak dit in je chat of eigen notities om het te bewaren.'; }
    catch (_) { $('reviewExport').focus(); $('reviewExport').select(); $('copyStatus').textContent = 'Automatisch kopiëren niet beschikbaar. De feedback is geselecteerd; kopieer handmatig.'; }
  });
  fetch('WEBSITE-VENTURES-CREDIT-RESCUE-2026-10-07.json', { cache: 'no-store' }).then(r => { if (!r.ok) throw Error('manifest'); return r.json(); }).then(data => {
    if (!Array.isArray(data.assets)) throw Error('assets'); manifest = data;
    $('spent').textContent = data.creditsSpent; $('remaining').textContent = data.endingBalance; $('counts').textContent = data.assets.filter(a => a.type === 'image').length + ' + ' + data.assets.filter(a => a.type === 'video').length;
    $('qaSummary').textContent = data.qaSummary;
    Object.entries(worldInfo).forEach(([key, w]) => { const b = element('button', w.label); b.dataset.world = key; b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', () => chooseWorld(key)); $('worlds').append(b); });
    const asked = new URLSearchParams(location.search).get('world'); chooseWorld(worldInfo[asked] ? asked : 'agency'); prepareWalk(); updateReviewSummary();
  }).catch(() => { $('assetStatus').textContent = 'De productiekaart kon niet laden. Herlaad of open de JSON-link onderaan.'; });
}());
