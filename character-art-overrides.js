/* Gamenfy native character-art bridge
   ChatGPT (OpenAI) · 2026-09-07

   Purpose:
   - preserve Park 3.1's existing mission-level engine as the ONLY level source;
   - prefer Joey's approved transparent 10-level character sets when present;
   - Budgeting = owl, Meditation = panda;
   - never show a broken image while the exact approved assets are still outside the repo.

   Expected native files:
     img/lab/park31/budgeting/l01.webp ... l10.webp
     img/lab/park31/meditation/l01.webp ... l10.webp
   PNG is also accepted at the same basename.
*/
(function () {
  'use strict';
  if (window.__gamenfyCharacterArtOverridesInstalled) return;
  window.__gamenfyCharacterArtOverridesInstalled = true;

  var MAP = {
    budgeting: { label: 'Budgeting', character: 'owl', dir: 'img/lab/park31/budgeting/' },
    meditation: { label: 'Meditation', character: 'panda', dir: 'img/lab/park31/meditation/' }
  };
  var availability = Object.create(null);
  var pending = Object.create(null);
  var observer = null;
  var applyQueued = false;

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function levelFromText(value) {
    var m = String(value || '').match(/(?:level|l)\s*(\d{1,2})/i);
    return clamp(m ? Number(m[1]) : 1, 1, 10);
  }
  function baseName(level) { return 'l' + String(clamp(level, 1, 10)).padStart(2, '0'); }
  function candidates(key, level) {
    var def = MAP[key];
    if (!def) return [];
    var base = def.dir + baseName(level);
    return [base + '.webp?v=1', base + '.png?v=1'];
  }
  function cacheKey(key, level) { return key + ':' + clamp(level, 1, 10); }

  function probe(key, level, callback) {
    var ck = cacheKey(key, level);
    if (availability[ck] !== undefined) { callback(availability[ck]); return; }
    if (pending[ck]) { pending[ck].push(callback); return; }
    pending[ck] = [callback];
    var urls = candidates(key, level), index = 0;

    function finish(url) {
      availability[ck] = url || null;
      var list = pending[ck] || [];
      delete pending[ck];
      list.forEach(function (fn) { try { fn(availability[ck]); } catch (e) {} });
    }
    function next() {
      if (index >= urls.length) { finish(null); return; }
      var url = urls[index++], image = new Image();
      image.onload = function () { finish(url); };
      image.onerror = next;
      image.src = url;
    }
    next();
  }

  function markNative(slot, image, key, level, url) {
    if (!slot || !image || !url) return;
    if (image.getAttribute('src') !== url) image.setAttribute('src', url);
    image.dataset.gamenfyNativeCharacter = key;
    image.dataset.gamenfyNativeLevel = String(level);
    image.alt = MAP[key].label + ' ' + MAP[key].character + ' at level ' + level;
    slot.classList.remove('is-fallback');
    slot.classList.add('is-native-character');
    slot.dataset.character = MAP[key].character;
    var copy = slot.querySelector('.p31-slot-copy small');
    if (copy) copy.title = 'Approved transparent ' + MAP[key].character + ' evolution · level ' + level + '/10';
  }

  function applyRosterCard(slot, key) {
    var levelEl = slot.querySelector('.p31-slot-level');
    var image = slot.querySelector('.p31-slot-art img');
    if (!image) return;
    var level = levelFromText(levelEl && levelEl.textContent);
    var ck = cacheKey(key, level);
    if (availability[ck]) { markNative(slot, image, key, level, availability[ck]); return; }
    if (availability[ck] === null) return;
    probe(key, level, function (url) {
      if (!url || !slot.isConnected) return;
      var liveLevel = levelFromText((slot.querySelector('.p31-slot-level') || {}).textContent);
      if (liveLevel !== level) return;
      markNative(slot, slot.querySelector('.p31-slot-art img'), key, level, url);
    });
  }

  function selectedModalKey() {
    var title = document.getElementById('p31ModalTitle');
    var text = String(title && title.textContent || '').trim().toLowerCase();
    if (text === 'budgeting') return 'budgeting';
    if (text === 'meditation') return 'meditation';
    return null;
  }
  function applyModal() {
    var key = selectedModalKey();
    if (!key) return;
    var modal = document.getElementById('p31Modal');
    if (!modal || modal.hidden) return;
    var image = document.getElementById('p31ModalArt');
    var levelEl = document.getElementById('p31ModalLevel');
    if (!image || !levelEl) return;
    var level = levelFromText(levelEl.textContent), ck = cacheKey(key, level);
    function use(url) {
      if (!url || selectedModalKey() !== key) return;
      var liveLevel = levelFromText((document.getElementById('p31ModalLevel') || {}).textContent);
      if (liveLevel !== level) return;
      if (image.getAttribute('src') !== url) image.setAttribute('src', url);
      image.dataset.gamenfyNativeCharacter = key;
      image.dataset.gamenfyNativeLevel = String(level);
      image.alt = MAP[key].label + ' ' + MAP[key].character + ' at level ' + level;
      var status = document.getElementById('p31ModalStatus');
      if (status && /Park 3\.1 native artwork|Park 2 fallback/i.test(status.textContent || '')) {
        status.textContent = (status.textContent || '').replace(/\s*Park 3\.1 native artwork[^.]*\.?(?:\s*dit is de bestaande Park 2 fallback\.)?/ig, '').replace(/\s*Dit is de bestaande Park 2 fallback\.?/ig, '').trim();
      }
    }
    if (availability[ck]) use(availability[ck]);
    else if (availability[ck] !== null) probe(key, level, use);
  }

  function applyAll() {
    applyQueued = false;
    Object.keys(MAP).forEach(function (key) {
      document.querySelectorAll('[data-mission="' + key + '"]').forEach(function (slot) { applyRosterCard(slot, key); });
    });
    applyModal();
  }
  function queueApply() {
    if (applyQueued) return;
    applyQueued = true;
    (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : setTimeout)(applyAll);
  }

  function preloadLikelyLevels() {
    Object.keys(MAP).forEach(function (key) {
      for (var level = 1; level <= 10; level++) probe(key, level, function () {});
    });
  }

  function init() {
    queueApply();
    preloadLikelyLevels();
    if (typeof MutationObserver === 'function') {
      observer = new MutationObserver(queueApply);
      observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'class'] });
    }
    window.addEventListener('gamenfy:daily-mission-change', queueApply);
    window.addEventListener('gamenfy:auto-habits-changed', queueApply);
    window.addEventListener('gamenfy:remote-state-applied', queueApply);
    window.addEventListener('focus', queueApply);
  }

  window.GamenfyCharacterArtOverrides = {
    map: MAP,
    candidates: candidates,
    levelFromText: levelFromText,
    refresh: queueApply
  };
  window.addEventListener('beforeunload', function () { if (observer) observer.disconnect(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
