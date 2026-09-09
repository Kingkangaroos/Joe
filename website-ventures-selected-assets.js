// Website Ventures selected-asset loader
// Managed by ChatGPT (OpenAI). Pages keep their coded placeholders unless a
// registry slot is explicitly status="selected" AND its committed file loads.
(function () {
  'use strict';

  const REGISTRY_URL = 'WEBSITE-VENTURES-SELECTED-ASSETS.json';
  const selectedMediaClass = 'wv-selected-media';
  let registry = null;

  function getSlot (key) {
    return registry && registry.slots ? registry.slots[key] || null : null;
  }

  function isSelected (slot) {
    return !!(slot && slot.status === 'selected' && slot.selectedPath);
  }

  function mark (el, state, key) {
    if (!el) return;
    el.dataset.wvAssetState = state;
    if (key) el.dataset.wvResolvedAsset = key;
    el.classList.toggle('wv-has-selected', state === 'selected');
  }

  function makeImage (slot, key, extraClass) {
    const img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'eager';
    img.className = selectedMediaClass + (extraClass ? ' ' + extraClass : '');
    img.dataset.wvSlot = key;
    img.style.objectFit = slot.fit || 'cover';
    img.style.objectPosition = slot.position || 'center';
    return img;
  }

  function loadIntoContainer (el, key, extraClass) {
    const slot = getSlot(key);
    if (!isSelected(slot)) {
      mark(el, 'pending', key);
      return Promise.resolve(false);
    }

    return new Promise(resolve => {
      const img = makeImage(slot, key, extraClass);
      img.onload = function () {
        const previous = el.querySelector(':scope > .' + selectedMediaClass + '[data-wv-slot]');
        if (previous) previous.remove();
        el.prepend(img);
        requestAnimationFrame(() => img.classList.add('is-ready'));
        mark(el, 'selected', key);
        resolve(true);
      };
      img.onerror = function () {
        mark(el, 'load-error', key);
        resolve(false);
      };
      img.src = slot.selectedPath;
    });
  }

  function loadSourceImage (img, key) {
    const slot = getSlot(key);
    if (!isSelected(slot)) {
      img.dataset.wvAssetState = 'pending';
      return Promise.resolve(false);
    }
    return new Promise(resolve => {
      const probe = new Image();
      probe.onload = function () {
        img.src = slot.selectedPath;
        img.style.objectFit = slot.fit || 'cover';
        img.style.objectPosition = slot.position || 'center';
        img.dataset.wvAssetState = 'selected';
        img.classList.add('is-ready');
        resolve(true);
      };
      probe.onerror = function () {
        img.dataset.wvAssetState = 'load-error';
        resolve(false);
      };
      probe.src = slot.selectedPath;
    });
  }

  function responsiveKey (el) {
    const mobile = el.dataset.wvAssetMobile;
    const desktop = el.dataset.wvAssetDesktop;
    if (window.matchMedia('(max-width: 860px)').matches) return mobile || desktop || '';
    return desktop || mobile || '';
  }

  function applyResponsiveContainer (el) {
    const key = responsiveKey(el);
    const current = el.dataset.wvResolvedAsset || '';
    if (current === key && el.dataset.wvAssetState === 'selected') return Promise.resolve(true);
    const old = el.querySelector(':scope > .' + selectedMediaClass + '[data-wv-slot]');
    if (old) old.remove();
    el.classList.remove('wv-has-selected');
    return key ? loadIntoContainer(el, key, el.dataset.wvAssetClass || '') : Promise.resolve(false);
  }

  function apply (root) {
    root = root || document;
    const jobs = [];
    root.querySelectorAll('[data-wv-asset]').forEach(el => {
      const key = el.dataset.wvAsset;
      if (el.tagName === 'IMG') jobs.push(loadSourceImage(el, key));
      else jobs.push(loadIntoContainer(el, key, el.dataset.wvAssetClass || ''));
    });
    root.querySelectorAll('[data-wv-asset-desktop],[data-wv-asset-mobile]').forEach(el => {
      jobs.push(applyResponsiveContainer(el));
    });
    return Promise.all(jobs);
  }

  function loadScriptOnce (src) {
    const existing = document.querySelector('script[data-wv-bootstrap="' + src + '"]');
    if (existing) {
      if (existing.dataset.wvLoaded === '1') return Promise.resolve();
      return new Promise(function (resolve, reject) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
      });
    }
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset.wvBootstrap = src;
      script.onload = function () { script.dataset.wvLoaded = '1'; resolve(); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function bootClientTemplate () {
    const path = location.pathname.split('/').pop() || '';
    if (path !== 'site-plumbing-flagship-v1.html') return;

    const requested = new URLSearchParams(location.search).get('wvclient');
    if (!requested && !document.body.dataset.wvClient) document.body.dataset.wvClient = 'plumbing-demo';

    loadScriptOnce('website-ventures-client-contract.js')
      .then(function () { return loadScriptOnce('website-ventures-client-config.js'); })
      .then(function () { return loadScriptOnce('website-ventures-plumbing-template.js'); })
      .catch(function (err) {
        console.warn('[Website Ventures] client template bootstrap unavailable; hardcoded Plumbing fallback retained.', err);
        document.body.dataset.wvTemplateState = 'fallback';
      });
  }

  const ready = fetch(REGISTRY_URL, { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error('Selected asset registry could not load');
      return r.json();
    })
    .then(data => {
      registry = data;
      window.dispatchEvent(new CustomEvent('wv-assets-ready', { detail: data }));
      return data;
    })
    .catch(err => {
      console.warn('[Website Ventures] selected assets unavailable; coded placeholders retained.', err);
      return null;
    });

  window.WVSelectedAssets = {
    ready,
    get: function (key) { return getSlot(key); },
    isSelected: function (key) { return isSelected(getSlot(key)); },
    apply: function (root) { return ready.then(() => apply(root)); },
    loadIntoContainer: function (el, key, extraClass) { return ready.then(() => loadIntoContainer(el, key, extraClass)); }
  };

  function boot () {
    ready.then(() => apply(document));
    bootClientTemplate();
    let lastMobile = window.matchMedia('(max-width: 860px)').matches;
    window.addEventListener('resize', function () {
      const nowMobile = window.matchMedia('(max-width: 860px)').matches;
      if (nowMobile === lastMobile) return;
      lastMobile = nowMobile;
      document.querySelectorAll('[data-wv-asset-desktop],[data-wv-asset-mobile]').forEach(applyResponsiveContainer);
    }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
