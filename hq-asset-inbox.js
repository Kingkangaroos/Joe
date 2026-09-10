(function () {
  'use strict';
  const folder = 'website-ventures-assets/hq-inbox';
  const repo = 'https://github.com/Kingkangaroos/Joe';
  const panel = document.getElementById('hqAssetInbox');
  if (!panel) return;
  panel.innerHTML = '<div class="label">Shared image inbox</div><h2>Beelden toevoegen</h2><p>Bewaar je websitebeelden en badges op één plek. Uploaden opent GitHub in een nieuw tabblad.</p><a class="asset-upload" target="_blank" rel="noopener noreferrer">＋ Open uploadvak in GitHub</a><ol><li>Kies of sleep je bestanden in het GitHub-uploadvak.</li><li>Klik daar op <strong>Commit changes</strong> om ze op te slaan op main. Een voorstel op een andere branch moet eerst worden samengevoegd.</li><li>Kom terug naar HQ en controleer je beelden hieronder.</li></ol><p class="foot">Gebruik unieke bestandsnamen. Deze map volgt de zichtbaarheid van de repository en kan op de website bereikbaar zijn. Uploaden keurt een beeld nog niet goed voor plaatsing.</p><div class="asset-actions"><button type="button" class="tab" id="assetRefresh">Controleer repository</button><a target="_blank" rel="noopener noreferrer" id="assetFolder">Open map op GitHub ↗</a></div><p id="assetInboxStatus" role="status" aria-live="polite"></p><div id="assetInboxGallery" class="asset-gallery"></div>';
  panel.querySelector('.asset-upload').href = repo + '/upload/main/' + folder;
  document.getElementById('assetFolder').href = repo + '/tree/main/' + folder;
  const status = document.getElementById('assetInboxStatus');
  const gallery = document.getElementById('assetInboxGallery');
  const refresh = document.getElementById('assetRefresh');
  let running = false;
  async function check() {
    if (running) return;
    running = true;
    refresh.disabled = true;
    gallery.replaceChildren();
    status.textContent = 'Repository controleren…';
    try {
      const response = await fetch('https://api.github.com/repos/Kingkangaroos/Joe/contents/' + folder + '?ref=main', {
        cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(15000),
        headers: { Accept: 'application/vnd.github+json' }
      });
      if (!response.ok) throw new Error('unavailable');
      const entries = await response.json();
      if (!Array.isArray(entries)) throw new Error('invalid');
      const files = entries.filter(f => f.type === 'file' && f.path === folder + '/' + f.name && /^[a-f0-9]{40}$/.test(f.sha) && /\.(png|jpe?g|webp|avif|gif)$/i.test(f.name));
      status.textContent = files.length
        ? files.length + ' beeld(en) bevestigd op main · gecontroleerd om ' + new Date().toLocaleTimeString('nl-NL') + '. Nog niet automatisch geplaatst op een pagina.'
        : 'Map gecontroleerd: nog geen beelden op main. Sla je upload eerst op met Commit changes.';
      for (const file of files) {
        const card = document.createElement('article');
        const link = document.createElement('a');
        const img = document.createElement('img');
        const name = document.createElement('strong');
        const note = document.createElement('small');
        const encoded = file.path.split('/').map(encodeURIComponent).join('/');
        link.href = repo + '/blob/main/' + encoded;
        link.target = '_blank'; link.rel = 'noopener noreferrer';
        img.src = 'https://raw.githubusercontent.com/Kingkangaroos/Joe/main/' + encoded;
        img.alt = file.name; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
        img.addEventListener('error', () => { img.hidden = true; note.textContent = 'In repository · open bestand om te bekijken'; });
        name.textContent = file.name;
        note.textContent = 'In repository · ' + (file.size / 1048576).toFixed(1) + ' MB';
        link.append(img, name); card.append(link, note); gallery.append(card);
      }
    } catch (_) {
      status.textContent = 'Niet bevestigd: GitHub is niet bereikbaar, de map staat nog niet online of de repository is privé. Open de map op GitHub om de opslag te controleren. Dit betekent niet dat je bestanden weg zijn.';
    } finally { running = false; refresh.disabled = false; }
  }
  refresh.addEventListener('click', check);
  // Check only on request; opening HQ should not repeatedly consume API quota.
  status.textContent = 'Klik op Controleer repository om te zien wat er echt is opgeslagen.';
})();
