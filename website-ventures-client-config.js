// Website Ventures — reusable client configuration loader
// Managed by ChatGPT (OpenAI).
// Purpose: keep customer identity/content/theme outside template markup.
// Usage: body[data-wv-client], ?wvclient=<slug>, and ?wvlocal=1 for a local draft preview.
(function () {
  'use strict';

  const SAFE_SLUG = /^[a-z0-9-]{1,64}$/;
  const CONFIG_ROOT = 'website-ventures-client-configs/';
  const DRAFT_PREFIX = 'wv_client_config_draft_v1_';
  const RESERVED_DRAFT_SLUGS = new Set(['plumbing-demo', 'plumbing-qa-blue']);

  function esc (value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function get (obj, path) {
    return String(path || '').split('.').reduce(function (v, key) {
      return v && Object.prototype.hasOwnProperty.call(v, key) ? v[key] : undefined;
    }, obj);
  }

  function validSlug (slug) { return SAFE_SLUG.test(String(slug || '')); }
  function draftKey (slug) { return DRAFT_PREFIX + String(slug || ''); }

  function darkenHex (hex, amount) {
    if (!/^#[0-9a-f]{6}$/i.test(String(hex || ''))) return '';
    const n = parseInt(hex.slice(1), 16);
    const factor = Math.max(0, Math.min(1, 1 - Number(amount || 0)));
    const r = Math.round(((n >> 16) & 255) * factor);
    const g = Math.round(((n >> 8) & 255) * factor);
    const b = Math.round((n & 255) * factor);
    return '#' + [r, g, b].map(function (v) { return v.toString(16).padStart(2, '0'); }).join('');
  }

  function normalizeLocalDraft (slug, config) {
    let safe = String(slug || '');
    if (RESERVED_DRAFT_SLUGS.has(safe) && config.status === 'client-draft') {
      safe = 'client-preview';
      config.id = safe;
      const field = document.getElementById('slug');
      if (field) field.value = safe;
    }
    config.theme = config.theme && typeof config.theme === 'object' ? config.theme : {};
    if (/^#[0-9a-f]{6}$/i.test(String(config.theme.accent || ''))) {
      config.theme.accentDeep = darkenHex(config.theme.accent, 0.42);
    }
    return safe;
  }

  function chooseSlug () {
    const query = new URLSearchParams(location.search).get('wvclient');
    const bodyDefault = document.body && document.body.dataset ? document.body.dataset.wvClient : '';
    const slug = query || bodyDefault || '';
    return validSlug(slug) ? slug : '';
  }

  function setTheme (config) {
    const theme = config.theme || {};
    const allowed = {
      paper: '--paper',
      paper2: '--paper-2',
      ink: '--ink',
      muted: '--muted',
      accent: '--red',
      accentDeep: '--red-deep',
      chrome: '--chrome',
      night: '--night'
    };
    Object.keys(allowed).forEach(function (key) {
      const value = theme[key];
      if (typeof value === 'string' && value.trim()) {
        document.documentElement.style.setProperty(allowed[key], value.trim());
      }
    });
  }

  function bindText (config) {
    document.querySelectorAll('[data-wv-bind]').forEach(function (el) {
      const value = get(config, el.dataset.wvBind);
      if (value == null) return;
      el.textContent = String(value);
    });
  }

  function bindHref (config) {
    document.querySelectorAll('[data-wv-href]').forEach(function (el) {
      const value = get(config, el.dataset.wvHref);
      if (typeof value !== 'string' || !value.trim()) return;
      const href = value.trim();
      if (/^(#|tel:|mailto:|https?:\/\/)/i.test(href)) el.setAttribute('href', href);
    });
  }

  function renderServices (config) {
    const holder = document.querySelector('[data-wv-services]');
    if (!holder || !Array.isArray(config.services) || !config.services.length) return;
    holder.innerHTML = config.services.slice(0, 6).map(function (service, i) {
      const n = String(i + 1).padStart(2, '0');
      return '<article class="service"><div class="icon">' + n + '</div><div><h3>' + esc(service.title) + '</h3><p>' + esc(service.description) + '</p><small>' + esc(service.label || 'Meer informatie →') + '</small></div></article>';
    }).join('');
  }

  function apply (config, slug, source) {
    setTheme(config);
    bindText(config);
    bindHref(config);
    renderServices(config);
    if (config.seo && typeof config.seo.title === 'string' && config.seo.title.trim()) {
      document.title = config.seo.title.trim();
    }
    document.body.dataset.wvClientActive = slug;
    document.body.dataset.wvClientState = 'ready';
    document.body.dataset.wvClientSource = source || 'repo';
    window.dispatchEvent(new CustomEvent('wv-client-config-ready', { detail: { slug: slug, config: config, source: source || 'repo' } }));
    return config;
  }

  function readDraft (slug) {
    if (!validSlug(slug)) return null;
    try {
      const raw = localStorage.getItem(draftKey(slug));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveDraft (slug, config) {
    if (!validSlug(slug) || !config || typeof config !== 'object') return false;
    const safeSlug = normalizeLocalDraft(slug, config);
    if (!validSlug(safeSlug)) return false;
    try {
      localStorage.setItem(draftKey(safeSlug), JSON.stringify(config));
      return true;
    } catch (e) { return false; }
  }

  const ready = new Promise(function (resolve) {
    function boot () {
      const slug = chooseSlug();
      if (!slug) {
        document.body.dataset.wvClientState = 'fallback';
        resolve(null);
        return;
      }

      const localMode = new URLSearchParams(location.search).get('wvlocal') === '1';
      if (localMode) {
        const draft = readDraft(slug);
        if (draft) {
          resolve(apply(draft, slug, 'local-draft'));
          return;
        }
        console.warn('[Website Ventures] local client draft unavailable; hardcoded template fallback retained.');
        document.body.dataset.wvClientState = 'draft-missing';
        document.body.dataset.wvClientSource = 'local-draft';
        resolve(null);
        return;
      }

      fetch(CONFIG_ROOT + slug + '.json', { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error('Client config not found');
          return r.json();
        })
        .then(function (config) { resolve(apply(config, slug, 'repo')); })
        .catch(function (err) {
          console.warn('[Website Ventures] client config unavailable; hardcoded template fallback retained.', err);
          document.body.dataset.wvClientState = 'fallback';
          document.body.dataset.wvClientSource = 'repo';
          resolve(null);
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
  });

  window.WVClientConfig = {
    ready: ready,
    apply: apply,
    readDraft: readDraft,
    saveDraft: saveDraft,
    draftKey: draftKey,
    validSlug: validSlug,
    darkenHex: darkenHex
  };
})();
